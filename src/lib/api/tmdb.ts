import { NextResponse } from 'next/server';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function authHeaders(): Record<string, string> {
  const key = process.env.TMDB_API_KEY ?? '';
  // Support both v3 API key (query param) and v4 bearer token.
  if (key.startsWith('eyJ')) {
    return { Authorization: `Bearer ${key}` };
  }
  return {};
}

function withKey(url: string): string {
  const key = process.env.TMDB_API_KEY ?? '';
  if (key && !key.startsWith('eyJ')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}api_key=${encodeURIComponent(key)}`;
  }
  return url;
}

export async function tmdbGet(path: string) {
  const res = await fetch(withKey(`${TMDB_BASE}${path}`), {
    headers: authHeaders(),
    next: { revalidate: 600 },
  });
  return res;
}

export function tmdbError(status: number) {
  if (status === 401 || status === 403) {
    return { message: 'TMDB API key is invalid or unauthorized. Check TMDB_API_KEY.', status: 502 };
  }
  if (status === 429) {
    return { message: 'TMDB rate limit reached. Please try again shortly.', status: 429 };
  }
  return { message: `TMDB returned status ${status}.`, status: 502 };
}

export function missingKeyResponse() {
  return NextResponse.json(
    {
      results: [],
      page: 1,
      totalPages: 0,
      totalResults: 0,
      source: 'demo',
      error: 'TMDB_API_KEY is not configured. Showing demonstration content.',
    },
    { status: 200 },
  );
}
