// Promo offers — Swiggy-style coupon codes applied at checkout.
// All evaluation is client-side; the server just stores final item prices.
const OFFERS = [
  {
    code: 'MOOD20',
    title: '20% OFF up to ₹120',
    desc: 'On orders above ₹199',
    type: 'pct',
    value: 20,
    maxOff: 120,
    minOrder: 199,
  },
  {
    code: 'FIRSTBITE',
    title: 'Flat ₹60 OFF',
    desc: 'On orders above ₹249',
    type: 'flat',
    value: 60,
    minOrder: 249,
  },
  {
    code: 'FREESHIP',
    title: 'FREE delivery',
    desc: 'Zero delivery fee on any order',
    type: 'freeship',
    value: 0,
    minOrder: 0,
  },
];

export function findOffer(code) {
  const c = (code || '').trim().toUpperCase();
  return OFFERS.find((o) => o.code === c) || null;
}

// Returns { discount, freeShip, error } for a given subtotal.
export function evaluateOffer(offer, subtotal) {
  if (!offer) return { discount: 0, freeShip: false, error: '' };
  if (subtotal < offer.minOrder) {
    return {
      discount: 0,
      freeShip: false,
      error: `Needs a minimum order of ₹${offer.minOrder}`,
    };
  }
  if (offer.type === 'pct') {
    return {
      discount: Math.min(Math.round((subtotal * offer.value) / 100), offer.maxOff),
      freeShip: false,
      error: '',
    };
  }
  if (offer.type === 'flat') {
    return { discount: Math.min(offer.value, subtotal), freeShip: false, error: '' };
  }
  if (offer.type === 'freeship') {
    return { discount: 0, freeShip: true, error: '' };
  }
  return { discount: 0, freeShip: false, error: '' };
}

export default OFFERS;
