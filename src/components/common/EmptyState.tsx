'use client';

import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  message = 'Try adjusting your filters or check back later.',
  action,
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border bg-card px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--hover)]">
        <Inbox className="h-5 w-5 text-secondary" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      <p className="max-w-md text-sm text-secondary">{message}</p>
      {action}
    </div>
  );
}
