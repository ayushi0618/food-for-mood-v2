// Mood Conveyor — Food for Mood's take on the 21st.dev sushi conveyor menu
// (@dhxwhy/components/sushi-conveyor-menu). Built from scratch for this app:
// instead of sushi plates, real dishes from the Food for Mood catalog ride an
// oval belt. Hover pauses the belt, drag scrubs it, a flick spins it with
// inertia, and tapping a plate opens its details with an Add to cart button.
// Price tiers become colour-coded plate rings, with a legend underneath.
// No animation library — plain requestAnimationFrame + easing. Keyboard:
// arrow keys step between plates, Enter opens a plate, Escape closes it.
// With prefers-reduced-motion, the belt never auto-turns; the step buttons
// and arrow keys move it plate by plate instead.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play, ChevronLeft, ChevronRight, X, Star, Clock, Users, ShoppingBag, Check } from 'lucide-react';

import DISHES, { findDish } from '../data/dishes';
import { addToCart, notifyCartUpdated } from '../services/api';
import { imgFallback } from '../utils/img';

// Eight plates, one per mood story — a mix of price tiers so every ring
// colour shows up on the belt. Names must exist in the dish catalog.
const BELT_PLATES = [
  { name: 'Khichdi', moodLine: 'for slow, low-energy days' },
  { name: 'Biryani', moodLine: 'for days worth celebrating' },
  { name: 'Maggi', moodLine: 'for nostalgic, stressed-out evenings' },
  { name: 'Paneer Butter Masala', moodLine: 'for cozy, romantic dinners' },
  { name: 'Masala Dosa', moodLine: 'for happy, hungry mornings' },
  { name: 'Chocolate Brownie', moodLine: 'for sad days that need chocolate' },
  { name: 'Masala Chai', moodLine: 'for tired minds that need a pause' },
  { name: 'Chole Bhature', moodLine: 'for loud, celebratory appetites' },
];

function tierOf(price) {
  if (price < 150) return { key: 'comfort', label: 'Under ₹150 · Everyday comfort' };
  if (price < 200) return { key: 'mid', label: '₹150–199 · Little treats' };
  return { key: 'celebration', label: '₹200+ · Celebration plates' };
}

const TIERS = [
  { key: 'comfort', label: 'Under ₹150 · Everyday comfort' },
  { key: 'mid', label: '₹150–199 · Little treats' },
  { key: 'celebration', label: '₹200+ · Celebration plates' },
];

const STEP = (Math.PI * 2) / 8;
const CRUISE = 0.22; // rad/s — one full loop in ~28s

