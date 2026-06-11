const API_URL = 'http://localhost:5000';

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