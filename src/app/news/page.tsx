'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/constants/categories';
import { useAppSelector } from '@/store/hooks';
import NewsCard from '@/components/content/NewsCard';
import { GridSkeleton } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import LoadMoreTrigger from '@/components/common/LoadMoreTrigger';
import { useNewsList } from '@/lib/api/client';
import { cn } from '@/lib/utils/format';

export default function NewsPage() {
  const prefs = useAppSelector((s) => s.preferences.categories);
  const [category, setCategory] = useState(prefs[0] ?? 'technology');
  const { items, loading, loadingMore, error, hasMore, loadMore, retry, source } = useNewsList(category);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-primary">News</h1>
      <p className="mt-1 text-sm text-secondary" role="status">
        {source === 'demo'
          ? 'Demonstration articles — add NEWS_API_KEY for live headlines.'
          : 'Live headlines via NewsAPI.'}{' '}
        {error && `Note: ${error}`}
      </p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="News category">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
              category === c.id ? 'bg-accent text-accent-fg' : 'border border-border bg-card text-secondary hover:text-primary',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <GridSkeleton count={9} />
        ) : error && items.length === 0 ? (
          <ErrorState title="Could not load news" message={error} onRetry={retry} />
        ) : items.length === 0 ? (
          <EmptyState title="No stories" message={`No stories in ${category} right now.`} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
            <LoadMoreTrigger hasMore={hasMore} loading={loadingMore} onIntersect={loadMore} />
          </>
        )}
      </div>
    </div>
  );
}
