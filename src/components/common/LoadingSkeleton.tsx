import { cn } from '@/lib/utils/format';

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-card border border-border bg-card p-4 shadow-card" aria-hidden="true">
      <div className="skeleton h-40 w-full rounded-lg" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn('skeleton h-3 rounded', i === 0 ? 'w-3/4' : i === 1 ? 'w-full' : 'w-1/2')}
          />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-card border border-border bg-card p-3" aria-hidden="true">
          <div className="skeleton h-14 w-14 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2 py-1">
            <div className="skeleton h-3 w-3/4 rounded" />
            <div className="skeleton h-3 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
