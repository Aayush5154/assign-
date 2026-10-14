'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import CategoryFilters from '@/components/dashboard/CategoryFilters';
import NewsCard from '@/components/content/NewsCard';
import MovieCard from '@/components/content/MovieCard';
import SocialPostCard from '@/components/content/SocialPostCard';
import { GridSkeleton, ListSkeleton } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import LoadMoreTrigger from '@/components/common/LoadMoreTrigger';
import { useMoviesList, useNewsList, useSocialList } from '@/lib/api/client';
import { cn } from '@/lib/utils/format';

type Tab = 'all' | 'news' | 'movies' | 'social';

function FeedInner() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category');
  const categories = useAppSelector((s) => s.preferences.categories);
  const personalized = useAppSelector((s) => s.preferences.personalizedMode);
  const [tab, setTab] = useState<Tab>('all');
  const [filter, setFilter] = useState<string | null>(initialCat);

  const activeCategory = filter ?? (personalized ? (categories[0] ?? 'technology') : 'technology');
  const news = useNewsList(activeCategory);
  const movies = useMoviesList('popular');
  const social = useSocialList(personalized || filter ? activeCategory : null);

  const showNews = tab === 'all' || tab === 'news';
  const showMovies = tab === 'all' || tab === 'movies';
  const showSocial = tab === 'all' || tab === 'social';

  const loading = (showNews && news.loading) || (showMovies && movies.loading) || (showSocial && social.loading);
  const empty =
    (!showNews || news.items.length === 0) &&
    (!showMovies || movies.items.length === 0) &&
    (!showSocial || social.items.length === 0);

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-primary">Personalized Feed</h1>
      <p className="mt-1 text-sm text-secondary">
        {personalized
          ? `Curated from your interests: ${categories.join(', ')}.`
          : 'Showing a broad mix. Enable personalized mode in Settings to filter by your interests.'}
      </p>

      <div className="mt-4 flex gap-2" role="tablist" aria-label="Content type">
        {(['all', 'news', 'movies', 'social'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition',
              tab === t ? 'bg-accent text-accent-fg' : 'border border-border bg-card text-secondary hover:text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <CategoryFilters selected={filter} onSelect={setFilter} personalized={personalized} />
      </div>

      {loading ? (
        <div className="mt-6 space-y-6">
          <GridSkeleton count={6} />
          <ListSkeleton count={2} />
        </div>
      ) : empty ? (
        <div className="mt-6">
          <EmptyState
            title="No content for this filter"
            message="Try a different category or content type."
            action={
              <button
                type="button"
                onClick={() => {
                  setFilter(null);
                  setTab('all');
                }}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg"
              >
                Clear filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {showNews && (
            <section aria-label="News">
              <h2 className="mb-3 text-lg font-bold text-primary">News · {activeCategory}</h2>
              {news.error && news.items.length === 0 ? (
                <ErrorState title="Could not load news" message={news.error} onRetry={() => news.retry()} />
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {news.items.slice(0, tab === 'all' ? 6 : 12).map((a) => (
                      <NewsCard key={a.id} article={a} />
                    ))}
                  </div>
                  {tab === 'news' && (
                    <LoadMoreTrigger hasMore={news.hasMore} loading={news.loadingMore} onIntersect={news.loadMore} />
                  )}
                </>
              )}
            </section>
          )}
          {showMovies && (
            <section aria-label="Movies">
              <h2 className="mb-3 text-lg font-bold text-primary">Movies</h2>
              {movies.error && movies.items.length === 0 ? (
                <ErrorState title="Could not load movies" message={movies.error} onRetry={() => movies.retry()} />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                    {(tab === 'all' ? movies.items.slice(0, 6) : movies.items).map((m) => (
                      <MovieCard key={m.id} movie={m} />
                    ))}
                  </div>
                  {tab === 'movies' && (
                    <LoadMoreTrigger hasMore={movies.hasMore} loading={movies.loadingMore} onIntersect={movies.loadMore} />
                  )}
                </>
              )}
            </section>
          )}
          {showSocial && (
            <section aria-label="Social posts">
              <h2 className="mb-3 text-lg font-bold text-primary">Social · demo posts</h2>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {(tab === 'all' ? social.items.slice(0, 4) : social.items).map((p) => (
                  <SocialPostCard key={p.id} post={p} />
                ))}
              </div>
              {tab === 'social' && (
                <LoadMoreTrigger hasMore={social.hasMore} loading={social.loadingMore} onIntersect={social.loadMore} />
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense fallback={<GridSkeleton count={6} />}>
      <FeedInner />
    </Suspense>
  );
}
