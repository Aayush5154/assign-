import { NextResponse } from 'next/server';
import { DEMO_NEWS } from '@/lib/demo-data';
import { normalizeNewsArticle, parsePage } from '@/lib/api/normalize';

const PAGE_SIZE = 12;

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

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    const lowered = q.toLowerCase();
    const pool = DEMO_NEWS.filter(
      (a) =>
        a.title.toLowerCase().includes(lowered) || a.description.toLowerCase().includes(lowered),
    );
    return NextResponse.json({
      results: pool,
      page,
      totalPages: 1,
      totalResults: pool.length,
      source: 'demo',
      error: 'NEWS_API_KEY is not configured. Showing demonstration content.',
    });
  }

  try {
    // /v2/everything works on most plans; keep pageSize modest.
    const url =
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}` +
      `&pageSize=${PAGE_SIZE}&page=${page}&sortBy=publishedAt&language=en`;
    const res = await fetch(url, {
      headers: { 'X-Api-Key': apiKey },
      next: { revalidate: 300 },
    });
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json(
        { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: 'News API key is invalid or expired.' },
        { status: 502 },
      );
    }
    if (res.status === 429) {
      return NextResponse.json(
        { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: 'News API rate limit reached. Try again shortly.' },
        { status: 429 },
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: `News provider returned status ${res.status}.` },
        { status: 502 },
      );
    }
    const data = (await res.json()) as { articles?: unknown[]; totalResults?: number };
    if (!Array.isArray(data.articles)) {
      return NextResponse.json(
        { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: 'Unexpected news response format.' },
        { status: 502 },
      );
    }
    const results = data.articles
      .map((a, i) => normalizeNewsArticle(a as never, 'technology', (page - 1) * PAGE_SIZE + i))
      .filter((a): a is NonNullable<typeof a> => a !== null);
    const totalResults = typeof data.totalResults === 'number' ? data.totalResults : results.length;
    return NextResponse.json({
      results,
      page,
      totalPages: Math.max(1, Math.ceil(Math.min(totalResults, 100) / PAGE_SIZE)),
      totalResults,
      source: 'live',
      error: null,
    });
  } catch {
    return NextResponse.json(
      { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: 'Could not reach the news provider.' },
      { status: 502 },
    );
  }
}
