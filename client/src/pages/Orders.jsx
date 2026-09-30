import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Check,
  ChefHat,
  Bike,
  Home,
  RotateCcw,
  Wallet,
} from 'lucide-react';
import { getOrders, addToCart, notifyCartUpdated } from '../services/api';
import { useToast } from '../toast';
import foodImages from '../data/foodImages';
import { imgFallback, dishImage } from '../utils/img';

// Order tracking timeline. Stage progression is a client-side demo simulation
// driven by elapsed time since the order was placed — clearly labeled as such.
// In production this would be driven by restaurant webhooks over the existing
// WebSocket channel.
const STAGES = [
  { id: 'placed', label: 'Placed', icon: Package, at: 0 },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, at: 2 },
  { id: 'ontheway', label: 'On the way', icon: Bike, at: 7 },
  { id: 'delivered', label: 'Delivered', icon: Home, at: 15 },
];

function stageIndex(createdAt) {
  const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
  let idx = 0;
  STAGES.forEach((s, i) => {
    if (mins >= s.at) idx = i;
  });
  return idx;
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);
  const pushToast = useToast();

  useEffect(() => {
    // Fixed: previously pointed at http://localhost:5000, dead in production.
    getOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  // Re-render every 30s so the demo timeline advances.
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  async function reorder(item) {
    try {
      await addToCart({
        food: item.food,
        reason: item.reason || 'Ordered again from history',
        price: item.price,
        incident: 'Re-ordered from order history',
      });
      notifyCartUpdated();
      pushToast('Added to cart', `${item.food} is back in your cart.`, {
        link: '/cart',
        linkLabel: 'View cart',
      });
    } catch {
      pushToast('Could not re-order', 'The kitchen is unreachable right now.');
    }
  }

  const totalSpend = orders.reduce((s, o) => s + (Number(o.price) || 0), 0);

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Orders</span>
        <h1>Order history</h1>
        <p>Track live kitchen status and re-order your favorites in one tap.</p>
      </div>

      {loading ? (
        <div className="panel">
          <div className="skel" style={{ height: 120, marginBottom: 12 }} />
          <div className="skel" style={{ height: 120 }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <span className="e-icon">
            <Package size={30} />
          </span>
          <h3>No orders yet</h3>
          <p>Your placed orders will appear here with live tracking.</p>
          <Link to="/" className="btn btn-primary">
            Get a recommendation
          </Link>
        </div>
      ) : (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(200px,280px))' }}>
            <div className="kpi">
              <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#5F8D4E,#476B3A)' }}>
                <Package size={22} />
              </span>
              <div>
                <b>{orders.length}</b>
                <span>Orders placed</span>
              </div>
            </div>
            <div className="kpi">
              <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#D9A441,#B07C2E)' }}>
                <Wallet size={22} />
              </span>
              <div>
                <b>₹{totalSpend}</b>
                <span>Total spend</span>
              </div>
            </div>
          </div>

          {orders.map((item) => {
            const idx = stageIndex(item.createdAt);
            const d = new Date(item.createdAt);
            return (
              <div className="order-card" key={item._id}>
                <div className="order-top">
                  <img
                    src={dishImage(item.food, foodImages)}
                    alt={item.food}
                    onError={imgFallback}
                  />
                  <div>
                    <h3>{item.food}</h3>
                    <span className="o-date">
                      {d.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {d.toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    <div style={{ marginTop: 6 }}>
                      <span className="live-badge">
                        <i /> Live kitchen
                      </span>
                    </div>
                  </div>
                  <span className="o-price">₹{item.price}</span>
                </div>

                <div className="timeline">
                  {STAGES.map((s, i) => (
                    <span key={s.id} style={{ display: 'contents' }}>
                      <span
                        className={`t-step ${i < idx ? 'done' : ''} ${i === idx ? 'now' : ''}`}
                      >
                        <span className="t-dot">
                          {i < idx ? <Check size={14} /> : <s.icon size={14} />}
                        </span>
                        {s.label}
                      </span>
                      {i < STAGES.length - 1 && (
                        <span className={`t-line ${i < idx ? 'done' : ''}`} />
                      )}
                    </span>
                  ))}
                </div>
                <p className="demo-note">
                  Demo simulation — stages advance with elapsed time. In
                  production, the restaurant's webhooks would drive this over
                  the live WebSocket channel.
                </p>

                <div className="divider" />
                <div className="btn-row">
                  <button className="btn btn-ghost btn-sm" onClick={() => reorder(item)}>
                    <RotateCcw size={15} /> Order again
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default Orders;
