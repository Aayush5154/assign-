'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-card border border-border bg-card px-6 py-10 text-center"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--hover)]">
        <AlertTriangle className="h-5 w-5 text-[var(--error)]" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      <p className="max-w-md text-sm text-secondary">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg transition hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
