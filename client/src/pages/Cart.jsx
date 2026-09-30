import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import {
  getCart,
  checkoutOrder,
  removeFromCart,
  notifyCartUpdated,
} from '../services/api';
import { useToast } from '../toast';
import foodImages from '../data/foodImages';
import { imgFallback, dishImage } from '../utils/img';

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const pushToast = useToast();

  async function loadCart() {
    try {
      const data = await getCart();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      pushToast('Cart unavailable', 'Could not reach the kitchen server.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkout(id) {
    setBusyId(id);
    try {
      await checkoutOrder(id);
      pushToast('Order placed', 'The kitchen has your order.', {
        link: '/orders',
        linkLabel: 'Track',
      });
      await loadCart();
      notifyCartUpdated();
    } catch {
      pushToast('Checkout failed', 'Please try again in a moment.');
    }
    setBusyId(null);
  }

  async function checkoutAll() {
    setBusyId('all');
    for (const item of items) {
      try {
        await checkoutOrder(item._id);
      } catch {
        /* continue with the rest */
      }
    }
    pushToast('All orders placed', `${items.length} dishes are being prepared.`, {
      link: '/orders',
      linkLabel: 'Track',
    });
    await loadCart();
    notifyCartUpdated();
    setBusyId(null);
  }

  async function removeItem(id) {
    try {
      await removeFromCart(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      notifyCartUpdated();
      pushToast('Removed', 'Dish removed from your cart.');
    } catch {
      pushToast('Could not remove', 'Please try again.');
    }
  }

  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const delivery = items.length ? 29 : 0;

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Cart</span>
        <h1>Your thali</h1>
        <p>Everything the AI (and you) picked. Checkout fires a real-time update to the kitchen.</p>
      </div>

      {loading ? (
        <div className="panel">
          <div className="skel" style={{ height: 90, marginBottom: 12 }} />
          <div className="skel" style={{ height: 90 }} />
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <span className="e-icon">
            <ShoppingBag size={30} />
          </span>
          <h3>Your cart is empty</h3>
          <p>Analyze your mood or pick something delicious from the menu.</p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">
              Analyze my mood
            </Link>
            <Link to="/menu" className="btn btn-ghost">
              Browse menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map((item) => (
              <div className="cart-item" key={item._id}>
                <img
                  src={dishImage(item.food, foodImages)}
                  alt={item.food}
                  onError={imgFallback}
                />
                <div>
                  <h3>{item.food}</h3>
                  {item.reason && <p className="ci-reason">{item.reason}</p>}
                  <span className="ci-price">₹{item.price}</span>
                </div>
                <div className="ci-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => checkout(item._id)}
                    disabled={busyId !== null}
                  >
                    {busyId === item._id ? (
                      <Loader2 size={15} className="spinner" style={{ border: 'none' }} />
                    ) : (
                      'Checkout'
                    )}
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => removeItem(item._id)}
                    title="Remove from cart"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-card">
            <h3>Order summary</h3>
            <div className="sum-row">
              <span>Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="sum-row">
              <span>Delivery</span>
              <span>₹{delivery}</span>
            </div>
            <div className="sum-row total">
              <span>Total</span>
              <span>₹{subtotal + delivery}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={checkoutAll}
              disabled={busyId !== null}
            >
              {busyId === 'all' ? 'Placing orders…' : (
                <>Checkout all <ArrowRight size={16} /></>
              )}
            </button>
            <p style={{ fontSize: '0.78rem', color: '#A89880', marginTop: 12 }}>
              Checkout broadcasts a live WebSocket event — watch the toast when it lands.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
