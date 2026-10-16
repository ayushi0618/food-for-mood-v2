// Auth state for the whole app: the logged-in user (or null), plus
// login/signup/logout actions. The JWT lives in localStorage (ffm:auth-token)
// and is attached to every API call by services/api.js. On boot, an existing
// token is validated against GET /api/auth/me.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { API_URL, TOKEN_KEY } from './api';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

async function authRequest(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Validate any saved token on boot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let token = null;
      try {
        token = localStorage.getItem(TOKEN_KEY);
      } catch {
        /* storage unavailable */
      }
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!cancelled && response.ok && data.user) {
          setUser(data.user);
        } else if (!cancelled) {
          try {
            localStorage.removeItem(TOKEN_KEY);
          } catch {
            /* noop */
          }
        }
      } catch {
        /* backend unreachable — keep signed-out state, don't nuke the token */
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (token, nextUser) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable */
    }
    setUser(nextUser);
  };

  const signup = useCallback(async ({ name, email, password }) => {
    const data = await authRequest('/api/auth/signup', { name, email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await authRequest('/api/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* noop */
    }
    setUser(null);
    // Carts are per-user on the server; refresh the navbar badge.
    window.dispatchEvent(new CustomEvent('ffm:cart-updated'));
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
