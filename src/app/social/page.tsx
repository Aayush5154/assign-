'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/constants/categories';
import SocialPostCard from '@/components/content/SocialPostCard';
import { PageSpinner } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import LoadMoreTrigger from '@/components/common/LoadMoreTrigger';
import { useSocialList } from '@/lib/api/client';
import { cn } from '@/lib/utils/format';

export default function SocialPage() {
  const [category, setCategory] = useState<string | null>(null);
  const { items, loading, loadingMore, error, hasMore, loadMore, retry } = useSocialList(category);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-primary">Social</h1>
      <p className="mt-1 text-sm text-secondary" role="status">
        Simulated community posts for demonstration — every post is labeled as a demo. Likes persist locally.
      </p>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Post category">
        <button
          type="button"
          onClick={() => setCategory(null)}
          aria-pressed={category === null}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
            category === null ? 'bg-accent text-accent-fg' : 'border border-border bg-card text-secondary hover:text-primary',
          )}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(category === c.id ? null : c.id)}
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
          <PageSpinner label="Loading posts…" />
        ) : error && items.length === 0 ? (
          <ErrorState title="Could not load posts" message={error} onRetry={retry} />
        ) : items.length === 0 ? (
          <EmptyState title="No posts" message="No posts in this category yet." />
        ) : (
          <>
            <div className="space-y-4">
              {items.map((p) => (
                <SocialPostCard key={p.id} post={p} />
              ))}
            </div>
            <LoadMoreTrigger hasMore={hasMore} loading={loadingMore} onIntersect={loadMore} />
          </>
        )}
      </div>
    </div>
  );
}
