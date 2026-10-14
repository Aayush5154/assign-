'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetLayout } from '@/features/dashboard/dashboardSlice';
import { resetPreferences } from '@/features/preferences/preferencesSlice';
import { clearFavorites } from '@/features/favorites/favoritesSlice';
import PreferencesForm from '@/components/settings/PreferencesForm';
import ThemeToggle from '@/components/settings/ThemeToggle';
import { selectTheme } from '@/features/theme/themeSlice';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-primary">Settings</h1>
      <p className="mt-1 text-sm text-secondary">
        No account needed — preferences are stored locally in the current browser.
      </p>

      <div className="mt-6 space-y-4">
        <PreferencesForm />

        <section
          aria-label="Appearance"
          className="rounded-card border border-border bg-card p-5 shadow-card"
        >
          <h2 className="text-base font-bold text-primary">Appearance</h2>
          <p className="mt-1 text-sm text-secondary">
            Current theme: <strong className="capitalize text-primary">{theme}</strong> (dark by default).
          </p>
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </section>

        <section
          aria-label="Dashboard layout"
          className="rounded-card border border-border bg-card p-5 shadow-card"
        >
          <h2 className="text-base font-bold text-primary">Dashboard layout</h2>
          <p className="mt-1 text-sm text-secondary">
            Widget order persists across reloads. Reset to restore the default arrangement.
          </p>
          <button
            type="button"
            onClick={() => dispatch(resetLayout())}
            className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-secondary transition hover:text-primary"
          >
            Reset layout
          </button>
        </section>

        <section
          aria-label="Data management"
          className="rounded-card border border-border bg-card p-5 shadow-card"
        >
          <h2 className="text-base font-bold text-primary">Data</h2>
          <p className="mt-1 text-sm text-secondary">
            Clear locally stored preferences or favorites. This cannot be undone.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => dispatch(resetPreferences())}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-secondary transition hover:text-primary"
            >
              Reset preferences
            </button>
            <button
              type="button"
              onClick={() => dispatch(clearFavorites())}
              className="rounded-lg border border-[var(--error)] px-4 py-2 text-sm font-semibold text-[var(--error)] transition hover:opacity-90"
            >
              Clear favorites
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
