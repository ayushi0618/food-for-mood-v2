import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Menu as MenuIcon, X, ShoppingBag, LogIn, LogOut } from 'lucide-react';
import { getCart } from '../services/api';
import { useAuth } from '../services/auth';

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
  const navigate = useNavigate();
  const { user, ready, logout } = useAuth();

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

  // Cart is per-user on the server — re-fetch the badge when auth changes.
  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

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
        {ready && (user ? (
          <>
            <span className="nav-user" title={user.email}>
              {(user.name || 'F')[0].toUpperCase()}
            </span>
            <button
              className="nav-auth-btn"
              onClick={handleLogout}
              title={`Sign out (${user.email})`}
            >
              <LogOut size={15} /> Sign out
            </button>
          </>
        ) : (
          <NavLink
            to="/auth"
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <LogIn size={15} /> Sign in
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
