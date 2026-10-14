'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Star } from 'lucide-react';
import type { NewsArticle } from '@/types/content';
import { formatRelativeTime, safeExternalUrl, truncate } from '@/lib/utils/format';
import CategoryBadge from '@/components/common/CategoryBadge';
import FavoriteButton from '@/components/common/FavoriteButton';

const NewsCard = memo(function NewsCard({ article }: { article: NewsArticle }) {
  const [imgError, setImgError] = useState(false);
  const safeUrl = safeExternalUrl(article.url);
  const showImage = article.imageUrl && !imgError;

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-500/40 hover:shadow-md">
      <div className="relative h-44 w-full overflow-hidden bg-[var(--hover)]">
        {showImage ? (
          <Image
            src={article.imageUrl as string}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-end p-4" aria-hidden="true">
            <span className="text-2xl font-bold leading-tight text-secondary/40">
              {article.source.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-xs font-medium text-secondary/70">{article.source}</span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <CategoryBadge category={article.category} className="bg-black/60 text-white backdrop-blur border-0 text-[10px]" />
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton
            id={article.id}
            type="news"
            title={article.title}
            subtitle={article.source}
            imageUrl={article.imageUrl}
            url={safeUrl}
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="flex items-center justify-between text-xs text-secondary">
          <span className="truncate font-medium">{article.source}</span>
          <time dateTime={article.publishedAt}>{formatRelativeTime(article.publishedAt)}</time>
        </p>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-primary group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-secondary leading-relaxed">{truncate(article.description, 130)}</p>
        <div className="mt-auto pt-3">
          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              Read more <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ) : (
            <span className="text-xs text-secondary/60">
              Link unavailable
            </span>
          )}
        </div>
      </div>
    </article>
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
