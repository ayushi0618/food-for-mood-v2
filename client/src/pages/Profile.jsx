import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, Info, LogOut, LogIn } from 'lucide-react';
import { useToast } from '../toast';
import { useAuth } from '../services/auth';
import {
  getPreferences,
  savePreferences,
  getFavorites,
  getJournal,
} from '../services/store';

function Profile() {
  const pushToast = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState(() => getPreferences());

  const save = () => {
    savePreferences(prefs);
    pushToast('Preferences saved', 'Recommendations will highlight matching dishes.');
  };

  const handleLogout = () => {
    logout();
    pushToast('Signed out', 'See you soon — your journal stays safe in this browser.');
    navigate('/');
  };

  const favCount = getFavorites().length;
  const journalCount = getJournal().length;

  return (
    <div className="page">
      <div className="page-head">
        <span className="eyebrow">Profile</span>
        <h1>Your taste profile</h1>
        <p>
          Tell us how you eat. We'll badge recommendations that match and
          pre-filter the menu for you.
        </p>
      </div>

      <div className="two-col">
        <div className="panel">
          <h3>Preferences</h3>
          <p className="panel-sub">Stored privately in this browser.</p>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field">
              <label>Your name</label>
              <input
                value={prefs.name}
                onChange={(e) => setPrefs({ ...prefs, name: e.target.value })}
                placeholder="e.g. Ayushi"
                maxLength={40}
              />
            </div>
            <div className="field">
              <label>Diet</label>
              <div className="choice-row">
                {[
                  ['any', 'Anything'],
                  ['veg', 'Vegetarian'],
                  ['nonveg', 'Non-veg'],
                ].map(([v, label]) => (
                  <button
                    key={v}
                    className={`choice ${prefs.diet === v ? 'on' : ''}`}
                    onClick={() => setPrefs({ ...prefs, diet: v })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Spice tolerance</label>
              <div className="choice-row">
                {[
                  ['mild', 'Mild'],
                  ['medium', 'Medium'],
                  ['hot', 'Bring the heat'],
                ].map(([v, label]) => (
                  <button
                    key={v}
                    className={`choice ${prefs.spice === v ? 'on' : ''}`}
                    onClick={() => setPrefs({ ...prefs, spice: v })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <button className="btn btn-primary" onClick={save}>
              <Save size={16} /> Save preferences
            </button>
          </div>
        </div>

        <div>
          <div className="panel">
            <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#C2571B,#9C4313)', marginBottom: 14 }}>
              <User size={24} />
            </span>
            <h3>{user?.name ? `Hello, ${user.name}` : prefs.name ? `Hello, ${prefs.name}` : 'Hello, foodie'}</h3>
            <p className="panel-sub">
              {prefs.diet === 'veg'
                ? 'Vegetarian'
                : prefs.diet === 'nonveg'
                  ? 'Non-vegetarian'
                  : 'No diet filter'}{' '}
              · prefers {prefs.spice} spice
            </p>
            <div className="divider" />
            <div className="sum-row" style={{ color: 'var(--ink-soft)' }}>
              <span>Mood check-ins</span>
              <b>{journalCount}</b>
            </div>
            <div className="sum-row" style={{ color: 'var(--ink-soft)' }}>
              <span>Favorite dishes</span>
              <b>{favCount}</b>
            </div>
          </div>

          <div className="panel" style={{ background: 'var(--gold-soft)', borderColor: '#EBD9AE' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Info size={20} color="#B07C2E" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)' }}>
                {user
                  ? `Signed in as ${user.email}. Your cart and orders are tied to this account and follow you across devices.`
                  : 'Your journal, favorites and preferences never leave this browser. Orders and recommendations live in MongoDB so they follow you across devices.'}
              </p>
            </div>
          </div>

          <div className="panel">
            <h3>Account</h3>
            {user ? (
              <>
                <div className="sum-row" style={{ color: 'var(--ink-soft)' }}>
                  <span>Signed in as</span>
                  <b>{user.email}</b>
                </div>
                <button
                  className="btn"
                  onClick={handleLogout}
                  style={{ width: '100%', marginTop: 12 }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <p className="panel-sub">
                  You're browsing as a guest. Create an account to keep your
                  cart and order history on every device.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/auth')}
                  style={{ width: '100%' }}
                >
                  <LogIn size={16} /> Sign in / Create account
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
