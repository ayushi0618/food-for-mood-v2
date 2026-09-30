// Shared image helpers: every food photo gets an onError fallback so a dead
// image URL can never break the layout.

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=70';

export function imgFallback(e) {
  const el = e.currentTarget;
  if (el.src !== FALLBACK_IMG) el.src = FALLBACK_IMG;
}

export function dishImage(name, foodImages) {
  return foodImages[name] || FALLBACK_IMG;
}
