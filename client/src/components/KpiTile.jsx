// 21st.dev-inspired Animated Dashboard Card
// (@isaiahbjork/animated-dashboard-card)
// KPI tile with animated count-up on mount and a soft glow.
import { useEffect, useRef, useState } from 'react';

function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
    const prefix = String(target).match(/^[^0-9]*/)?.[0] || '';
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(numeric * eased);
      setVal(prefix + cur.toLocaleString('en-IN'));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return val;
}

function KpiTile({ icon: Icon, label, value, bg, delay = 0 }) {
  const shown = useCountUp(value);
  return (
    <div className="kpi21" style={{ animationDelay: `${delay}ms` }}>
      <span className="kpi21-icon" style={{ background: bg }}>
        <Icon size={22} />
      </span>
      <div className="kpi21-body">
        <b>{shown}</b>
        <span>{label}</span>
      </div>
      <span className="kpi21-glow" style={{ background: bg }} />
    </div>
  );
}

export default KpiTile;
