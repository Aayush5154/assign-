'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NewsCard from '@/components/content/NewsCard';
import MovieCard from '@/components/content/MovieCard';
import SocialPostCard from '@/components/content/SocialPostCard';
import { PageSpinner } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import type { Movie, NewsArticle, SocialPost } from '@/types/content';
import { cn } from '@/lib/utils/format';

type Tab = 'all' | 'news' | 'movies' | 'social';

interface SearchState {
  news: NewsArticle[];
  movies: Movie[];
  social: SocialPost[];
  loading: boolean;
  error: string | null;
  newsSource: string | null;
  moviesSource: string | null;
}

function SearchInner() {
  const searchParams = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim();
  const [tab, setTab] = useState<Tab>('all');
  const [state, setState] = useState<SearchState>({
    news: [],
    movies: [],
    social: [],
    loading: false,
    error: null,
    newsSource: null,
    moviesSource: null,
  });
  const requestId = useRef(0);

  useEffect(() => {
    if (!q) {
      setState({ news: [], movies: [], social: [], loading: false, error: null, newsSource: null, moviesSource: null });
      return;
    }
    const myId = ++requestId.current;
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    Promise.allSettled([
      fetch(`/api/news/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal }).then(async (r) => {
        if (!r.ok) throw new Error('News search failed');
        return (await r.json()) as { results: NewsArticle[]; source: string; error?: string };
      }),
      fetch(`/api/movies/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal }).then(async (r) => {
        if (!r.ok) throw new Error('Movie search failed');
        return (await r.json()) as { results: Movie[]; source: string; error?: string };
      }),
      fetch(`/api/social?q=${encodeURIComponent(q)}`, { signal: ctrl.signal }).then(async (r) => {
        if (!r.ok) throw new Error('Social search failed');
        return (await r.json()) as { results: SocialPost[] };
      }),
    ]).then((results) => {
      if (requestId.current !== myId) return; // outdated response — ignore
      const [n, m, s] = results;
      const errors: string[] = [];
      const news = n.status === 'fulfilled' ? n.value.results : [];
      const movies = m.status === 'fulfilled' ? m.value.results : [];
      const social = s.status === 'fulfilled' ? s.value.results : [];
      if (n.status === 'rejected') errors.push('news');
      if (m.status === 'rejected') errors.push('movies');
      if (s.status === 'rejected') errors.push('social');
      setState({
        news,
        movies,
        social,
        loading: false,
        error: errors.length === 3 ? 'All search providers failed. Please retry.' : errors.length > 0 ? `Some sources failed (${errors.join(', ')}). Showing available results.` : null,
        newsSource: n.status === 'fulfilled' ? n.value.source : null,
        moviesSource: m.status === 'fulfilled' ? m.value.source : null,
      });
    });

    return () => ctrl.abort();
  }, [q]);

  const visibleNews = tab === 'all' || tab === 'news' ? state.news : [];
  const visibleMovies = tab === 'all' || tab === 'movies' ? state.movies : [];
  const visibleSocial = tab === 'all' || tab === 'social' ? state.social : [];
  const total = visibleNews.length + visibleMovies.length + visibleSocial.length;

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-primary">
        {q ? (
          <>
            Results for <span className="text-accent">“{q}”</span>
          </>
        ) : (
          'Search'
        )}
      </h1>
      <p className="mt-1 text-sm text-secondary" role="status">
        {!q
          ? 'Use the search bar above to search news, movies, and demo posts.'
          : state.loading
            ? 'Searching…'
            : `${total} result${total === 1 ? '' : 's'} across news, movies, and social.`}
      </p>

      {state.error && (
        <p className="mt-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-[var(--error)]" role="alert">
          {state.error}
        </p>
      )}

      {(state.newsSource === 'demo' || state.moviesSource === 'demo') && q && !state.loading && (
        <p className="mt-3 rounded-lg border border-border bg-[var(--hover)] px-3 py-2 text-xs text-secondary" role="status">
          Some results are demonstration content — configure API keys for live search.
        </p>
      )}

      {q && (
        <div className="mt-4 flex gap-2" role="tablist" aria-label="Search categories">
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
      )}

      <div className="mt-6">
        {!q ? (
          <EmptyState title="Search everything" message="Try “artificial intelligence”, “Interstellar”, or “markets”." />
        ) : state.loading ? (
          <PageSpinner label="Searching…" />
        ) : total === 0 && !state.error ? (
          <EmptyState title="No results" message={`Nothing matched “${q}”. Try different keywords.`} />
        ) : total === 0 ? (
          <ErrorState title="Search failed" message={state.error ?? 'Please try again.'} onRetry={() => window.location.reload()} />
        ) : (
          <div className="space-y-10">
            {visibleNews.length > 0 && (
              <section aria-label="News results">
                <h2 className="mb-3 text-lg font-bold text-primary">News ({visibleNews.length})</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleNews.map((a) => (
                    <NewsCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}
            {visibleMovies.length > 0 && (
              <section aria-label="Movie results">
                <h2 className="mb-3 text-lg font-bold text-primary">Movies ({visibleMovies.length})</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
                  {visibleMovies.map((m) => (
                    <MovieCard key={m.id} movie={m} />
                  ))}
                </div>
              </section>
            )}
            {visibleSocial.length > 0 && (
              <section aria-label="Social results">
                <h2 className="mb-3 text-lg font-bold text-primary">Social · demo ({visibleSocial.length})</h2>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {visibleSocial.map((p) => (
                    <SocialPostCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading search…" />}>
      <SearchInner />
    </Suspense>
  );
}
