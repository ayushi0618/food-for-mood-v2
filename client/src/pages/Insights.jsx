import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShoppingBag,
  Wallet,
  Flame,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getOrders } from '../services/api';
import { getJournal, clearJournal } from '../services/store';
import { moodColor } from '../utils/mood';

const PIE_COLORS = ['#C2571B', '#5F8D4E', '#D9A441', '#C0495B', '#6B8CAE', '#9A8FBF'];

function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function Insights() {
  const [journal, setJournal] = useState(() => getJournal());
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders()
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]));
  }, []);

  const stats = useMemo(() => {
    const days = new Set(journal.map((j) => dayKey(j.ts)));
    // streak: consecutive days ending today or yesterday
    let streak = 0;
    const cursor = new Date();
    if (!days.has(dayKey(cursor.getTime()))) cursor.setDate(cursor.getDate() - 1);
    while (days.has(dayKey(cursor.getTime()))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    const spend = orders.reduce((s, o) => s + (Number(o.price) || 0), 0);
    return { checkins: journal.length, orders: orders.length, spend, streak };
  }, [journal, orders]);

  const activityData = useMemo(() => {
    const buckets = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push({
        label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        key: dayKey(d.getTime()),
        count: 0,
      });
    }
    const map = Object.fromEntries(buckets.map((b) => [b.key, b]));
    journal.forEach((j) => {
      const b = map[dayKey(j.ts)];
      if (b) b.count += 1;
    });
    return buckets;
  }, [journal]);

  const moodData = useMemo(() => {
    const counts = {};
    journal.forEach((j) => {
      counts[j.mood] = (counts[j.mood] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([mood, count]) => ({ mood, count, fill: moodColor(mood) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [journal]);

  const dishData = useMemo(() => {
    const counts = {};
    [...journal.map((j) => j.food), ...orders.map((o) => o.food)].forEach((f) => {
      if (f) counts[f] = (counts[f] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [journal, orders]);

  const kpis = [
    { icon: Activity, label: 'Mood check-ins', value: stats.checkins, bg: 'linear-gradient(135deg,#C2571B,#9C4313)' },
    { icon: ShoppingBag, label: 'Orders placed', value: stats.orders, bg: 'linear-gradient(135deg,#5F8D4E,#476B3A)' },
    { icon: Wallet, label: 'Total spend', value: `₹${stats.spend}`, bg: 'linear-gradient(135deg,#D9A441,#B07C2E)' },
    { icon: Flame, label: 'Day streak', value: stats.streak, bg: 'linear-gradient(135deg,#C0495B,#96303F)' },
  ];

  const handleClear = () => {
    if (window.confirm('Clear your local mood journal? This cannot be undone.')) {
      clearJournal();
      setJournal([]);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Insights</span>
        <h1>Your cravings, decoded</h1>
        <p>
          Every mood analysis is journaled automatically. Here's what your
          emotions have been ordering lately.
        </p>
      </div>

      <div className="kpi-grid">
        {kpis.map((k) => (
          <div className="kpi" key={k.label}>
            <span className="kpi-icon" style={{ background: k.bg }}>
              <k.icon size={24} />
            </span>
            <div>
              <b>{k.value}</b>
              <span>{k.label}</span>
            </div>
          </div>
        ))}
      </div>

      {journal.length === 0 ? (
        <div className="empty">
          <span className="e-icon">
            <Activity size={30} />
          </span>
          <h3>No data yet</h3>
          <p>Analyze your mood on the home page and your dashboard will come alive.</p>
          <Link to="/" className="btn btn-primary">
            Analyze my mood <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div className="charts-2">
            <div className="panel">
              <h3>Check-in activity</h3>
              <p className="panel-sub">Mood analyses per day · last 14 days</p>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EBDFCE" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#8A7561" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#8A7561" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#C2571B"
                      strokeWidth={2.5}
                      fill="#C2571B"
                      fillOpacity={0.18}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel">
              <h3>Top comfort foods</h3>
              <p className="panel-sub">Most recommended &amp; ordered dishes</p>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dishData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {dishData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {dishData.map((d, i) => (
                  <span key={d.name} className="tag">
                    <i
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: PIE_COLORS[i % PIE_COLORS.length],
                        marginRight: 6,
                      }}
                    />
                    {d.name} × {d.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Moods detected</h3>
            <p className="panel-sub">What you've been feeling, by check-in count</p>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodData} margin={{ top: 5, right: 10, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBDFCE" />
                  <XAxis dataKey="mood" tick={{ fontSize: 11 }} stroke="#8A7561" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#8A7561" />
                  <Tooltip cursor={{ fill: '#F8F0E4' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <h3>Mood journal</h3>
                <p className="panel-sub" style={{ margin: 0 }}>
                  Your recent check-ins · stored privately in this browser
                </p>
              </div>
              <button className="icon-btn" onClick={handleClear} title="Clear journal">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="journal">
              {journal.slice(0, 12).map((j) => {
                const d = new Date(j.ts);
                return (
                  <div className="journal-row" key={j.id}>
                    <div className="journal-date">
                      <b>{d.getDate()}</b>
                      <span>{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div className="journal-main">
                      <span
                        className="mood-badge"
                        style={{
                          background: `${moodColor(j.mood)}22`,
                          color: moodColor(j.mood),
                          marginBottom: 6,
                        }}
                      >
                        {j.mood}
                      </span>
                      <p>
                        <span className="j-food">{j.food}</span>
                        {j.incident ? ` — “${j.incident}”` : ''}
                      </p>
                    </div>
                    <div className="journal-side">
                      <span className="j-price">₹{j.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Insights;