function MoodConveyor({ onToast }) {
  const plates = useMemo(() => {
    const picked = BELT_PLATES.map((p) => {
      const dish = findDish(p.name) || DISHES.find((d) => d.name === p.name);
      return dish ? { dish, moodLine: p.moodLine } : null;
    }).filter(Boolean);
    return picked;
  }, []);

  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [size, setSize] = useState({ w: 900, h: 320 });

  const trackRef = useRef(null);
  const plateRefs = useRef([]);
  const angleRef = useRef(Math.PI / 2); // plate 0 starts at the front
  const velocityRef = useRef(0);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const flickRef = useRef(0);
  const activeRef = useRef(0);
  const keyboardNavRef = useRef(false);

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const count = plates.length;
  const step = count ? (Math.PI * 2) / count : STEP;

  // Measure the track so the oval scales with the screen.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const update = () =>
      setSize({ w: el.clientWidth || 900, h: el.clientHeight || 320 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Belt animation loop: positions every plate on the oval each frame.
  useEffect(() => {
    let raf;
    let last = performance.now();
    const place = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const el = trackRef.current;
      if (el) {
        const w = el.clientWidth || size.w;
        const h = el.clientHeight || size.h;
        const cx = w / 2;
        const cy = h / 2;
        const rx = Math.max(w / 2 - 100, 40);
        const ry = Math.max(h / 2 - 95, 30);

        if (!reducedMotion) {
          const target = pausedRef.current || draggingRef.current ? 0 : CRUISE;
          // Ease toward cruise speed (or 0 when paused/dragging), then let
          // a flick's velocity decay back toward cruise on its own.
          velocityRef.current += (target - velocityRef.current) * Math.min(dt * 2.2, 1);
          if (!draggingRef.current) {
            angleRef.current += velocityRef.current * dt;
          }
        }

        let front = 0;
        let frontDepth = -Infinity;
        plateRefs.current.forEach((node, i) => {
          if (!node) return;
          const theta = angleRef.current + i * step;
          const x = cx + rx * Math.cos(theta);
          const y = cy + ry * Math.sin(theta);
          const depth = (Math.sin(theta) + 1) / 2; // 0 = back, 1 = front
          const scale = 0.68 + depth * 0.38;
          node.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
          node.style.opacity = (0.45 + depth * 0.55).toFixed(2);
          node.style.zIndex = String(Math.round(depth * 10));
          if (depth > frontDepth) {
            frontDepth = depth;
            front = i;
          }
        });
        if (front !== activeRef.current) {
          activeRef.current = front;
          setActive(front);
        }
      }
      raf = requestAnimationFrame(place);
    };
    raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, size.w, size.h, step]);

  const setPausedBoth = (value) => {
    pausedRef.current = value;
    setPaused(value);
  };

  // Step the belt so plate i sits at the front (bottom of the oval).
  const bringToFront = useCallback(
    (i) => {
      angleRef.current = Math.PI / 2 - i * step;
      velocityRef.current = 0;
      activeRef.current = i;
      setActive(i);
    },
    [step]
  );

  const stepPlate = useCallback(
    (dir) => {
      keyboardNavRef.current = true;
      const next = (activeRef.current + dir + count) % count;
      bringToFront(next);
      requestAnimationFrame(() => plateRefs.current[next]?.focus());
    },
    [bringToFront, count]
  );

  const onPlateKeyDown = (e, i) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepPlate(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepPlate(-1);
    }
  };

  // Drag to scrub, flick to spin.
  // NOTE: deliberately no setPointerCapture here — capturing the pointer to
  // the track retargets the click event to the track, so tapping a plate
  // would pause the belt without opening its dialog (caught live 1 Nov 2026).
  // Dragging still works: pointermove bubbles up from the plates to the track.
  const onPointerDown = (e) => {
    draggingRef.current = true;
    dragMovedRef.current = 0;
    lastXRef.current = e.clientX;
    lastTRef.current = performance.now();
    flickRef.current = 0;
  };
  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    const now = performance.now();
    const dx = e.clientX - lastXRef.current;
    const dt = Math.max(now - lastTRef.current, 1);
    dragMovedRef.current += Math.abs(dx);
    angleRef.current += dx * 0.005;
    flickRef.current = (dx / dt) * 0.005 * 1000; // rad/s estimate
    lastXRef.current = e.clientX;
    lastTRef.current = now;
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    velocityRef.current = Math.max(Math.min(flickRef.current, 2.5), -2.5);
  };

  const onPlateClick = (plate) => {
    // A drag that actually moved is a spin, not a tap.
    if (dragMovedRef.current > 6) {
      dragMovedRef.current = 0;
      return;
    }
    setSelected(plate);
  };

  // Escape closes the plate dialog.
  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const handleAdd = async (dish) => {
    if (adding || added) return;
    setAdding(true);
    try {
      await addToCart({
        food: dish.name,
        reason: `Picked off the mood belt — ${dish.blurb}`,
        price: dish.price,
        incident: 'Picked from the mood conveyor belt',
      });
      notifyCartUpdated();
      setAdded(true);
      onToast?.('Added to cart', `${dish.name} is waiting in your cart.`);
      setTimeout(() => setAdded(false), 1600);
    } catch {
      onToast?.('Could not add', 'The kitchen is unreachable right now.');
    } finally {
      setAdding(false);
    }
  };

  if (count === 0) return null;
  const frontPlate = plates[active];

  return (
    <section className="section belt21-section" style={{ paddingTop: 0 }}>
      <div className="section-head">
        <span className="eyebrow">Fresh off the belt</span>
        <h2>Today&rsquo;s mood belt</h2>
        <p>
          Can&rsquo;t decide how you feel? Let the belt decide. Dishes for every
          mood ride past — hover to pause it, drag to spin it, tap a plate to
          make it yours.
        </p>
      </div>

      <div className="belt21-wrap">
        <div
          className="belt21-track"
          ref={trackRef}
          onMouseEnter={() => setPausedBoth(true)}
          onMouseLeave={() => setPausedBoth(false)}
          onFocus={() => setPausedBoth(true)}
          onBlur={() => setPausedBoth(false)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="region"
          aria-label="Mood conveyor belt — dishes ride past, tap a plate for details"
        >
          <div className="belt21-oval" aria-hidden />
          {plates.map(({ dish, moodLine }, i) => {
            const tier = tierOf(dish.price);
            return (
              <button
                key={dish.name}
                ref={(node) => {
                  plateRefs.current[i] = node;
                }}
                type="button"
                className={`belt21-plate tier-${tier.key} ${i === active ? 'is-front' : ''}`}
                tabIndex={i === active ? 0 : -1}
                aria-label={`${dish.name}, ₹${dish.price}, ${moodLine}`}
                onKeyDown={(e) => onPlateKeyDown(e, i)}
                onClick={() => onPlateClick({ dish, moodLine })}
              >
                <span className="belt21-disc">
                  <img src={dish.image} alt="" loading="lazy" onError={imgFallback} draggable={false} />
                </span>
                <span className="belt21-chip">
                  <b>{dish.name}</b>
                  <span>₹{dish.price}</span>
                </span>
                <span className="belt21-mood">{moodLine}</span>
              </button>
            );
          })}
        </div>

        <div className="belt21-caption" aria-live="polite">
          <span className="belt21-now">Now passing:</span>{' '}
          <b>{frontPlate.dish.name}</b> — {frontPlate.moodLine} · ₹{frontPlate.dish.price}
        </div>

        <div className="belt21-controls">
          <button type="button" className="btn btn-ghost belt21-btn" onClick={() => stepPlate(-1)} aria-label="Previous plate">
            <ChevronLeft size={16} /> Prev plate
          </button>
          <button
            type="button"
            className="btn btn-ghost belt21-btn"
            onClick={() => setPausedBoth(!paused)}
            aria-pressed={paused}
          >
            {paused ? <><Play size={16} /> Resume belt</> : <><Pause size={16} /> Pause belt</>}
          </button>
          <button type="button" className="btn btn-ghost belt21-btn" onClick={() => stepPlate(1)} aria-label="Next plate">
            Next plate <ChevronRight size={16} />
          </button>
        </div>

        <p className="belt21-hint">
          Hover to pause · drag to spin · tap a plate to order
        </p>

        <div className="belt21-legend" aria-label="Price tiers">
          {TIERS.map((t) => (
            <span key={t.key} className="belt21-legend-item">
              <i className={`belt21-dot tier-${t.key}`} /> {t.label}
            </span>
          ))}
        </div>
      </div>

      {selected && (
        <div className="belt21-backdrop" onClick={() => setSelected(null)}>
          <div
            className="belt21-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.dish.name} details`}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="belt21-close" onClick={() => setSelected(null)} aria-label="Close details">
              <X size={18} />
            </button>
            <img src={selected.dish.image} alt={selected.dish.name} onError={imgFallback} />
            <div className="belt21-dialog-body">
              <span className="eyebrow">Best when you&rsquo;re feeling: {selected.dish.moods.slice(0, 3).join(' · ')}</span>
              <h3>{selected.dish.name}</h3>
              <p>{selected.dish.blurb}</p>
              <p className="belt21-dialog-mood">On the belt because it&rsquo;s {selected.moodLine}.</p>
              <div className="mic21-meta">
                {selected.dish.rating && (
                  <span className="mic21-rating">
                    <Star size={12} fill="currentColor" /> {selected.dish.rating.toFixed(1)}
                  </span>
                )}
                <span className="mic21-meta-item"><Users size={13} /> {selected.dish.serves || 'Serves 1'}</span>
                <span className="mic21-meta-item"><Clock size={13} /> {selected.dish.prepTime || 20} min</span>
                <span className="mic21-cuisine">{selected.dish.cuisine}</span>
              </div>
              <div className="belt21-dialog-foot">
                <b className="belt21-dialog-price">₹{selected.dish.price}</b>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAdd(selected.dish)}
                  disabled={adding}
                >
                  {added ? <><Check size={16} /> Added</> : <><ShoppingBag size={16} /> {adding ? 'Adding…' : 'Add to order'}</>}
                </button>
                <Link to="/menu" className="btn btn-ghost" onClick={() => setSelected(null)}>
                  See full menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MoodConveyor;
