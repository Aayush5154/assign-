'use client';

import { useEffect, useRef } from 'react';

export function LoadMoreTrigger({
  hasMore,
  loading,
  onIntersect,
}: {
  hasMore: boolean;
  loading: boolean;
  onIntersect: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin: '400px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, onIntersect]);

  if (!hasMore) {
    return (
      <p className="py-6 text-center text-sm text-secondary" role="status">
        You&apos;re all caught up.
      </p>
    );
  }

  return (
    <div ref={ref} className="flex justify-center py-6" aria-hidden={!loading}>
      {loading ? (
        <span role="status" aria-label="Loading more" className="flex items-center gap-2 text-sm text-secondary">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
          Loading more…
        </span>
      ) : (
        <button
          type="button"
          onClick={onIntersect}
          className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-accent"
        >
          Load more
        </button>
      )}
    </div>
  );
}

export default LoadMoreTrigger;
