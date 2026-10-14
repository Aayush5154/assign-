'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clapperboard, Play } from 'lucide-react';
import type { Movie } from '@/types/content';
import { getYear } from '@/lib/utils/format';
import FavoriteButton from '@/components/common/FavoriteButton';
import { StarRating } from '@/components/content/NewsCard';

const MovieCard = memo(function MovieCard({ movie }: { movie: Movie }) {
  const [imgError, setImgError] = useState(false);
  const showPoster = movie.posterUrl && !imgError;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition hover:-translate-y-0.5"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--hover)]">
        {showPoster ? (
          <Image
            src={movie.posterUrl as string}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={() => setImgError(true)}

          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <Clapperboard className="h-8 w-8 text-secondary/60" aria-hidden="true" />
            <span className="text-sm font-semibold text-secondary">{movie.title}</span>
            <span className="text-xs text-secondary/70">Poster unavailable</span>
          </div>
        )}
        <div className="absolute right-3 top-3">
          <FavoriteButton
            id={movie.id}
            type="movie"
            title={movie.title}
            subtitle={movie.releaseYear}
            imageUrl={movie.posterUrl}
            url={`/movie/${movie.tmdbId}`}
          />
        </div>
        {movie.isDemo && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            Demo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-[15px] font-semibold text-primary">{movie.title}</h3>
        <div className="flex items-center justify-between text-xs text-secondary">
          <span>{getYear(movie.releaseDate)}</span>
          <StarRating value={movie.voteAverage} />
        </div>
        <p className="line-clamp-2 text-[13px] text-secondary">{movie.overview}</p>
        <div className="mt-auto flex gap-2 pt-3">
          <Link
            href={`/movie/${movie.tmdbId}`}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg transition hover:opacity-90"
          >
            View details
          </Link>
          {movie.trailerKey ? (
            <a
              href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Play trailer for ${movie.title}`}
              className="inline-flex h-[38px] w-[42px] items-center justify-center rounded-lg border border-border bg-[var(--hover)] text-primary transition hover:text-accent"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
});

export default MovieCard;
