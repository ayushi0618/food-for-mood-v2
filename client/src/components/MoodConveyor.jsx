// Mood Conveyor — Food for Mood's version of the 21st.dev sushi conveyor
// menu (@dhxwhy/components/sushi-conveyor-menu, MIT). Same UI, rebuilt from
// scratch for this app: a two-column hero — text on the left, a charcoal
// stadium belt with a white counter island on the right. Real dishes from
// the Food for Mood catalog ride the belt instead of sushi; hover pauses it,
// drag scrubs it, a flick spins it with inertia, and tapping a plate opens
// the two-column dialog with an Add to order button.
// Price tiers are thin coloured rings + a legend, exactly like the original:
// five bands, one dot + label each. Plates ride the stadium centreline
// (straight runs + semicircular ends), front plates slightly larger than
// back ones, photos always upright. Keyboard: arrow keys step between
// plates, Enter opens a plate, Escape closes it. With prefers-reduced-motion
// the belt never auto-turns; the step buttons and arrow keys move it.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

import DISHES, { findDish } from '../data/dishes';
import { addToCart, notifyCartUpdated } from '../services/api';
import { imgFallback } from '../utils/img';

// Eight plates — price bands give all five tier colours on the belt.
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

// Tier bands + ring colours, mirroring the original's five-tier legend.
function tierOf(price) {
  if (price < 100) return { key: 't1', label: 'Under ₹100', color: '#C2410C' };
  if (price < 150) return { key: 't2', label: '₹100–149', color: '#0F766E' };
  if (price < 180) return { key: 't3', label: '₹150–179', color: '#334155' };
  if (price < 200) return { key: 't4', label: '₹180–199', color: '#D97706' };
  return { key: 't5', label: '₹200+', color: '#F97316' };
}

const TIERS = [
  { key: 't1', label: 'Under ₹100', color: '#C2410C' },
  { key: 't2', label: '₹100–149', color: '#0F766E' },
  { key: 't3', label: '₹150–179', color: '#334155' },
  { key: 't4', label: '₹180–199', color: '#D97706' },
  { key: 't5', label: '₹200+', color: '#F97316' },
];

const LOOP_SECONDS = 30; // original: one full loop in ~30s

