// Client-side persistence: favorites, mood journal, and user preferences.
// Stored in localStorage so the product feels personal without requiring
// accounts. Keys are namespaced to avoid collisions.

const KEYS = {
  FAVORITES: 'ffm:favorites:v1',
  JOURNAL: 'ffm:mood-journal:v1',
  PREFS: 'ffm:preferences:v1',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — fail soft */
  }
}

const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ---------------- Favorites ---------------- */

export function getFavorites() {
  return read(KEYS.FAVORITES, []);
}

export function isFavorite(dishName) {
  return getFavorites().some(
    (f) => f.name.toLowerCase() === dishName.toLowerCase()
  );
}

export function toggleFavorite(dish) {
  const list = getFavorites();
  const idx = list.findIndex(
    (f) => f.name.toLowerCase() === dish.name.toLowerCase()
  );
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.unshift({ ...dish, savedAt: Date.now(), id: uid() });
  }
  write(KEYS.FAVORITES, list);
  return idx < 0;
}

/* ---------------- Mood journal ----------------
   Every analysis is logged locally: timestamp, raw situation (truncated),
   detected mood, recommended food and price. Powers the Insights dashboard. */

export function getJournal() {
  return read(KEYS.JOURNAL, []);
}

export function logJournalEntry(entry) {
  const list = getJournal();
  list.unshift({
    id: uid(),
    ts: Date.now(),
    incident: (entry.incident || '').slice(0, 220),
    mood: entry.mood || 'Curious',
    food: entry.food || '',
    price: entry.price || 0,
    orderId: entry.orderId || null,
  });
  write(KEYS.JOURNAL, list.slice(0, 200));
  return list;
}

export function clearJournal() {
  write(KEYS.JOURNAL, []);
}

/* ---------------- Preferences ---------------- */

export const DEFAULT_PREFS = {
  name: '',
  diet: 'any', // 'veg' | 'nonveg' | 'any'
  spice: 'medium', // 'mild' | 'medium' | 'hot'
};

export function getPreferences() {
  return { ...DEFAULT_PREFS, ...read(KEYS.PREFS, {}) };
}

export function savePreferences(prefs) {
  write(KEYS.PREFS, { ...getPreferences(), ...prefs });
}
