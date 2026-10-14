import type { Category } from '@/types/content';

export const CATEGORIES: { id: Category; label: string; description: string }[] = [
  { id: 'technology', label: 'Technology', description: 'AI, gadgets, software & startups' },
  { id: 'business', label: 'Business', description: 'Markets, companies & strategy' },
  { id: 'finance', label: 'Finance', description: 'Investing, crypto & economy' },
  { id: 'sports', label: 'Sports', description: 'Scores, athletes & analysis' },
  { id: 'entertainment', label: 'Entertainment', description: 'Movies, music & culture' },
  { id: 'science', label: 'Science', description: 'Research, space & climate' },
  { id: 'health', label: 'Health', description: 'Wellness, medicine & fitness' },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  technology: 'Technology',
  business: 'Business',
  finance: 'Finance',
  sports: 'Sports',
  entertainment: 'Entertainment',
  science: 'Science',
  health: 'Health',
};

export const DEFAULT_CATEGORIES: Category[] = ['technology', 'entertainment', 'science'];

export const DEFAULT_WIDGET_ORDER: string[] = [
  'personalized-news',
  'trending-movies',
  'social-feed',
  'trending-topics',
  'recommended',
];

export const WIDGET_TITLES: Record<string, string> = {
  'personalized-news': 'Personalized News',
  'trending-movies': 'Trending Movies',
  'social-feed': 'Social Feed',
  'trending-topics': 'Trending Topics',
  'recommended': 'Recommended Content',
};

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
export const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';