function MoodConveyor({ onToast }) {
  const plates = useMemo(() => {
    return BELT_PLATES.map((p) => {
      const dish = findDish(p.name) || DISHES.find((d) => d.name === p.name);
      return dish ? { dish, moodLine: p.moodLine } : null;
    }).filter(Boolean);
  }, []);

  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [addedFlash, setAddedFlash] = useState(false);
  const [size, setSize] = useState({ w: 750, h: 360 });

  const trackRef = useRef(null);
  const plateRefs = useRef([]);
  const sRef = useRef(0); // distance travelled along the belt, px
  const velocityRef = useRef(0); // px/s
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragMovedRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const flickRef = useRef(0);
  const activeRef = useRef(0);

  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const count = plates.length;
  const plateD = size.w < 560 ? 100 : 136;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const update = () =>
      setSize({ w: el.clientWidth || 750, h: el.clientHeight || 360 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Stadium-centreline geometry for the current track size.
  const geom = useMemo(() => {
    const { w, h } = size;
    const cx = w / 2;
    const cy = h / 2;
    const islandW = 0.55 * w;
    const islandH = 0.25 * h;
    const Wm = (w + islandW) / 2;
    const Hm = (h + islandH) / 2;
    const r = Hm / 2;
    const straight = Wm - Hm;
    const semi = Math.PI * r;
    const perimeter = 2 * straight + 2 * semi;
    const frontCenter = straight + semi + straight / 2;
    return { cx, cy, Wm, Hm, r, straight, semi, perimeter, frontCenter, islandW, islandH };
  }, [size]);

  const posAt = useCallback(
    (s) => {
      const { cx, cy, Wm, r, straight, semi, perimeter } = geom;
      const t = ((s % perimeter) + perimeter) % perimeter;
      if (t < straight) {
        return { x: cx - Wm / 2 + r + t, y: cy - r, depth: 0 };
      }
      if (t < straight + semi) {
        const phi = -Math.PI / 2 + (t - straight) / r;
        return {
          x: cx + Wm / 2 - r + r * Math.cos(phi),
          y: cy + r * Math.sin(phi),
          depth: (Math.sin(phi) + 1) / 2,
        };
      }
      if (t < 2 * straight + semi) {
        return {
          x: cx + Wm / 2 - r - (t - straight - semi),
          y: cy + r,
          depth: 1,
        };
      }
      const phi = Math.PI / 2 + (t - 2 * straight - semi) / r;
      return {
        x: cx - Wm / 2 + r + r * Math.cos(phi),
        y: cy + r * Math.sin(phi),
        depth: (Math.sin(phi) + 1) / 2,
      };
    },
    [geom]
  );

  // Belt animation loop.
  useEffect(() => {
    if (count === 0) return undefined;
    let raf;
    let last = performance.now();
    const spacing = geom.perimeter / count;
    const place = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!reducedMotion) {
        const cruise = geom.perimeter / LOOP_SECONDS;
        const target = pausedRef.current || draggingRef.current ? 0 : cruise;
        velocityRef.current += (target - velocityRef.current) * Math.min(dt * 2.2, 1);
        if (!draggingRef.current) sRef.current += velocityRef.current * dt;
      }
      let front = 0;
      let frontDist = Infinity;
      plateRefs.current.forEach((node, i) => {
        if (!node) return;
        const s = sRef.current + i * spacing;
        const { x, y, depth } = posAt(s);
        const scale = 0.86 + depth * 0.19;
        node.style.transform = `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        node.style.opacity = (0.65 + depth * 0.35).toFixed(2);
        node.style.zIndex = String(3 + Math.round(depth * 10));
        const d = Math.abs(
          ((s - geom.frontCenter) % geom.perimeter + geom.perimeter * 1.5) % geom.perimeter
        );
        const dist = Math.min(d, geom.perimeter - d);
        if (dist < frontDist) {
          frontDist = dist;
          front = i;
        }
      });
      if (front !== activeRef.current) {
        activeRef.current = front;
        setActive(front);
      }
      raf = requestAnimationFrame(place);
    };
    raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, geom, posAt, count]);

  const setPausedBoth = (value) => {
    pausedRef.current = value;
    setPaused(value);
  };

  const bringToFront = useCallback(
    (i) => {
      const spacing = geom.perimeter / count;
      sRef.current = geom.frontCenter - i * spacing;
      velocityRef.current = 0;
      activeRef.current = i;
      setActive(i);
    },
    [geom, count]
  );

  const stepPlate = useCallback(
    (dir) => {
      const next = (activeRef.current + dir + count) % count;
      bringToFront(next);
      requestAnimationFrame(() => plateRefs.current[next]?.focus());
    },
    [bringToFront, count]
  );

  const onPlateKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepPlate(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepPlate(-1);
    }
  };

  // Drag to scrub, flick to spin. No pointer capture: capturing the pointer
  // to the track retargets clicks to the track, so tapping a plate would
  // pause the belt without opening its dialog (caught live 1 Nov 2026).
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
    sRef.current += dx;
    flickRef.current = (dx / dt) * 1000;
    lastXRef.current = e.clientX;
    lastTRef.current = now;
  };
  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    velocityRef.current = Math.max(
      Math.min(flickRef.current, geom.perimeter / 6),
      -geom.perimeter / 6
    );
  };

  const onPlateClick = (plate) => {
    if (dragMovedRef.current > 6) {
      dragMovedRef.current = 0;
      return;
    }
    setSelected(plate);
  };

  useEffect(() => {
    if (!selected) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const handleAdd = async (dish) => {
    if (adding) return;
    setAdding(true);
    try {
      await addToCart({
        food: dish.name,
        reason: `Picked off the mood belt — ${dish.blurb}`,
        price: dish.price,
        incident: 'Picked from the mood conveyor belt',
      });
      notifyCartUpdated();
      setOrderCount((c) => c + 1);
      setAddedFlash(true);
      setTimeout(() => setAddedFlash(false), 2400);
      setSelected(null);
      onToast?.('Added to cart', `${dish.name} is waiting in your cart.`);
    } catch {
      onToast?.('Could not add', 'The kitchen is unreachable right now.');
    } finally {
      setAdding(false);
    }
  };

  if (count === 0) return null;
  const displayIdx = hovered !== null ? hovered : active;
  const displayPlate = plates[displayIdx];
  const selectedIdx = selected ? plates.findIndex((p) => p.dish.name === selected.dish.name) : -1;

  return (
    <section className="belt21-hero" aria-label="Today's mood belt">
      <div className="belt21-order-row">
        {addedFlash && <span className="belt21-added">Added</span>}
        <span className="belt21-order">
          <ShoppingBag size={15} />
          Your order: {orderCount} plate{orderCount === 1 ? '' : 's'}
        </span>
      </div>

      <div className="belt21-hero-grid">
        <div className="belt21-copy">
          <span className="belt21-eyebrow">Food for Mood · Mood Belt</span>
          <h2>Every mood has a plate. Yours is coming around.</h2>
          <div className="belt21-legend" aria-label="Price tiers">
            {TIERS.map((t) => (
              <span key={t.key} className="belt21-legend-item">
                <i style={{ borderColor: t.color }} /> {t.label}
              </span>
            ))}
          </div>
          <p className="belt21-active" aria-live="polite">
            <b>
              {displayPlate.dish.name} · ₹{displayPlate.dish.price}
            </b>
            <span>{displayPlate.moodLine} — {displayPlate.dish.blurb}</span>
          </p>
          <p className="belt21-caption">
            Hover to stop the belt, flick to spin it, pick a plate to order.
          </p>
          <Link to="/menu" className="belt21-menu-btn">
            See full menu
          </Link>
        </div>

        <div className="belt21-belt-col">
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
            <div className="belt21-track-surface" aria-hidden />
            <div
              className="belt21-island"
              style={{ width: geom.islandW, height: geom.islandH }}
              aria-hidden
            />
            {plates.map(({ dish, moodLine }, i) => {
              const tier = tierOf(dish.price);
              const isDisplay = i === displayIdx;
              return (
                <button
                  key={dish.name}
                  ref={(node) => {
                    plateRefs.current[i] = node;
                  }}
                  type="button"
                  className={`belt21-plate ${isDisplay ? 'is-display' : ''}`}
                  style={{ width: plateD, height: plateD }}
                  tabIndex={i === active ? 0 : -1}
                  aria-label={`${dish.name}, ₹${dish.price}, ${moodLine}`}
                  onKeyDown={onPlateKeyDown}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  onClick={() => onPlateClick({ dish, moodLine })}
                >
                  <span
                    className="belt21-photo"
                    style={{ boxShadow: `0 0 0 3px ${tier.color}, 0 10px 24px rgba(0, 0, 0, 0.25)` }}
                  >
                    <img src={dish.image} alt="" loading="lazy" onError={imgFallback} draggable={false} />
                  </span>
                  <span className="belt21-chip">
                    <i style={{ background: tier.color }} />
                    {dish.name}
                    <span>₹{dish.price}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="belt21-controls">
            <button type="button" className="belt21-ctrl" onClick={() => stepPlate(-1)} aria-label="Previous plate">
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={`belt21-ctrl ${paused ? 'is-pressed' : ''}`}
              onClick={() => setPausedBoth(!paused)}
              aria-label={paused ? 'Play belt' : 'Pause belt'}
              aria-pressed={paused}
            >
              {paused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <button type="button" className="belt21-ctrl" onClick={() => stepPlate(1)} aria-label="Next plate">
              <ChevronRight size={18} />
            </button>
          </div>
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
            <button type="button" className="belt21-dialog-close" onClick={() => setSelected(null)}>
              Close ×
            </button>
            <div className="belt21-dialog-photo">
              <span
                className="belt21-dialog-img"
                style={{ boxShadow: `0 0 0 4px ${tierOf(selected.dish.price).color}, 0 20px 50px rgba(0, 0, 0, 0.25)` }}
              >
                <img src={selected.dish.image} alt={selected.dish.name} onError={imgFallback} />
              </span>
            </div>
            <div className="belt21-dialog-body">
              <span className="belt21-dialog-index">
                <i style={{ background: tierOf(selected.dish.price).color }} />
                {String(selectedIdx + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
              <h3>{selected.dish.name}</h3>
              <p>{selected.dish.blurb}</p>
              <p className="belt21-dialog-mood">On the belt because it&rsquo;s {selected.moodLine}.</p>
              <div className="belt21-dialog-tags">
                <span>{selected.dish.serves || 'Serves 1'}</span>
                <span>{selected.dish.cuisine}</span>
                {selected.dish.moods?.[0] && <span style={{ textTransform: 'capitalize' }}>{selected.dish.moods[0]}</span>}
              </div>
              <div className="belt21-dialog-foot">
                <b>₹{selected.dish.price}</b>
                <button
                  type="button"
                  className="belt21-add-btn"
                  onClick={() => handleAdd(selected.dish)}
                  disabled={adding}
                >
                  + {adding ? 'Adding…' : 'Add to order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MoodConveyor;
