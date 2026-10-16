import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, UtensilsCrossed, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../services/auth';
import { useToast } from '../toast';

function Auth() {
  const { user, signup, login } = useAuth();
  const pushToast = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className="page">
        <div className="panel" style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}>
          <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#C2571B,#9C4313)', margin: '0 auto 16px' }}>
            <UtensilsCrossed size={26} />
          </span>
          <h2>You're signed in{user.name ? `, ${user.name}` : ''}</h2>
          <p className="panel-sub">{user.email}</p>
          <div className="divider" />
          <Link to="/profile" className="btn btn-primary">Go to your profile</Link>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup({ name: name.trim(), email: email.trim(), password });
        pushToast(`Welcome, ${name.trim().split(' ')[0] || 'foodie'}`, 'Your account is ready — your cart and orders are now yours.');
      } else {
        const u = await login({ email: email.trim(), password });
        pushToast(`Welcome back${u.name ? `, ${u.name.split(' ')[0]}` : ''}`, 'Signed in — your cart and orders are waiting.');
      }
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Something went wrong — please try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <div className="panel" style={{ maxWidth: 460, margin: '32px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="kpi-icon" style={{ background: 'linear-gradient(135deg,#C2571B,#9C4313)', margin: '0 auto 14px' }}>
            <UtensilsCrossed size={26} />
          </span>
          <h2 style={{ marginBottom: 6 }}>
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="panel-sub" style={{ margin: 0 }}>
            {mode === 'signup'
              ? 'One account for your moods, cart and orders — on every device.'
              : 'Sign in to pick up your cart, orders and mood journey.'}
          </p>
        </div>

        <div className="choice-row" style={{ justifyContent: 'center', margin: '18px 0' }}>
          <button
            type="button"
            className={`choice ${mode === 'login' ? 'on' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            <LogIn size={15} /> Sign in
          </button>
          <button
            type="button"
            className={`choice ${mode === 'signup' ? 'on' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            <UserPlus size={15} /> Create account
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            {mode === 'signup' && (
              <div className="field">
                <label>Your name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ayushi"
                  maxLength={60}
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label>Password{mode === 'signup' && <span style={{ fontWeight: 400 }}> (min 6 characters)</span>}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </div>
          </div>

          {error && (
            <p style={{ color: '#B3261E', fontSize: '0.9rem', margin: '12px 0 0' }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={busy}
            style={{ width: '100%', marginTop: 18 }}
          >
            {busy ? 'One moment…' : mode === 'signup' ? (
              <><Sparkles size={16} /> Create account</>
            ) : (
              <><LogIn size={16} /> Sign in</>
            )}
          </button>
        </form>

        <p className="panel-sub" style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem' }}>
          <ShieldCheck size={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />
          Passwords are hashed — we never store them in plain text.
        </p>
      </div>
    </div>
  );
}

export default Auth;
