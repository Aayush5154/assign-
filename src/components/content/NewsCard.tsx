'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Star } from 'lucide-react';
import type { NewsArticle } from '@/types/content';
import { formatRelativeTime, safeExternalUrl, truncate } from '@/lib/utils/format';
import CategoryBadge, { SourceBadge } from '@/components/common/CategoryBadge';
import FavoriteButton from '@/components/common/FavoriteButton';

const NewsCard = memo(function NewsCard({ article }: { article: NewsArticle }) {
  const [imgError, setImgError] = useState(false);
  const safeUrl = safeExternalUrl(article.url);
  const showImage = article.imageUrl && !imgError;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition hover:-translate-y-0.5"
    >
      <div className="relative h-44 w-full overflow-hidden bg-[var(--hover)]">
        {showImage ? (
          <Image
            src={article.imageUrl as string}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={() => setImgError(true)}

          />
        ) : (
          <div className="flex h-full w-full flex-col justify-end p-4" aria-hidden="true">
            <span className="text-2xl font-bold leading-tight text-secondary/60">
              {article.source.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-xs font-medium text-secondary/80">{article.source}</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <CategoryBadge category={article.category} className="bg-black/60 text-white backdrop-blur" />
          {article.isDemo && <SourceBadge label="Demo" demo />}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-primary">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-secondary">{truncate(article.description, 140)}</p>
        <p className="mt-auto flex items-center justify-between pt-2 text-xs text-secondary">
          <span className="truncate font-medium">{article.source}</span>
          <time dateTime={article.publishedAt}>{formatRelativeTime(article.publishedAt)}</time>
        </p>
        <div className="flex items-center gap-2 pt-1">
          <FavoriteButton
            id={article.id}
            type="news"
            title={article.title}
            subtitle={article.source}
            imageUrl={article.imageUrl}
            url={safeUrl}
          />
          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg transition hover:opacity-90"
            >
              Read more <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : (
            <span className="flex-1 rounded-lg bg-[var(--hover)] px-3 py-2 text-center text-sm text-secondary">
              Link unavailable
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
});

export default NewsCard;


export function StarRating({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-secondary">No rating</span>;
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary" aria-label={`Rated ${value} out of 10`}>
      <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" aria-hidden="true" />
      {value.toFixed(1)}
    </span>
  );
}
