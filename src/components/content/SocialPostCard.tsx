'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { Heart, Link2 } from 'lucide-react';
import type { SocialPost } from '@/types/content';
import { formatRelativeTime } from '@/lib/utils/format';
import CategoryBadge from '@/components/common/CategoryBadge';
import FavoriteButton from '@/components/common/FavoriteButton';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { STORAGE_KEYS } from '@/lib/storage/localStorage';
import { cn } from '@/lib/utils/format';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const SocialPostCard = memo(function SocialPostCard({ post }: { post: SocialPost }) {
  const [imgError, setImgError] = useState(false);
  const [likedIds, setLikedIds] = useLocalStorage<string[]>(STORAGE_KEYS.likedPosts, []);
  const liked = likedIds.includes(post.id);

  const toggleLike = () => {
    setLikedIds((prev) => (prev.includes(post.id) ? prev.filter((id) => id !== post.id) : [...prev, post.id]));
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/social#${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  return (
    <article
      id={post.id}
      className="flex flex-col gap-3 rounded-card border border-border bg-card p-4 shadow-card transition-all duration-200 hover:border-zinc-500/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        {post.avatar ? (
          <Image
            src={post.avatar}
            alt={`${post.author} avatar`}
            width={38}
            height={38}
            className="h-9 w-9 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-fg"
            aria-hidden="true"
          >
            {initials(post.author)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">{post.author}</p>
          <p className="truncate text-xs text-secondary">
            @{post.username} · <time dateTime={post.createdAt}>{formatRelativeTime(post.createdAt)}</time>
          </p>
        </div>
        <span className="text-[10px] text-secondary/60">
          Demo post
        </span>
      </div>

      <p className="text-sm leading-relaxed text-primary">{post.content}</p>

      {post.hashtags.length > 0 && (
        <p className="flex flex-wrap gap-1.5" aria-label="Hashtags">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-xs font-medium text-accent">
              #{tag}
            </span>
          ))}
        </p>
      )}

      {post.imageUrl && !imgError && (
        <div className="relative h-48 w-full overflow-hidden rounded-lg bg-[var(--hover)]">
          <Image
            src={post.imageUrl}
            alt="Post attachment"
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-border pt-3">
        <CategoryBadge category={post.category} className="text-[10px]" />
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            aria-label={liked ? 'Unlike this post' : 'Like this post'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium transition',
              liked ? 'border-accent text-accent' : 'text-secondary hover:text-primary',
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} aria-hidden="true" />
            {post.likes + (liked ? 1 : 0)}
          </button>
          <FavoriteButton
            id={post.id}
            type="social"
            title={`Post by ${post.author}`}
            subtitle={`@${post.username}`}
            imageUrl={post.imageUrl}
            url={`/social#${post.id}`}
          />
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy link to this post"
            title="Copy link"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-[var(--hover)] text-secondary transition hover:text-primary"
          >
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
});

export default SocialPostCard;
