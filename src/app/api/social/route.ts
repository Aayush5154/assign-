import { NextResponse } from 'next/server';
import { DEMO_SOCIAL } from '@/lib/demo-data';
import { parsePage } from '@/lib/api/normalize';
import { categorySchema } from '@/lib/validation/schemas';
import type { Category } from '@/types/content';

const PAGE_SIZE = 8;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = searchParams.get('category');
  const q = (searchParams.get('q') ?? '').trim().toLowerCase().slice(0, 100);
  const page = parsePage(searchParams.get('page'), 1);

  let pool = [...DEMO_SOCIAL];

  if (rawCategory) {
    const parsed = categorySchema.safeParse(rawCategory);
    if (parsed.success) {
      const category: Category = parsed.data;
      pool = pool.filter((p) => p.category === category);
    }
  }

  if (q) {
    pool = pool.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.username.toLowerCase().includes(q) ||
        p.hashtags.some((h) => h.toLowerCase().includes(q)),
    );
  }

  const totalResults = pool.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const results = pool.slice(start, start + PAGE_SIZE);

  return NextResponse.json({
    results,
    page: safePage,
    totalPages,
    totalResults,
    source: 'demo',
    error: null,
  });
}
