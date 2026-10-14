import { NextResponse } from 'next/server';
import { DEMO_MOVIES } from '@/lib/demo-data';
import { normalizeTmdbMovie, parsePage } from '@/lib/api/normalize';
import { tmdbError, tmdbGet } from '@/lib/api/tmdb';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parsePage(searchParams.get('page'), 1);

  if (!process.env.TMDB_API_KEY) {
    const start = (page - 1) * 6;
    const results = DEMO_MOVIES.slice(0, 6).map((m) => ({ ...m }));
    void start;
    return NextResponse.json({
      results: page === 1 ? results : [],
      page,
      totalPages: 1,
      totalResults: results.length,
      source: 'demo',
      error: 'TMDB_API_KEY is not configured. Showing demonstration content.',
    });
  }

  try {
    const res = await tmdbGet(`/movie/popular?page=${page}&language=en-US`);
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
