import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Menu as MenuIcon, X, ShoppingBag } from 'lucide-react';
import { getCart } from '../services/api';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/insights', label: 'Insights' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/orders', label: 'Orders' },
  { to: '/profile', label: 'Profile' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const refreshCart = async () => {
    try {
      const items = await getCart();
      setCartCount(Array.isArray(items) ? items.length : 0);
    } catch {
      /* backend unreachable — badge stays hidden */
    }
  };

  useEffect(() => {
    refreshCart();
    const handler = () => refreshCart();
    window.addEventListener('ffm:cart-updated', handler);
    return () => window.removeEventListener('ffm:cart-updated', handler);
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <Link to="/" className="brand" onClick={() => setOpen(false)}>
        <span className="brand-mark">
          <UtensilsCrossed size={20} />
        </span>
        <span>
          Food for Mood
          <small>Eat for how you feel</small>
        </span>
      </Link>

      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={24} /> : <MenuIcon size={24} />}
      </button>

      <div className={`nav-links ${open ? 'open' : ''}`}>
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {l.label}
          </NavLink>
        ))}
        <NavLink
          to="/cart"
          onClick={() => setOpen(false)}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <ShoppingBag size={16} />
          Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
