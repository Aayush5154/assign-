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

const PersonalizedNewsWidget = memo(function PersonalizedNewsWidget({ category }: { category: string }) {
  const { items, loading, error, retry } = useNewsList(category);
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-card">
      {loading ? (
        <GridSkeleton count={3} />
      ) : error && items.length === 0 ? (
        <ErrorState title="Could not load news" message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState title="No stories" message="No stories for this interest right now." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Link href="/news" className="text-xs font-semibold text-accent hover:underline">
          View all news →
        </Link>
      </div>
    </div>
  );
});

const TrendingMoviesWidget = memo(function TrendingMoviesWidget() {
  const { items, loading, error, retry } = useMoviesList('trending');
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-card">
      {loading ? (
        <GridSkeleton count={3} />
      ) : error && items.length === 0 ? (
        <ErrorState title="Could not load movies" message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState title="No movies" message="No trending movies right now." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.slice(0, 6).map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] text-secondary/60">Data by TMDB</p>
        <Link href="/movies" className="text-xs font-semibold text-accent hover:underline">
          View all movies →
        </Link>
      </div>
    </div>
  );
});

const SocialFeedWidget = memo(function SocialFeedWidget({ category }: { category: string | null }) {
  const { items, loading, error, retry } = useSocialList(category);
  return (
    <div className="rounded-card border border-border bg-card p-5 shadow-card">
      {loading ? (
        <ListSkeleton count={3} />
      ) : error && items.length === 0 ? (
        <ErrorState title="Could not load posts" message={error} onRetry={retry} />
      ) : items.length === 0 ? (
        <EmptyState title="No posts" message="No posts for this interest right now." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.slice(0, 4).map((p) => (
            <SocialPostCard key={p.id} post={p} />
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Link href="/social" className="text-xs font-semibold text-accent hover:underline">
          View all posts →
        </Link>
      </div>
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

  useEffect(() => {
    setNow(new Date());
    document.title = 'PulseBoard — Overview';
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

  const newsCategory = personalized ? effectiveCategory : 'technology';

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
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
            {greeting}, Guest
          </h1>
          <p className="mt-0.5 text-xs text-secondary" suppressHydrationWarning>
            {now ? todayLabel(now) : ' '}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(resetLayout())}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-secondary transition hover:text-primary hover:border-zinc-500/40"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset layout
        </button>
      </div>

      <div className="mt-4">
        <CategoryFilters selected={personalized ? effectiveCategory : null} onSelect={setFilter} personalized={personalized} />
      </div>

      <div className="mt-6">
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
      </div>
    </div>
  );
}
