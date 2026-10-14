'use client';

import { CATEGORIES } from '@/lib/constants/categories';
import { cn } from '@/lib/utils/format';

export default function CategoryFilters({
  selected,
  onSelect,
  personalized,
}: {
  selected: string | null;
  onSelect: (c: string | null) => void;
  personalized: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label="Interest filters"
      >
        <button
          type="button"
          onClick={() => onSelect(null)}
          aria-pressed={selected === null}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
            selected === null
              ? 'bg-accent text-accent-fg'
              : 'border border-border bg-card text-secondary hover:text-primary',
          )}
        >
          {personalized ? 'My mix' : 'All'}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(selected === c.id ? null : c.id)}
            aria-pressed={selected === c.id}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
              selected === c.id
                ? 'bg-accent text-accent-fg'
                : 'border border-border bg-card text-secondary hover:text-primary',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>
      {personalized && (
        <p className="text-xs text-secondary" role="status">
          Personalized mode is on — the feed prioritizes your selected interests. Manage them in{' '}
          <a href="/settings" className="font-semibold text-accent hover:opacity-90">
            Settings
          </a>
          .
        </p>
      )}
    </div>
  );
}
