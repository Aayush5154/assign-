import { NextResponse } from 'next/server';
import { DEMO_NEWS } from '@/lib/demo-data';
import { NEWSAPI_CATEGORY_MAP, normalizeNewsArticle, parsePage } from '@/lib/api/normalize';
import type { Category } from '@/types/content';
import { categorySchema } from '@/lib/validation/schemas';

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get('category') ?? 'technology';
  const page = parsePage(searchParams.get('page'), 1);

  const parsed = categorySchema.safeParse(rawCategory);
  const category: Category = parsed.success ? parsed.data : 'technology';

  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    const filtered = DEMO_NEWS.filter((a) => a.category === category);
    const pool = filtered.length > 0 ? filtered : DEMO_NEWS;
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
    const newsCategory = NEWSAPI_CATEGORY_MAP[category];
    const url =
      `https://newsapi.org/v2/top-headlines?category=${encodeURIComponent(newsCategory)}` +
      `&pageSize=${PAGE_SIZE}&page=${page}&country=us`;
    const res = await fetch(url, {
      headers: { 'X-Api-Key': apiKey },
      next: { revalidate: 300 },
    });

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json(
        {
          results: [],
          page,
          totalPages: 0,
          totalResults: 0,
          source: 'live',
          error: 'News API key is invalid or expired. Check NEWS_API_KEY.',
        },
        { status: 502 },
      );
    }
    if (res.status === 429) {
      return NextResponse.json(
        {
          results: [],
          page,
          totalPages: 0,
          totalResults: 0,
          source: 'live',
          error: 'News API rate limit reached. Please try again shortly.',
        },
        { status: 429 },
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        {
          results: [],
          page,
          totalPages: 0,
          totalResults: 0,
          source: 'live',
          error: `News provider returned status ${res.status}.`,
        },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      articles?: unknown[];
      totalResults?: number;
    };
    if (!Array.isArray(data.articles)) {
      return NextResponse.json(
        { results: [], page, totalPages: 0, totalResults: 0, source: 'live', error: 'Unexpected news response format.' },
        { status: 502 },
      );
    }
    const results = data.articles
      .map((a, i) => normalizeNewsArticle(a as never, category, (page - 1) * PAGE_SIZE + i))
      .filter((a): a is NonNullable<typeof a> => a !== null);
    const totalResults = typeof data.totalResults === 'number' ? data.totalResults : results.length;
    return NextResponse.json({
      results,
      page,
      totalPages: Math.max(1, Math.ceil(totalResults / PAGE_SIZE)),
      totalResults,
      source: 'live',
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        results: [],
        page,
        totalPages: 0,
        totalResults: 0,
        source: 'live',
        error: 'Could not reach the news provider. Check your connection and retry.',
      },
      { status: 502 },
    );
  }
}
