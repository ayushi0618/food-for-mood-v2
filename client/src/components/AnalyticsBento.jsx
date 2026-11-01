// Analytics Bento — Food for Mood's take on the 21st.dev analytics bento
// (@romanvasnev/components/analytics-bento). Same four-tile idea, rebuilt
// from scratch in SVG over the user's OWN data (no chart library, no demo
// numbers): a spend line you can scrub, check-ins vs orders by hour of day,
// a mood treemap that re-flows between periods, and a monthly radar.
// Everything here is computed from journal check-ins + orders; empty months
// and empty periods honestly show zero, never invented activity.
import { useMemo, useRef, useState, useEffect } from 'react';
import { moodColor } from '../utils/mood';

const W = 560;
const H = 200;
const PAD = { top: 12, right: 12, bottom: 26, left: 12 };

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function orderDate(o) {
  const ts = o.createdAt || o.ts || o.date;
  return ts ? new Date(ts) : null;
}

function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function useCountUp(value) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 800, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return shown;
}

function AnalyticsBento({ journal = [], orders = [] }) {
  const [scrub, setScrub] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [radarYear, setRadarYear] = useState(() => new Date().getFullYear());
  const chartRef = useRef(null);

  // --- Spend line: daily spend, last 30 days -------------------------------
  const spendSeries = useMemo(() => {
    const buckets = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push({
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        key: dayKey(d.getTime()),
        spend: 0,
        count: 0,
      });
    }
    const map = Object.fromEntries(buckets.map((b) => [b.key, b]));
    orders.forEach((o) => {
      const d = orderDate(o);
      const b = d && map[dayKey(d.getTime())];
      if (b) {
        b.spend += Number(o.price) || 0;
        b.count += 1;
      }
    });
    return buckets;
  }, [orders]);

  const spend30 = spendSeries.reduce((s, b) => s + b.spend, 0);
  const orders30 = spendSeries.reduce((s, b) => s + b.count, 0);
  const avgOrder = orders30 ? Math.round(spend30 / orders30) : 0;
  const spendShown = useCountUp(spend30);

  const spendMax = Math.max(...spendSeries.map((b) => b.spend), 1);
  const spendPts = spendSeries.map((b, i) => [
    PAD.left + (i / (spendSeries.length - 1)) * (W - PAD.left - PAD.right),
    PAD.top + (1 - b.spend / spendMax) * (H - PAD.top - PAD.bottom),
  ]);
  const spendLine = smoothPath(spendPts);

  const onScrubMove = (e) => {
    const rect = chartRef.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    setScrub(Math.round(frac * (spendSeries.length - 1)));
  };

  // --- Craving waves: check-ins vs orders by hour of day -------------------
  const hourly = useMemo(() => {
    const checkins = Array(24).fill(0);
    const ord = Array(24).fill(0);
    journal.forEach((j) => {
      const h = new Date(j.ts).getHours();
      if (!Number.isNaN(h)) checkins[h] += 1;
    });
    orders.forEach((o) => {
      const d = orderDate(o);
      if (d && !Number.isNaN(d.getHours())) ord[d.getHours()] += 1;
    });
    return { checkins, ord };
  }, [journal, orders]);

  const hourMax = Math.max(...hourly.checkins, ...hourly.ord, 1);
  const wavePts = (arr) =>
    arr.map((v, h) => [
      PAD.left + (h / 23) * (W - PAD.left - PAD.right),
      PAD.top + (1 - v / hourMax) * (H - PAD.top - PAD.bottom),
    ]);
  const checkinWave = smoothPath(wavePts(hourly.checkins));
  const orderWave = smoothPath(wavePts(hourly.ord));
  const baseY = PAD.top + (H - PAD.top - PAD.bottom);
  const peakHour = hourly.checkins.indexOf(Math.max(...hourly.checkins));

  // --- Mood treemap: re-flows between periods ------------------------------
  const periods = [
    { key: '7d', label: 'Last 7 days', days: 7 },
    { key: '30d', label: 'Last 30 days', days: 30 },
    { key: 'all', label: 'All time', days: Infinity },
  ];
  const treemap = useMemo(() => {
    const { days } = periods.find((p) => p.key === period) || periods[1];
    const cutoff = Number.isFinite(days) ? Date.now() - days * 86400000 : 0;
    const moodCounts = {};
    journal.forEach((j) => {
      if (j.ts >= cutoff) moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
    });
    const moods = Object.entries(moodCounts)
      .map(([mood, count]) => ({ mood, count, color: moodColor(mood) }))
      .sort((a, b) => b.count - a.count);
    const dishCounts = {};
    journal.forEach((j) => {
      if (j.ts >= cutoff && j.food) dishCounts[j.food] = (dishCounts[j.food] || 0) + 1;
    });
    orders.forEach((o) => {
      const d = orderDate(o);
      if (d && d.getTime() >= cutoff && o.food) dishCounts[o.food] = (dishCounts[o.food] || 0) + 1;
    });
    const dishes = Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
    return { moods, dishes };
  }, [journal, orders, period]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Monthly radar: check-ins per month, this year vs last ---------------
  const radar = useMemo(() => {
    const months = Array(12).fill(0);
    let topMood = null;
    const moodCounts = {};
    journal.forEach((j) => {
      const d = new Date(j.ts);
      if (d.getFullYear() === radarYear) {
        months[d.getMonth()] += 1;
        moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
      }
    });
    const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length) topMood = { mood: sorted[0][0], count: sorted[0][1] };
    const total = months.reduce((s, v) => s + v, 0);
    return { months, total, topMood };
  }, [journal, radarYear]);

  const radarMax = Math.max(...radar.months, 1);
  const rcx = 110;
  const rcy = 100;
  const rMax = 78;
  const radarPoint = (i, value) => {
    const angle = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    const r = (value / radarMax) * rMax;
    return [rcx + r * Math.cos(angle), rcy + r * Math.sin(angle)];
  };
  const radarPoly = radar.months.map((v, i) => radarPoint(i, v).join(',')).join(' ');
  const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  const scrubBucket = scrub !== null ? spendSeries[scrub] : null;

  return (
    <section aria-label="Insights bento dashboard">
      <div className="abento-grid">
        {/* Spend line with scrub */}
        <div className="abento-tile abento-span-2">
          <div className="abento-tile-head">
            <span className="abento-label">Total spend</span>
            <span className="abento-delta">Avg. order ₹{avgOrder}</span>
          </div>
          <div className="abento-value">₹{spendShown.toLocaleString('en-IN')}</div>
          <p className="abento-note">
            {orders30} order{orders30 === 1 ? '' : 's'} · last 30 days · drag or hover the line to inspect a day
          </p>
          <div
            className="abento-chart"
            ref={chartRef}
            tabIndex={0}
            role="slider"
            aria-label="Daily spend, last 30 days — use arrow keys to inspect a day"
            aria-valuemin={0}
            aria-valuemax={spendSeries.length - 1}
            aria-valuenow={scrub ?? 0}
            onPointerMove={onScrubMove}
            onPointerLeave={() => setScrub(null)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') setScrub(Math.min((scrub ?? 0) + 1, spendSeries.length - 1));
              if (e.key === 'ArrowLeft') setScrub(Math.max((scrub ?? 0) - 1, 0));
            }}
          >
            {scrubBucket && (
              <div
                className="abento-tooltip"
                style={{ left: `${(scrub / (spendSeries.length - 1)) * 100}%` }}
              >
                {scrubBucket.label} · ₹{scrubBucket.spend}
                {scrubBucket.count ? ` · ${scrubBucket.count} order${scrubBucket.count === 1 ? '' : 's'}` : ' · no orders'}
              </div>
            )}
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Spend per day line chart">
              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={PAD.top + f * (H - PAD.top - PAD.bottom)}
                  y2={PAD.top + f * (H - PAD.top - PAD.bottom)}
                  stroke="#EBDFCE"
                  strokeDasharray="3 3"
                />
              ))}
              <path d={`${spendLine} L ${spendPts[spendPts.length - 1][0]},${baseY} L ${spendPts[0][0]},${baseY} Z`} fill="#C2571B" fillOpacity={0.14} />
              <path d={spendLine} fill="none" stroke="#C2571B" strokeWidth={3} strokeLinecap="round" />
              {scrub !== null && (
                <g>
                  <line
                    x1={spendPts[scrub][0]}
                    x2={spendPts[scrub][0]}
                    y1={PAD.top}
                    y2={baseY}
                    stroke="#D9A441"
                    strokeDasharray="4 4"
                  />
                  <circle cx={spendPts[scrub][0]} cy={spendPts[scrub][1]} r={6} fill="#C2571B" stroke="#F9E8D9" strokeWidth={2} />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Craving waves by hour */}
        <div className="abento-tile">
          <span className="abento-label">When you crave</span>
          <div className="abento-value" style={{ fontSize: '1.4rem', marginTop: 4 }}>
            Peak: {peakHour === 0 ? '12 AM' : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`}
          </div>
          <p className="abento-note">Check-ins vs orders, by hour of day</p>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Check-ins and orders by hour of day">
            <path d={`${checkinWave} L ${wavePts(hourly.checkins)[23][0]},${baseY} L ${wavePts(hourly.checkins)[0][0]},${baseY} Z`} fill="#C2571B" fillOpacity={0.14} />
            <path d={checkinWave} fill="none" stroke="#C2571B" strokeWidth={3} strokeLinecap="round" />
            <path d={orderWave} fill="none" stroke="#5F8D4E" strokeWidth={3} strokeDasharray="7 5" strokeLinecap="round" />
          </svg>
          <div className="abento-legend">
            <span><i style={{ background: '#C2571B' }} /> Check-ins</span>
            <span><i style={{ background: '#5F8D4E' }} /> Orders</span>
          </div>
        </div>

        {/* Mood treemap */}
        <div className="abento-tile abento-span-2">
          <div className="abento-tile-head">
            <span className="abento-label">Comfort by mood</span>
            <div className="abento-tabs" role="tablist" aria-label="Treemap period">
              {periods.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  role="tab"
                  aria-selected={period === p.key}
                  className={`abento-tab ${period === p.key ? 'active' : ''}`}
                  onClick={() => setPeriod(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <p className="abento-note">Each tile is a mood you checked in with — bigger means more often</p>
          {treemap.moods.length === 0 ? (
            <p className="panel-sub">No check-ins in this period yet.</p>
          ) : (
            <div className="abento-tree">
              {treemap.moods.map((m) => (
                <div
                  key={m.mood}
                  className="abento-tree-tile"
                  style={{ background: m.color, flexGrow: m.count }}
                  title={`${m.mood}: ${m.count} check-ins`}
                >
                  <b>{m.mood}</b>
                  <span>× {m.count}</span>
                </div>
              ))}
            </div>
          )}
          {treemap.dishes.length > 0 && (
            <div className="abento-table">
              {treemap.dishes.map((d) => (
                <div className="abento-table-row" key={d.name}>
                  <span>{d.name}</span>
                  <span>× {d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly radar */}
        <div className="abento-tile">
          <div className="abento-tile-head">
            <span className="abento-label">Year in moods</span>
            <div className="abento-tabs" role="tablist" aria-label="Radar year">
              {[new Date().getFullYear(), new Date().getFullYear() - 1].map((y) => (
                <button
                  key={y}
                  type="button"
                  role="tab"
                  aria-selected={radarYear === y}
                  className={`abento-tab ${radarYear === y ? 'active' : ''}`}
                  onClick={() => setRadarYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="abento-radar-wrap">
            <svg viewBox="0 0 220 200" width="220" height="200" role="img" aria-label={`Monthly check-ins radar for ${radarYear}`}>
              {[0.33, 0.66, 1].map((f) => (
                <polygon
                  key={f}
                  points={Array.from({ length: 12 }, (_, i) => {
                    const angle = (Math.PI * 2 * i) / 12 - Math.PI / 2;
                    return `${rcx + rMax * f * Math.cos(angle)},${rcy + rMax * f * Math.sin(angle)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#EBDFCE"
                />
              ))}
              {monthLabels.map((m, i) => {
                const angle = (Math.PI * 2 * i) / 12 - Math.PI / 2;
                return (
                  <text
                    key={m + i}
                    x={rcx + (rMax + 14) * Math.cos(angle)}
                    y={rcy + (rMax + 14) * Math.sin(angle)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fill="#8A7561"
                  >
                    {m}
                  </text>
                );
              })}
              <polygon points={radarPoly} fill="#D9A441" fillOpacity={0.25} stroke="#C2571B" strokeWidth={2} strokeLinejoin="round" />
              {radar.months.map((v, i) => {
                const [x, y] = radarPoint(i, v);
                return <circle key={i} cx={x} cy={y} r={3} fill="#C2571B" />;
              })}
            </svg>
            <div className="abento-stats">
              <div className="abento-stat">
                <b>{radar.total}</b>
                <span>check-ins in {radarYear}</span>
              </div>
              <div className="abento-stat">
                <b>{(radar.total / 12).toFixed(1)}</b>
                <span>monthly average</span>
              </div>
              {radar.topMood && (
                <div className="abento-stat">
                  <b style={{ textTransform: 'capitalize' }}>{radar.topMood.mood}</b>
                  <span>top mood · × {radar.topMood.count}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalyticsBento;
