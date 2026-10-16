'use client';

import { useState } from 'react';
import MovieCard from '@/components/content/MovieCard';
import { PageSpinner } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import LoadMoreTrigger from '@/components/common/LoadMoreTrigger';
import { useMoviesList } from '@/lib/api/client';
import { cn } from '@/lib/utils/format';

export default function MoviesPage() {
  const [kind, setKind] = useState<'popular' | 'trending'>('popular');
  const { items, loading, loadingMore, error, hasMore, loadMore, retry, source } = useMoviesList(kind);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-primary">Movies</h1>
      <p className="mt-1 text-sm text-secondary" role="status">
        {source === 'demo'
          ? 'Demonstration titles — add TMDB_API_KEY for live recommendations.'
          : 'Live data from TMDB.'}{' '}
        {error && `Note: ${error}`}
      </p>

      <div className="mt-4 flex gap-2" role="tablist" aria-label="Movie list">
        {(['popular', 'trending'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition',
              kind === k ? 'bg-accent text-accent-fg' : 'border border-border bg-card text-secondary hover:text-primary',
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <PageSpinner label="Loading movies…" />
        ) : error && items.length === 0 ? (
          <ErrorState title="Could not load movies" message={error} onRetry={retry} />
        ) : items.length === 0 ? (
          <EmptyState title="No movies" message="No titles right now." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {items.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
            <LoadMoreTrigger hasMore={hasMore} loading={loadingMore} onIntersect={loadMore} />
          </>
        )}
      </div>
      <p className="mt-2 text-[11px] text-secondary">
        This product uses the TMDB API but is not endorsed or certified by TMDB.{' '}
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="underline">
          themoviedb.org
        </a>
      </p>
    </div>
  );
}
