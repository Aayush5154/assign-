'use client';

import { memo, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsFavorite, toggleFavorite } from '@/features/favorites/favoritesSlice';
import type { FavoriteType } from '@/types/content';
import { cn } from '@/lib/utils/format';

const FavoriteButton = memo(function FavoriteButton({
  id,
  type,
  title,
  subtitle = null,
  imageUrl = null,
  url = null,
}: {
  id: string;
  type: FavoriteType;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  url?: string | null;
}) {
  const dispatch = useAppDispatch();
  const active = useAppSelector((s) => selectIsFavorite(s, id, type));

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleFavorite({ id, type, title, subtitle, imageUrl, url, addedAt: '' }));
  }, [dispatch, id, type, title, subtitle, imageUrl, url]);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove "${title}" from favorites` : `Save "${title}" to favorites`}
      title={active ? 'Remove from favorites' : 'Save to favorites'}
      onClick={handleClick}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border transition',
        active
          ? 'border-accent bg-accent text-accent-fg'
          : 'bg-[var(--hover)] text-secondary hover:text-primary',
      )}
    >
      <Heart className={cn('h-4 w-4', active && 'fill-current')} aria-hidden="true" />
    </button>
  );
});

export default FavoriteButton;

