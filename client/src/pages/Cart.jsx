import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Loader2, Tag, MapPin, Plus, X } from 'lucide-react';
import {
  getCart,
  checkoutOrder,
  removeFromCart,
  notifyCartUpdated,
} from '../services/api';
import { getAddresses, saveAddress, deleteAddress } from '../services/store';
import { findOffer, evaluateOffer } from '../data/offers';
import { useToast } from '../toast';
import foodImages from '../data/foodImages';
import { imgFallback, dishImage } from '../utils/img';
import { DishName } from '../components/DishHover';

function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [addresses, setAddresses] = useState(() => getAddresses());
  const [addressId, setAddressId] = useState(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'Home', line: '', city: '', pin: '' });
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
  const offerResult = evaluateOffer(promo, subtotal);
  const delivery = items.length ? (offerResult.freeShip ? 0 : 29) : 0;
  const discount = offerResult.discount;
  const total = Math.max(0, subtotal - discount + delivery);

  function applyPromo() {
    const offer = findOffer(promoInput);
    if (!offer) {
      setPromo(null);
      setPromoError('That code did not match any offer.');
      return;
    }
    const res = evaluateOffer(offer, subtotal);
    if (res.error) {
      setPromo(null);
      setPromoError(res.error);
      return;
    }
    setPromo(offer);
    setPromoError('');
    pushToast('Offer applied', `${offer.code} — ${offer.title}.`);
  }

  function addAddress(e) {
    e.preventDefault();
    if (!addrForm.line.trim() || !addrForm.city.trim()) {
      pushToast('Address incomplete', 'Add a street and city.');
      return;
    }
    const saved = saveAddress({
      label: addrForm.label.trim() || 'Home',
      line: addrForm.line.trim(),
      city: addrForm.city.trim(),
      pin: addrForm.pin.trim(),
    });
    setAddresses(getAddresses());
    setAddressId(saved.id);
    setShowAddrForm(false);
    setAddrForm({ label: 'Home', line: '', city: '', pin: '' });
    pushToast('Address saved', 'Delivering here for this order.');
  }

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
                  <h3><DishName name={item.food} /></h3>
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

            <div className="promo-box">
              {promo ? (
                <div className="promo-applied">
                  <span className="promo-tag">
                    <Tag size={13} /> {promo.code}
                  </span>
                  <span className="promo-title">{promo.title}</span>
                  <button
                    className="icon-btn"
                    onClick={() => { setPromo(null); setPromoInput(''); }}
                    title="Remove offer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="promo-row">
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Promo code (try MOOD20)"
                      aria-label="Promo code"
                    />
                    <button className="btn btn-ghost btn-sm" onClick={applyPromo}>
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="promo-error">{promoError}</p>}
                </>
              )}
            </div>

            <div className="addr-box">
              <div className="addr-head">
                <span><MapPin size={15} /> Deliver to</span>
                <button
                  className="link-btn"
                  onClick={() => setShowAddrForm((v) => !v)}
                >
                  <Plus size={13} /> {addresses.length ? 'New' : 'Add address'}
                </button>
              </div>
              {addresses.length > 0 && !showAddrForm && (
                <div className="addr-list">
                  {addresses.map((a) => (
                    <label key={a.id} className={`addr-opt ${addressId === a.id ? 'on' : ''}`}>
                      <input
                        type="radio"
                        name="address"
                        checked={addressId === a.id}
                        onChange={() => setAddressId(a.id)}
                      />
                      <span>
                        <b>{a.label}</b> — {a.line}, {a.city}{a.pin ? ` ${a.pin}` : ''}
                      </span>
                      <button
                        className="icon-btn"
                        title="Delete address"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteAddress(a.id);
                          setAddresses(getAddresses());
                          if (addressId === a.id) setAddressId(null);
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </label>
                  ))}
                </div>
              )}
              {showAddrForm && (
                <form className="addr-form" onSubmit={addAddress}>
                  <div className="addr-grid">
                    <input
                      value={addrForm.label}
                      onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                      placeholder="Label (Home / Work)"
                    />
                    <input
                      value={addrForm.pin}
                      onChange={(e) => setAddrForm({ ...addrForm, pin: e.target.value })}
                      placeholder="PIN code"
                      inputMode="numeric"
                    />
                  </div>
                  <input
                    value={addrForm.line}
                    onChange={(e) => setAddrForm({ ...addrForm, line: e.target.value })}
                    placeholder="Street, area, landmark"
                  />
                  <input
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    placeholder="City"
                  />
                  <button className="btn btn-ghost btn-sm" type="submit">
                    Save address
                  </button>
                </form>
              )}
              {addresses.length === 0 && !showAddrForm && (
                <p className="addr-empty">No saved addresses yet.</p>
              )}
            </div>

            <div className="sum-row">
              <span>Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="sum-row discount">
                <span>Offer ({promo.code})</span>
                <span>− ₹{discount}</span>
              </div>
            )}
            <div className="sum-row">
              <span>Delivery</span>
              <span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
            </div>
            <div className="sum-row total">
              <span>Total</span>
              <span>₹{total}</span>
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
