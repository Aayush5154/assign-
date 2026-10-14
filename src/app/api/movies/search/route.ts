import { NextResponse } from 'next/server';
import { DEMO_MOVIES } from '@/lib/demo-data';
import { normalizeTmdbMovie, parsePage } from '@/lib/api/normalize';
import { tmdbError, tmdbGet } from '@/lib/api/tmdb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim().slice(0, 100);
  const page = parsePage(searchParams.get('page'), 1);

  if (!q) {
    return NextResponse.json(
      { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: 'Missing search query.' },
      { status: 400 },
    );
  }

  if (!process.env.TMDB_API_KEY) {
    const lowered = q.toLowerCase();
    const pool = DEMO_MOVIES.filter(
      (m) => m.title.toLowerCase().includes(lowered) || m.overview.toLowerCase().includes(lowered),
    );
    return NextResponse.json({
      results: pool,
      page,
      totalPages: 1,
      totalResults: pool.length,
      source: 'demo',
      error: 'TMDB_API_KEY is not configured. Showing demonstration content.',
    });
  }

  try {
    const res = await tmdbGet(
      `/search/movie?query=${encodeURIComponent(q)}&page=${page}&language=en-US&include_adult=false`,
    );
    if (!res.ok) {
      const e = tmdbError(res.status);
      return NextResponse.json(
        { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: e.message },
        { status: e.status },
      );
    }
    const data = (await res.json()) as {
      results?: unknown[];
      page?: number;
      total_pages?: number;
      total_results?: number;
    };
    const results = (data.results ?? [])
      .map((m) => normalizeTmdbMovie(m as never))
      .filter((m): m is NonNullable<typeof m> => m !== null);
    return NextResponse.json({
      results,
      page: data.page ?? page,
      totalPages: data.total_pages ?? 1,
      totalResults: data.total_results ?? results.length,
      source: 'live',
      error: null,
    });
  } catch {
    return NextResponse.json(
      { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: 'Could not reach TMDB.' },
      { status: 502 },
    );
  }
}
