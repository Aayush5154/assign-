'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Play, Star } from 'lucide-react';
import type { Movie } from '@/types/content';
import { formatDate } from '@/lib/utils/format';
import FavoriteButton from '@/components/common/FavoriteButton';
import MovieCard from '@/components/content/MovieCard';
import { PageSpinner } from '@/components/common/LoadingSkeleton';
import ErrorState from '@/components/common/ErrorState';

interface DetailResponse {
  movie: Movie;
  recommendations: Movie[];
  source: 'live' | 'demo';
  trailerKey: string | null;
}

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/movies/${encodeURIComponent(id)}`);
      if (res.status === 404) throw new Error('Movie not found.');
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Could not load movie details.');
      }
      const json = (await res.json()) as DetailResponse;
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageSpinner label="Loading movie details…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/movies" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to movies
        </Link>
        <ErrorState title="Could not load movie" message={error ?? 'Unknown error.'} onRetry={load} />
      </div>
    );
  }

  const { movie, recommendations, source, trailerKey } = data;
  const trailer = trailerKey ?? movie.trailerKey;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/movies" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to movies
      </Link>

      {source === 'demo' && (
        <p className="mb-3 rounded-lg border border-border bg-[var(--hover)] px-3 py-2 text-xs text-secondary" role="status">
          Demonstration details — add TMDB_API_KEY for live data with trailers and recommendations.
        </p>
      )}

      <div className="overflow-hidden rounded-card border border-border bg-card shadow-card">
        {movie.backdropUrl && (
          <div className="relative h-56 w-full sm:h-80">
            <Image src={movie.backdropUrl} alt={`${movie.title} backdrop`} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
          </div>
        )}
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
          <div className="relative aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl bg-[var(--hover)] sm:w-52">
            {movie.posterUrl ? (
              <Image src={movie.posterUrl} alt={`${movie.title} poster`} fill className="object-cover" unoptimized />
            ) : (
              <span className="flex h-full items-center justify-center p-4 text-center text-sm text-secondary">
                Poster unavailable
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-primary sm:text-3xl">{movie.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-secondary">
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" aria-hidden="true" />
                {movie.voteAverage != null ? movie.voteAverage.toFixed(1) : '—'}
                {movie.voteCount != null && <span className="font-normal text-secondary">({movie.voteCount.toLocaleString()} votes)</span>}
              </span>
              <span>{formatDate(movie.releaseDate)}</span>
              {movie.runtime != null && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {movie.runtime} min
                </span>
              )}
            </p>
            {movie.genres.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-1.5" aria-label="Genres">
                {movie.genres.map((g) => (
                  <span key={g.id} className="rounded-full border border-border bg-[var(--hover)] px-2.5 py-0.5 text-xs font-medium text-secondary">
                    {g.name}
                  </span>
                ))}
              </p>
            )}
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-primary">{movie.overview}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <FavoriteButton
                id={movie.id}
                type="movie"
                title={movie.title}
                subtitle={movie.releaseYear}
                imageUrl={movie.posterUrl}
                url={`/movie/${movie.tmdbId}`}
              />
              {trailer ? (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg transition hover:opacity-90"
                >
                  <Play className="h-4 w-4" aria-hidden="true" /> Watch trailer
                </a>
              ) : (
                <span className="inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm text-secondary">
                  Trailer unavailable
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-8" aria-label="Recommended movies">
          <h2 className="mb-3 text-lg font-bold text-primary">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            {recommendations.slice(0, 6).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </section>
      )}
      <p className="mt-6 text-[11px] text-secondary">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>
    </div>
  );
}
