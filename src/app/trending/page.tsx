'use client';

import { useState } from 'react';
import MovieCard from '@/components/content/MovieCard';
import { PageSpinner } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import LoadMoreTrigger from '@/components/common/LoadMoreTrigger';
import { TrendingTopicsCard } from '@/components/dashboard/RightRail';
import { useMoviesList } from '@/lib/api/client';
import { cn } from '@/lib/utils/format';

export default function TrendingPage() {
  const [kind, setKind] = useState<'trending' | 'popular'>('trending');
  const { items, loading, loadingMore, error, hasMore, loadMore, retry, source } = useMoviesList(kind);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-primary">Trending</h1>
      <p className="mt-1 text-sm text-secondary" role="status">
        {source === 'demo'
          ? 'Showing demonstration movies — add TMDB_API_KEY for live trending titles.'
          : 'Live trending titles from TMDB.'}
      </p>

      <div className="mt-4 flex gap-2" role="tablist" aria-label="Trending kind">
        {(['trending', 'popular'] as const).map((k) => (
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {loading ? (
            <PageSpinner label="Loading trending…" />
          ) : error && items.length === 0 ? (
            <ErrorState title="Could not load trending" message={error} onRetry={retry} />
          ) : items.length === 0 ? (
            <EmptyState title="Nothing trending" message="Check back later." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
              <LoadMoreTrigger hasMore={hasMore} loading={loadingMore} onIntersect={loadMore} />
            </>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <TrendingTopicsCard />
        </aside>
      </div>
    </div>
  );
}
