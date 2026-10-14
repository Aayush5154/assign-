'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearFavorites, selectFavorites } from '@/features/favorites/favoritesSlice';
import EmptyState from '@/components/common/EmptyState';
import NewsCard from '@/components/content/NewsCard';
import MovieCard from '@/components/content/MovieCard';
import SocialPostCard from '@/components/content/SocialPostCard';
import { DEMO_MOVIES, DEMO_NEWS, DEMO_SOCIAL } from '@/lib/demo-data';
import type { FavoriteType } from '@/types/content';
import { cn } from '@/lib/utils/format';

type Filter = 'all' | FavoriteType;

export default function FavoritesPage() {
  const favorites = useAppSelector(selectFavorites);
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = useMemo(
    () => (filter === 'all' ? favorites : favorites.filter((f) => f.type === filter)),
    [favorites, filter],
  );

  const movieById = useMemo(() => new Map(DEMO_MOVIES.map((m) => [m.id, m])), []);
  const newsById = useMemo(() => new Map(DEMO_NEWS.map((n) => [n.id, n])), []);
  const socialById = useMemo(() => new Map(DEMO_SOCIAL.map((s) => [s.id, s])), []);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Favorites</h1>
          <p className="mt-1 text-sm text-secondary" role="status">
            {favorites.length === 0
              ? 'Saved stories, movies, and posts will appear here.'
              : `${favorites.length} saved item${favorites.length === 1 ? '' : 's'} · stored in this browser.`}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch(clearFavorites())}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-secondary transition hover:text-primary"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear all
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2" role="tablist" aria-label="Filter favorites">
        {(['all', 'news', 'movie', 'social'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition',
              filter === f ? 'bg-accent text-accent-fg' : 'border border-border bg-card text-secondary hover:text-primary',
            )}
          >
            {f === 'movie' ? 'Movies' : f === 'news' ? 'News' : f === 'social' ? 'Social' : 'All'}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={favorites.length === 0 ? 'No favorites yet' : 'No favorites of this type'}
            message={
              favorites.length === 0
                ? 'Tap the heart icon on any news story, movie, or post to save it for later.'
                : 'Try a different filter.'
            }
            action={
              <Link
                href="/feed"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg"
              >
                Discover content
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((f) => {
            if (f.type === 'news') {
              const full = newsById.get(f.id);
              if (!full) {
                return (
                  <a
                    key={`${f.type}-${f.id}`}
                    href={f.url ?? '#'}
                    target={f.url ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="rounded-card border border-border bg-card p-4 text-sm font-semibold text-primary hover:border-accent"
                  >
                    {f.title}
                  </a>
                );
              }
              return <NewsCard key={f.id} article={full} />;
            }
            if (f.type === 'movie') {
              const full = movieById.get(f.id);
              if (!full) {
                return (
                  <Link
                    key={`${f.type}-${f.id}`}
                    href={f.url ?? '/movies'}
                    className="rounded-card border border-border bg-card p-4 text-sm font-semibold text-primary hover:border-accent"
                  >
                    {f.title}
                  </Link>
                );
              }
              return <MovieCard key={f.id} movie={full} />;
            }
            const full = socialById.get(f.id);
            if (!full) {
              return (
                <Link
                  key={`${f.type}-${f.id}`}
                  href="/social"
                  className="rounded-card border border-border bg-card p-4 text-sm font-semibold text-primary hover:border-accent"
                >
                  {f.title}
                </Link>
              );
            }
            return <SocialPostCard key={f.id} post={full} />;
          })}
        </div>
      )}
    </div>
  );
}
