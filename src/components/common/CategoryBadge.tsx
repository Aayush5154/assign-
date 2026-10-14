import { CATEGORY_LABELS } from '@/lib/constants/categories';
import type { Category } from '@/types/content';
import { cn } from '@/lib/utils/format';

export default function CategoryBadge({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-[var(--hover)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-secondary',
        className,
      )}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

export function SourceBadge({ label, demo }: { label: string; demo?: boolean }) {
  return (
    <span
      title={demo ? 'Demonstration content — not live data' : 'Live data'}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        demo ? 'bg-[var(--hover)] text-secondary' : 'bg-accent text-accent-fg',
      )}
    >
      {demo ? 'Demo' : label}
    </span>
  );
}
