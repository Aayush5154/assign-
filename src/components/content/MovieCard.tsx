'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clapperboard, Play } from 'lucide-react';
import type { Movie } from '@/types/content';
import { getYear } from '@/lib/utils/format';
import FavoriteButton from '@/components/common/FavoriteButton';
import { StarRating } from '@/components/content/NewsCard';

const MovieCard = memo(function MovieCard({ movie }: { movie: Movie }) {
  const [imgError, setImgError] = useState(false);
  const showPoster = movie.posterUrl && !imgError;

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-500/40 hover:shadow-md">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--hover)]">
        {showPoster ? (
          <Image
            src={movie.posterUrl as string}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <Clapperboard className="h-8 w-8 text-secondary/40" aria-hidden="true" />
            <span className="text-xs font-semibold text-secondary">{movie.title}</span>
          </div>
        )}
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton
            id={movie.id}
            type="movie"
            title={movie.title}
            subtitle={movie.releaseYear}
            imageUrl={movie.posterUrl}
            url={`/movie/${movie.tmdbId}`}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center justify-between text-xs text-secondary">
          <span>{getYear(movie.releaseDate)}</span>
          <StarRating value={movie.voteAverage} />
        </div>
        <h3 className="mt-1.5 line-clamp-1 text-sm font-semibold text-primary group-hover:text-accent transition-colors">
          {movie.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-secondary leading-relaxed">{movie.overview}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Link
            href={`/movie/${movie.tmdbId}`}
            className="text-xs font-medium text-accent hover:underline"
          >
            View details →
          </Link>
          {movie.trailerKey && (
            <a
              href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Play trailer for ${movie.title}`}
              className="inline-flex items-center justify-center rounded p-1 text-secondary hover:text-accent"
              title="Watch Trailer"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
});

export default MovieCard;
