export function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — ignore, UI still works in-memory
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  preferences: 'pulseboard.preferences.v1',
  favorites: 'pulseboard.favorites.v1',
  theme: 'pulseboard.theme.v1',
  widgetOrder: 'pulseboard.widgets.v1',
  likedPosts: 'pulseboard.liked-posts.v1',
  recentSearches: 'pulseboard.recent-searches.v1',
} as const;
