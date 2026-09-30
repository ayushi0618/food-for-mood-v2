// Set REACT_APP_API_URL in your hosting env to point at the backend.
// Falls back to the production Render backend so deploys keep working.
const API_URL = process.env.REACT_APP_API_URL || 'https://food-for-mood-v2.onrender.com';

export async function analyzeIncident(incident) {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ incident })
  });

  return response.json();
}

export async function getCart() {
  const response = await fetch(`${API_URL}/api/cart`);
  return response.json();
}

export async function checkoutOrder(id) {
  const response = await fetch(`${API_URL}/api/checkout/${id}`, {
    method: 'POST'
  });

  return response.json();
}