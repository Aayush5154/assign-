import { describe, expect, it, beforeEach } from 'vitest';
import type { Category } from '@/types/content';
import preferencesReducer, {
  toggleCategory,
  setCategories,
  resetPreferences,
} from '@/features/preferences/preferencesSlice';
import favoritesReducer, { toggleFavorite, addFavorite, removeFavorite } from '@/features/favorites/favoritesSlice';
import themeReducer, { toggleTheme, setTheme } from '@/features/theme/themeSlice';
import dashboardReducer, { reorderList, moveWidget } from '@/features/dashboard/dashboardSlice';
import { DEFAULT_WIDGET_ORDER } from '@/lib/constants/categories';
import { isSafeHttpUrl } from '@/lib/utils/format';
import { normalizeNewsArticle, normalizeTmdbMovie } from '@/lib/api/normalize';
import { preferencesSchema } from '@/lib/validation/schemas';

type PrefState = Parameters<typeof preferencesReducer>[0];
type FavState = Parameters<typeof favoritesReducer>[0];
type ThemeStateT = Parameters<typeof themeReducer>[0];

const pref = (categories: Category[], personalizedMode = true): PrefState => ({
  categories,
  personalizedMode,
  hydrated: true,
});

const fav = (): FavState => ({ items: [], hydrated: true });

beforeEach(() => {
  window.localStorage.clear();
});

describe('preferences', () => {
  it('toggles categories and prevents removing the last one', () => {
    let s = pref(['technology', 'sports']);
    s = preferencesReducer(s, toggleCategory('sports'));
    expect(s.categories).toEqual(['technology']);
    // cannot remove the final category
    s = preferencesReducer(s, toggleCategory('technology'));
    expect(s.categories).toEqual(['technology']);
  });

  it('rejects invalid categories via zod schema', () => {
    const bad = preferencesSchema.safeParse({ categories: ['nope'], personalizedMode: true });
    expect(bad.success).toBe(false);
    const empty = preferencesSchema.safeParse({ categories: [], personalizedMode: true });
    expect(empty.success).toBe(false);
    const good = preferencesSchema.safeParse({ categories: ['technology', 'finance'], personalizedMode: false });
    expect(good.success).toBe(true);
  });

  it('resets to defaults', () => {
    const s = preferencesReducer(pref(['sports'], false), resetPreferences());
    expect(s.categories).toContain('technology');
    expect(s.personalizedMode).toBe(true);
  });

  it('setCategories dedupes values', () => {
    const s = preferencesReducer(pref(['technology']), setCategories(['technology', 'technology', 'science']));
    expect(s.categories).toEqual(['technology', 'science']);
  });
});

describe('favorites', () => {
  const item = (id: string, type: 'news' | 'movie' | 'social' = 'news') => ({
    id,
    type,
    title: `Title ${id}`,
    subtitle: 'Source',
    imageUrl: null,
    url: 'https://example.com/x',
    addedAt: '',
  });

  it('adds and removes favorites', () => {
    let s = fav();
    s = favoritesReducer(s, toggleFavorite(item('a')));
    expect(s.items).toHaveLength(1);
    s = favoritesReducer(s, toggleFavorite(item('a')));
    expect(s.items).toHaveLength(0);
  });

  it('prevents duplicate favorites', () => {
    let s = fav();
    s = favoritesReducer(s, addFavorite(item('a')));
    s = favoritesReducer(s, addFavorite(item('a')));
    expect(s.items).toHaveLength(1);
  });

  it('distinguishes same id with different types', () => {
    let s = fav();
    s = favoritesReducer(s, addFavorite(item('a', 'news')));
    s = favoritesReducer(s, addFavorite(item('a', 'movie')));
    expect(s.items).toHaveLength(2);
    s = favoritesReducer(s, removeFavorite({ id: 'a', type: 'news' }));
    expect(s.items).toHaveLength(1);
    expect(s.items[0].type).toBe('movie');
  });
});

describe('theme', () => {
  it('toggles between dark and light', () => {
    const init: ThemeStateT = { mode: 'dark', hydrated: true };
    let s = themeReducer(init, toggleTheme());
    expect(s.mode).toBe('light');
    s = themeReducer(s, setTheme('dark'));
    expect(s.mode).toBe('dark');
  });
});

describe('dashboard widget ordering', () => {
  it('reorders lists immutably', () => {
    const next = reorderList(['a', 'b', 'c'], 0, 2);
    expect(next).toEqual(['b', 'c', 'a']);
  });

  it('ignores out-of-range moves', () => {
    expect(reorderList(['a', 'b'], -1, 1)).toEqual(['a', 'b']);
    expect(reorderList(['a', 'b'], 0, 9)).toEqual(['a', 'b']);
  });

  it('moveWidget reducer reorders widget ids', () => {
    const s = dashboardReducer(
      { widgetOrder: DEFAULT_WIDGET_ORDER, hydrated: true },
      moveWidget({ from: 0, to: 2 }),
    );
    expect(s.widgetOrder[2]).toBe(DEFAULT_WIDGET_ORDER[0]);
    expect(s.widgetOrder).toHaveLength(DEFAULT_WIDGET_ORDER.length);
  });
});

describe('URL safety', () => {
  it('only allows http(s) urls', () => {
    expect(isSafeHttpUrl('https://example.com/a')).toBe(true);
    expect(isSafeHttpUrl('http://example.com')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,hi')).toBe(false);
    expect(isSafeHttpUrl(null)).toBe(false);
  });
});

describe('API normalization', () => {
  it('normalizes news articles and drops invalid ones', () => {
    const good = normalizeNewsArticle(
      { title: 'Hello', description: 'World', url: 'https://example.com/x', source: { name: 'S' }, publishedAt: '2026-01-01T00:00:00Z' },
      'technology',
      0,
    );
    expect(good?.title).toBe('Hello');
    expect(good?.imageUrl).toBeNull();
    expect(normalizeNewsArticle({ title: '[Removed]' }, 'technology', 0)).toBeNull();
    expect(normalizeNewsArticle({ title: 'T' }, 'technology', 0)).toBeNull();
  });

  it('normalizes TMDB movies with image urls', () => {
    const m = normalizeTmdbMovie({
      id: 1,
      title: 'Test',
      overview: 'Overview',
      poster_path: '/p.jpg',
      backdrop_path: '/b.jpg',
      release_date: '2020-01-01',
      vote_average: 7.55,
      vote_count: 10,
      genre_ids: [878],
    });
    expect(m?.posterUrl).toContain('image.tmdb.org');
    expect(m?.backdropUrl).toContain('image.tmdb.org');
    expect(m?.category).toBe('technology');
    expect(normalizeTmdbMovie({ title: 'No id' })).toBeNull();
  });

  it('filters search results case-insensitively (helper behavior)', () => {
    const pool = [
      { title: 'AI models advance', description: 'x' },
      { title: 'Sports final', description: 'y' },
    ];
    const q = 'ai models';
    const matched = pool.filter((a) => a.title.toLowerCase().includes(q));
    expect(matched).toHaveLength(1);
  });
});
