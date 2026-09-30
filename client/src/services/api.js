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

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
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
