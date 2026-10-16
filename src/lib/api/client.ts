'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Movie, NewsArticle, PaginatedResponse, SocialPost } from '@/types/content';

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // keep default
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

interface ListState<T> {
  items: T[];
  page: number;
  totalPages: number;
  source: 'live' | 'demo';
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

/** Generic paginated fetcher with stale-response protection and dedupe. */
export function usePaginatedList<T>(buildUrl: (page: number) => string, depsKey: string) {
  const [state, setState] = useState<ListState<T>>({
    items: [],
    page: 0,
    totalPages: 1,
    source: 'demo',
    loading: true,
    loadingMore: false,
    error: null,
  });
  const requestId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    async (page: number, append: boolean) => {
      // Abort any previous in-flight request so we're never blocked
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const myId = ++requestId.current;
      setState((s) => ({
        ...s,
        loading: !append,
        loadingMore: append,
        error: append ? null : s.error,
      }));
      try {
        const data = await fetchJson<PaginatedResponse<T>>(buildUrl(page), ctrl.signal);
        if (requestId.current !== myId) return; // outdated response
        setState((s) => ({
          items: append ? [...s.items, ...data.results.filter((r) => !s.items.some((x) => (x as { id: string }).id === (r as { id: string }).id))] : data.results,
          page: data.page,
          totalPages: data.totalPages,
          source: data.source,
          loading: false,
          loadingMore: false,
          error: data.error ?? null,
        }));
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        if (requestId.current !== myId) return;
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          error: (err as Error).message,
        }));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depsKey],
  );

  useEffect(() => {
    setState({
      items: [],
      page: 0,
      totalPages: 1,
      source: 'demo',
      loading: true,
      loadingMore: false,
      error: null,
    });
    void load(1, false);
    return () => {
      // Abort on unmount or dependency change
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [load]);

  const loadMore = useCallback(() => {
    if (state.loading || state.loadingMore) return;
    if (state.page >= state.totalPages) return;
    void load(state.page + 1, true);
  }, [load, state.loading, state.loadingMore, state.page, state.totalPages]);

  const retry = useCallback(() => {
    void load(state.items.length > 0 ? state.page + 1 : 1, state.items.length > 0);
  }, [load, state.items.length, state.page]);

  return { ...state, loadMore, retry, hasMore: state.page < state.totalPages };
}

export function useNewsList(category: string) {
  return usePaginatedList<NewsArticle>(
    (page) => `/api/news?category=${encodeURIComponent(category)}&page=${page}`,
    `news-${category}`,
  );
}

export function useMoviesList(kind: 'popular' | 'trending') {
  return usePaginatedList<Movie>(
    (page) => `/api/movies/${kind}?page=${page}`,
    `movies-${kind}`,
  );
}

export function useSocialList(category: string | null) {
  const suffix = category ?? 'all';
  return usePaginatedList<SocialPost>(
    (page) =>
      `/api/social?${category ? `category=${encodeURIComponent(category)}&` : ''}page=${page}`,
    `social-${suffix}`,
  );
}
