'use client';

import Link from 'next/link';
import { Flame, Heart } from 'lucide-react';
import { TRENDING_TOPICS } from '@/lib/demo-data';
import { CATEGORIES } from '@/lib/constants/categories';
import { useAppSelector } from '@/store/hooks';
import { selectFavorites } from '@/features/favorites/favoritesSlice';
import { selectCategories } from '@/features/preferences/preferencesSlice';

export function TrendingTopicsCard() {
  return (
    <div className="rounded-card border border-border bg-card p-4 shadow-card">
      <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
        <Flame className="h-4 w-4 text-accent" aria-hidden="true" /> Trending topics
      </h3>
      <ul className="mt-3 space-y-2.5">
        {TRENDING_TOPICS.map((t) => (
          <li key={t.tag} className="flex items-center justify-between gap-2 text-sm">
            <Link href={`/search?q=${encodeURIComponent(t.tag)}`} className="truncate font-medium text-primary hover:text-accent">
              {t.tag}
            </Link>
            <span className="shrink-0 text-xs text-secondary">{t.count}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-border pt-2 text-[11px] text-secondary">
        Sample topics for demonstration.
      </p>
    </div>
  );
}

export function FavoritesPreviewCard() {
  const favorites = useAppSelector(selectFavorites);
  const preview = favorites.slice(0, 4);

  return (
    <div className="rounded-card border border-border bg-card p-4 shadow-card">
      <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
        <Heart className="h-4 w-4 text-accent" aria-hidden="true" /> Quick-access favorites
        <span className="ml-auto rounded-full bg-[var(--hover)] px-2 py-0.5 text-[11px] text-secondary">
          {favorites.length}
        </span>
      </h3>
      {preview.length === 0 ? (
        <p className="mt-3 text-sm text-secondary">
          No favorites yet. Tap the heart on any card to save it here.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {preview.map((f) => (
            <li key={`${f.type}-${f.id}`}>
              <Link
                href={f.url ?? (f.type === 'movie' ? '/movies' : f.type === 'news' ? '/news' : '/social')}
                className="block truncate rounded-lg px-2 py-1.5 text-sm font-medium text-primary transition hover:bg-[var(--hover)]"
              >
                {f.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/favorites"
        className="mt-3 block text-center text-sm font-semibold text-accent hover:opacity-90"
      >
        View all favorites
      </Link>
    </div>
  );
}

export function RecommendedCategoriesCard() {
  const selected = useAppSelector(selectCategories);
  return (
    <div className="rounded-card border border-border bg-card p-4 shadow-card">
      <h3 className="text-sm font-bold text-primary">Recommended categories</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const active = selected.includes(c.id);
          return (
            <Link
              key={c.id}
              href={`/feed?category=${c.id}`}
              aria-pressed={active}
              className={
                active
                  ? 'rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-fg'
                  : 'rounded-full border border-border bg-[var(--hover)] px-3 py-1 text-xs font-medium text-secondary transition hover:text-primary'
              }
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
