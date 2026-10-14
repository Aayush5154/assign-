import type { Category, Movie, NewsArticle } from '@/types/content';
import { TMDB_BACKDROP_BASE, TMDB_IMAGE_BASE } from '@/lib/constants/categories';
import { isSafeHttpUrl } from '@/lib/utils/format';

export const NEWSAPI_CATEGORY_MAP: Record<Category, string> = {
  technology: 'technology',
  business: 'business',
  finance: 'business',
  sports: 'sports',
  entertainment: 'entertainment',
  science: 'science',
  health: 'health',
};

interface NewsApiArticle {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  source?: { name?: string | null } | null;
  author?: string | null;
  publishedAt?: string | null;
}

export function normalizeNewsArticle(raw: NewsApiArticle, category: Category, index: number): NewsArticle | null {
  const title = (raw.title ?? '').trim();
  if (!title || title === '[Removed]') return null;
  const url = typeof raw.url === 'string' && isSafeHttpUrl(raw.url) ? raw.url : '';
  if (!url) return null;
  const imageUrl =
    typeof raw.urlToImage === 'string' && isSafeHttpUrl(raw.urlToImage) ? raw.urlToImage : null;
  let publishedAt = raw.publishedAt ?? new Date().toISOString();
  if (Number.isNaN(new Date(publishedAt).getTime())) publishedAt = new Date().toISOString();
  return {
    id: `news-${category}-${publishedAt}-${index}-${title.slice(0, 24).replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
    title,
    description: (raw.description ?? '').trim() || 'No description available for this story.',
    url,
    imageUrl,
    source: raw.source?.name?.trim() || 'Unknown source',
    author: raw.author?.trim() || null,
    publishedAt,
    category,
  };
}

interface TmdbMovie {
  id?: number;
  title?: string | null;
  name?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  vote_average?: number | null;
  vote_count?: number | null;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number | null;
}

const TMDB_GENRE_TO_CATEGORY: Record<number, Category> = {
  28: 'entertainment',
  12: 'entertainment',
  16: 'entertainment',
  35: 'entertainment',
  80: 'entertainment',
  99: 'science',
  18: 'entertainment',
  10751: 'entertainment',
  14: 'entertainment',
  36: 'entertainment',
  27: 'entertainment',
  10402: 'entertainment',
  9648: 'entertainment',
  10749: 'entertainment',
  878: 'technology',
  10770: 'sports',
  53: 'entertainment',
  10752: 'entertainment',
  37: 'entertainment',
};

export function movieCategoryForGenres(genreIds: number[]): Category {
  for (const gid of genreIds) {
    const mapped = TMDB_GENRE_TO_CATEGORY[gid];
    if (mapped && mapped !== 'entertainment') return mapped;
  }
  return 'entertainment';
}

export function normalizeTmdbMovie(raw: TmdbMovie, genreLookup?: Map<number, string>): Movie | null {
  if (typeof raw.id !== 'number') return null;
  const title = (raw.title ?? raw.name ?? '').trim();
  if (!title) return null;
  const releaseDate = raw.release_date || raw.first_air_date || null;
  const genreIds = raw.genre_ids ?? (raw.genres ?? []).map((g) => g.id);
  const genres = (raw.genres ??
    genreIds.map((id) => ({ id, name: genreLookup?.get(id) ?? 'Unknown' }))
  ).filter((g) => g && typeof g.id === 'number' && typeof g.name === 'string');
  return {
    id: `movie-${raw.id}`,
    tmdbId: raw.id,
    title,
    overview: (raw.overview ?? '').trim() || 'No overview available.',
    posterUrl: raw.poster_path ? `${TMDB_IMAGE_BASE}${raw.poster_path}` : null,
    backdropUrl: raw.backdrop_path ? `${TMDB_BACKDROP_BASE}${raw.backdrop_path}` : null,
    releaseDate,
    releaseYear: releaseDate ? releaseDate.slice(0, 4) : null,
    voteAverage: typeof raw.vote_average === 'number' ? Math.round(raw.vote_average * 10) / 10 : null,
    voteCount: typeof raw.vote_count === 'number' ? raw.vote_count : null,
    genres,
    runtime: typeof raw.runtime === 'number' ? raw.runtime : null,
    trailerKey: null,
    category: movieCategoryForGenres(genreIds),
  };
}

export function parsePage(value: string | null, def = 1): number {
  const n = Number.parseInt(value ?? '', 10);
  if (Number.isNaN(n) || n < 1 || n > 1000) return def;
  return n;
}
