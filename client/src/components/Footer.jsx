import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand" style={{ marginBottom: 14, color: '#fff' }}>
            <span className="brand-mark">
              <UtensilsCrossed size={20} />
            </span>
            <span>
              Food for Mood
              <small style={{ color: '#A89880' }}>Eat for how you feel</small>
            </span>
          </div>
          <p style={{ maxWidth: 340 }}>
            An AI-powered comfort-food companion. Describe your mood, get a
            dish matched by Gemini, and discover your own cravings patterns.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <div className="footer-links">
            <Link to="/">Mood analyzer</Link>
            <Link to="/menu">Menu</Link>
            <Link to="/insights">Insights</Link>
            <Link to="/favorites">Favorites</Link>
          </div>
        </div>
        <div>
          <h4>Your orders</h4>
          <div className="footer-links">
            <Link to="/cart">Cart</Link>
            <Link to="/orders">Order history</Link>
            <Link to="/profile">Preferences</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Food for Mood · Built with React, Node.js, MongoDB and Gemini</span>
        <span>Made with care in India</span>
      </div>
    </footer>
  );
}

export default Footer;
