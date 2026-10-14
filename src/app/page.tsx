'use client';

import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { RotateCcw } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetLayout, setWidgetOrder } from '@/features/dashboard/dashboardSlice';
import { WIDGET_TITLES } from '@/lib/constants/categories';
import { greetingForHour, todayLabel } from '@/lib/utils/format';
import SortableWidget from '@/components/dashboard/SortableWidget';
import {
  FavoritesPreviewCard,
  RecommendedCategoriesCard,
  TrendingTopicsCard,
} from '@/components/dashboard/RightRail';
import NewsCard from '@/components/content/NewsCard';
import MovieCard from '@/components/content/MovieCard';
import SocialPostCard from '@/components/content/SocialPostCard';
import { GridSkeleton, ListSkeleton } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import CategoryFilters from '@/components/dashboard/CategoryFilters';
import { useMoviesList, useNewsList, useSocialList } from '@/lib/api/client';

function DemoNotice({ source }: { source: 'live' | 'demo' }) {
  if (source === 'live') return null;
  return (
    <p className="mb-3 rounded-lg border border-border bg-[var(--hover)] px-3 py-2 text-xs text-secondary" role="status">
      Demonstration data — configure API keys in <code className="font-mono">.env.local</code> for live content.
    </p>
  );
}

const PersonalizedNewsWidget = memo(function PersonalizedNewsWidget({ category }: { category: string }) {
  const { items, loading, error, retry, source } = useNewsList(category);
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <DemoNotice source={source} />
      {loading ? (
        <GridSkeleton count={3} />
      ) : error && items.length === 0 ? (
        <ErrorState title="Could not load news" message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState title="No stories" message="No stories for this interest right now." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.slice(0, 6).map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      )}
      <Link href="/news" className="mt-3 block text-sm font-semibold text-accent hover:opacity-90">
        More news →
      </Link>
    </div>
  );
});

const TrendingMoviesWidget = memo(function TrendingMoviesWidget() {
  const { items, loading, error, retry, source } = useMoviesList('trending');
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <DemoNotice source={source} />
      {loading ? (
        <GridSkeleton count={3} />
      ) : error && items.length === 0 ? (
        <ErrorState title="Could not load movies" message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState title="No movies" message="No trending movies right now." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {items.slice(0, 6).map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-secondary">Data by TMDB</p>
        <Link href="/movies" className="text-sm font-semibold text-accent hover:opacity-90">
          More movies →
        </Link>
      </div>
    </div>
  );
});

const SocialFeedWidget = memo(function SocialFeedWidget({ category }: { category: string | null }) {
  const { items, loading, error, retry } = useSocialList(category);
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="mb-3 rounded-lg border border-border bg-[var(--hover)] px-3 py-2 text-xs text-secondary" role="status">
        Simulated social posts — clearly labeled demos, likes persist locally.
      </p>
      {loading ? (
        <ListSkeleton count={3} />
      ) : error && items.length === 0 ? (
        <ErrorState title="Could not load posts" message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState title="No posts" message="No posts for this interest right now." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {items.slice(0, 4).map((p) => (
            <SocialPostCard key={p.id} post={p} />
          ))}
        </div>
      )}
      <Link href="/social" className="mt-3 block text-sm font-semibold text-accent hover:opacity-90">
        More posts →
      </Link>
    </div>
  );
});

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const widgetOrder = useAppSelector((s) => s.dashboard.widgetOrder);
  const categories = useAppSelector((s) => s.preferences.categories);
  const personalized = useAppSelector((s) => s.preferences.personalizedMode);
  const [filter, setFilter] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  // Render the date only after mount: server and browser ICU locales can
  // format the same date differently, which would cause a hydration mismatch.
  useEffect(() => {
    setNow(new Date());
  }, []);

  const effectiveCategory = filter ?? categories[0] ?? 'technology';
  const socialCategory = personalized ? effectiveCategory : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    dispatch((_, getState) => {
      const order = (getState() as { dashboard: { widgetOrder: string[] } }).dashboard.widgetOrder;
      const from = order.indexOf(String(active.id));
      const to = order.indexOf(String(over.id));
      if (from < 0 || to < 0) return;
      const next = [...order];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      dispatch(setWidgetOrder(next));
    });
  }, [dispatch]);

  const greeting = useMemo(() => greetingForHour(now ? now.getHours() : 12), [now]);

  useEffect(() => {
    document.title = 'PulseBoard — Overview';
  }, []);

  const newsCategory = personalized ? effectiveCategory : 'technology';

  // Memoize widget map so React elements are stable across renders
  const widgets = useMemo<Record<string, React.ReactNode>>(() => ({
    'personalized-news': <PersonalizedNewsWidget category={newsCategory} />,
    'trending-movies': <TrendingMoviesWidget />,
    'social-feed': <SocialFeedWidget category={socialCategory} />,
    'trending-topics': (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TrendingTopicsCard />
        <RecommendedCategoriesCard />
      </div>
    ),
    recommended: <FavoritesPreviewCard />,
  }), [newsCategory, socialCategory]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {greeting}, Guest
          </h1>
          <p className="mt-1 text-sm text-secondary" suppressHydrationWarning>
            {now ? todayLabel(now) : ' '}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(resetLayout())}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-secondary transition hover:text-primary"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset layout
        </button>
      </div>

      <div className="mt-4">
        <CategoryFilters selected={personalized ? effectiveCategory : null} onSelect={setFilter} personalized={personalized} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={widgetOrder} strategy={verticalListSortingStrategy}>
            <div className="flex min-w-0 flex-col gap-8">
              {widgetOrder.map((id) => (
                <SortableWidget key={id} id={id} title={WIDGET_TITLES[id] ?? id}>
                  {widgets[id]}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-20 xl:self-start" aria-label="Highlights">
          <TrendingTopicsCard />
          <FavoritesPreviewCard />
          <RecommendedCategoriesCard />
        </aside>
      </div>
    </div>
  );
}
