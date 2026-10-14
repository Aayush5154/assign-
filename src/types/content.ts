export type Category =
  | 'technology'
  | 'business'
  | 'finance'
  | 'sports'
  | 'entertainment'
  | 'science'
  | 'health';

export type ContentKind = 'news' | 'movie' | 'social';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string | null;
  source: string;
  author: string | null;
  publishedAt: string;
  category: Category;
  isDemo?: boolean;
}

export interface MovieGenre {
  id: number;
  name: string;
}

export interface Movie {
  id: string;
  tmdbId: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  releaseYear: string | null;
  voteAverage: number | null;
  voteCount: number | null;
  genres: MovieGenre[];
  runtime: number | null;
  trailerKey: string | null;
  category: Category;
  isDemo?: boolean;
}

export interface SocialPost {
  id: string;
  author: string;
  username: string;
  avatar: string | null;
  content: string;
  hashtags: string[];
  imageUrl: string | null;
  likes: number;
  createdAt: string;
  category: Category;
  isDemo: true;
}

export type ContentItem =
  | ({ kind: 'news' } & NewsArticle)
  | ({ kind: 'movie' } & Movie)
  | ({ kind: 'social' } & SocialPost);

export interface UserPreferences {
  categories: Category[];
  personalizedMode: boolean;
}

export interface DashboardWidget {
  id: string;
  title: string;
  visible: boolean;
}

export type FavoriteType = ContentKind;

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  url: string | null;
  addedAt: string;
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  totalPages: number;
  totalResults: number;
  source: 'live' | 'demo';
  error?: string | null;
}
