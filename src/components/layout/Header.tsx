'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, Menu, Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { readLocalStorage, STORAGE_KEYS, writeLocalStorage } from '@/lib/storage/localStorage';
import ThemeToggle from '@/components/settings/ThemeToggle';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 300);
  const [recent, setRecent] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecent(readLocalStorage<string[]>(STORAGE_KEYS.recentSearches, []));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocused(false);
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (term: string) => {
    const q = term.trim();
    if (!q) return;
    const next = [q, ...recent.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 6);
    setRecent(next);
    writeLocalStorage(STORAGE_KEYS.recentSearches, next);
    setFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const suggestions = debounced.trim()
    ? recent.filter((r) => r.toLowerCase().includes(debounced.trim().toLowerCase())).slice(0, 5)
    : recent.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-3 sm:gap-3 lg:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-[var(--hover)] hover:text-primary lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>

        <div ref={boxRef} className="relative min-w-0 flex-1 sm:max-w-md">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              // Read from the form directly so fast Enter presses work even if
              // React state hasn't flushed the latest keystroke yet.
              const data = new FormData(e.currentTarget);
              const raw = (data.get('q') as string | null) ?? value;
              submit(raw);
            }}
          >
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded p-1 text-secondary hover:text-primary"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              type="search"
              name="q"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setFocused(false);
              }}
              placeholder="Search news, movies, posts…"
              aria-label="Global search"
              autoComplete="off"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-16 text-sm text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
            />
            {value && (
              <button
                type="button"
                onClick={() => setValue('')}
                aria-label="Clear search"
                className="absolute right-12 top-1/2 -translate-y-1/2 rounded p-1 text-secondary hover:text-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <kbd
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-[var(--hover)] px-1.5 py-0.5 text-[10px] font-semibold text-secondary sm:block"
              aria-hidden="true"
            >
              Enter
            </kbd>
          </form>

          {focused && suggestions.length > 0 && (
            <div
              className="absolute inset-x-0 top-12 z-40 overflow-hidden rounded-xl border border-border bg-card shadow-card"
              role="listbox"
              aria-label="Recent searches"
            >
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                Recent
              </p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="option"
                  aria-selected="false"
                  onClick={() => {
                    setValue(s);
                    submit(s);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary hover:bg-[var(--hover)]"
                >
                  <Search className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Notifications (demo)"
            title="Notifications"
            onClick={() => router.push('/trending')}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-secondary transition hover:text-primary"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setUserOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={userOpen}
              aria-label="User menu"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card py-1.5 pl-1.5 pr-2 transition hover:text-primary"
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-fg"
                aria-hidden="true"
              >
                G
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
            </button>
            {userOpen && (
              <div
                role="menu"
                aria-label="User menu"
                className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-card"
              >
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-primary">Guest User</p>
                  <p className="text-xs text-secondary">Preferences stored locally</p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    router.push('/settings');
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-[var(--hover)]"
                >
                  Preferences
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    router.push('/favorites');
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-[var(--hover)]"
                >
                  Favorites
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
