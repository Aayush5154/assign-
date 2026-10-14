'use client';

import { Moon, Sun } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectTheme, toggleTheme } from '@/features/theme/themeSlice';

export default function ThemeToggle() {
  const mode = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const isDark = mode !== 'light';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-secondary transition hover:text-primary"
    >
      {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
