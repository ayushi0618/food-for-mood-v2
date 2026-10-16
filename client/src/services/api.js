// Centralized API client. Base URLs are configurable via environment so the
// same build can target local dev or production without code changes.
export const API_URL =
  process.env.REACT_APP_API_URL || 'https://food-for-mood-v2.onrender.com';

export const WS_URL =
  process.env.REACT_APP_WS_URL || 'wss://food-for-mood-v2.onrender.com';

// Tiny event bus so the navbar cart badge (and others) can refresh when the
// cart changes anywhere in the app.
export function notifyCartUpdated() {
  window.dispatchEvent(new CustomEvent('ffm:cart-updated'));
}

// Auth token lives in localStorage under this key. The API client attaches
// it automatically; the AuthContext (services/auth.jsx) owns the lifecycle.
export const TOKEN_KEY = 'ffm:auth-token';

async function request(path, options = {}) {
  const token = (() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  })();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function analyzeIncident(incident) {
  return request('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ incident }),
  });
}

export async function getCart() {
  return request('/api/cart');
}

export async function getRecent() {
  return request('/api/recent');
}

export async function getOrders() {
  return request('/api/orders');
}

export async function checkoutOrder(id) {
  return request(`/api/checkout/${id}`, { method: 'POST' });
}

// Add a dish to the cart directly (e.g. from the Menu or a re-order).
// The backend stores it as an order with status 'cart'.
export async function addToCart({ food, reason, price, incident }) {
  return request('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ food, reason, price, incident }),
  });
}

export async function removeFromCart(id) {
  return request(`/api/cart/${id}`, { method: 'DELETE' });
}

export async function getInsightSummary(payload) {
  return request('/api/insight-summary', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// "Send a mood" gifting — public, no account needed (frictionless sharing).
export async function createGift({ dish, price, mood, toName, fromName, note }) {
  return request('/api/gifts', {
    method: 'POST',
    body: JSON.stringify({ dish, price, mood, toName, fromName, note }),
  });
}

export async function getGift(id) {
  return request(`/api/gifts/${id}`);
}
