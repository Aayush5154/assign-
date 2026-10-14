'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  resetPreferences,
  setCategories,
  setPersonalizedMode,
} from '@/features/preferences/preferencesSlice';
import { CATEGORIES } from '@/lib/constants/categories';
import { preferencesSchema, type PreferencesFormValues } from '@/lib/validation/schemas';
import { cn } from '@/lib/utils/format';

export default function PreferencesForm() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.preferences.categories);
  const personalizedMode = useAppSelector((s) => s.preferences.personalizedMode);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    values: { categories, personalizedMode },
  });

  const watched = watch();

  const toggle = (id: (typeof CATEGORIES)[number]['id']) => {
    const next = watched.categories.includes(id)
      ? watched.categories.filter((c) => c !== id)
      : [...watched.categories, id];
    setValue('categories', next, { shouldValidate: true });
  };

  const onSubmit = (values: PreferencesFormValues) => {
    dispatch(setCategories(values.categories));
    dispatch(setPersonalizedMode(values.personalizedMode));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="Content preferences"
      className="rounded-card border border-border bg-card p-5 shadow-card"
    >
      <h2 className="text-base font-bold text-primary">Interests</h2>
      <p className="mt-1 text-sm text-secondary">
        Select the topics you care about. Your feed updates instantly and is saved in this browser.
      </p>

      <fieldset className="mt-4">
        <legend className="sr-only">Interest categories</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CATEGORIES.map((c) => {
            const active = watched.categories.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                aria-pressed={active}
                className={cn(
                  'rounded-xl border p-3 text-left transition',
                  active
                    ? 'border-accent bg-[var(--hover)]'
                    : 'border-border hover:border-secondary',
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-4 w-4 items-center justify-center rounded border',
                      active ? 'border-accent bg-accent text-accent-fg' : 'border-secondary',
                    )}
                  >
                    {active && '✓'}
                  </span>
                  {c.label}
                </span>
                <span className="mt-1 block text-xs text-secondary">{c.description}</span>
              </button>
            );
          })}
        </div>
        {errors.categories && (
          <p role="alert" className="mt-2 text-sm text-[var(--error)]">
            {errors.categories.message}
          </p>
        )}
      </fieldset>

      <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border p-3">
        <span>
          <span className="block text-sm font-semibold text-primary">Personalized mode</span>
          <span className="block text-xs text-secondary">
            When on, the feed only shows your selected interests.
          </span>
        </span>
        <input
          type="checkbox"
          checked={watched.personalizedMode}
          onChange={(e) => setValue('personalizedMode', e.target.checked)}
          aria-label="Personalized mode"
          className="h-5 w-5 accent-[#FFD700]"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90"
        >
          <Save className="h-4 w-4" aria-hidden="true" /> Save preferences
        </button>
        <button
          type="button"
          onClick={() => dispatch(resetPreferences())}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-secondary transition hover:text-primary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset preferences
        </button>
      </div>
    </form>
  );
}
