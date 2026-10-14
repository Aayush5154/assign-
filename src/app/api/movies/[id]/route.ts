import { NextResponse } from 'next/server';
import { DEMO_MOVIES } from '@/lib/demo-data';
import { normalizeTmdbMovie } from '@/lib/api/normalize';
import { tmdbError, tmdbGet } from '@/lib/api/tmdb';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numericId = Number.parseInt(id.replace('movie-', ''), 10);

  const demoMatch =
    DEMO_MOVIES.find((m) => m.id === id) ??
    (Number.isNaN(numericId) ? undefined : DEMO_MOVIES.find((m) => m.tmdbId === numericId));

  if (!process.env.TMDB_API_KEY) {
    if (!demoMatch) {
      return NextResponse.json({ error: 'Movie not found in demo data.' }, { status: 404 });
    }
    return NextResponse.json({
      movie: demoMatch,
      recommendations: DEMO_MOVIES.filter((m) => m.id !== demoMatch.id).slice(0, 6),
      source: 'demo',
      trailerKey: null,
    });
  }

  const tmdbId = Number.isNaN(numericId) ? id : String(numericId);
  if (!/^\d+$/.test(tmdbId)) {
    if (demoMatch) {
      return NextResponse.json({
        movie: demoMatch,
        recommendations: DEMO_MOVIES.filter((m) => m.id !== demoMatch.id).slice(0, 6),
        source: 'demo',
        trailerKey: null,
      });
    }
    return NextResponse.json({ error: 'Invalid movie id.' }, { status: 400 });
  }

  try {
    const [detailsRes, videosRes, recRes] = await Promise.all([
      tmdbGet(`/movie/${tmdbId}?language=en-US`),
      tmdbGet(`/movie/${tmdbId}/videos?language=en-US`),
      tmdbGet(`/movie/${tmdbId}/recommendations?language=en-US&page=1`),
    ]);

    if (!detailsRes.ok) {
      const e = tmdbError(detailsRes.status);
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const details = (await detailsRes.json()) as never;
    const movie = normalizeTmdbMovie(details);
    if (!movie) return NextResponse.json({ error: 'Unexpected TMDB response.' }, { status: 502 });

    let trailerKey: string | null = null;
    if (videosRes.ok) {
      const videos = (await videosRes.json()) as {
        results?: { key?: string; site?: string; type?: string }[];
      };
      const trailer = (videos.results ?? []).find(
        (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'),
      );
      trailerKey = trailer?.key ?? null;
      movie.trailerKey = trailerKey;
    }

    let recommendations: ReturnType<typeof normalizeTmdbMovie>[] = [];
    if (recRes.ok) {
      const rec = (await recRes.json()) as { results?: unknown[] };
      recommendations = (rec.results ?? [])
        .map((m) => normalizeTmdbMovie(m as never))
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .slice(0, 12) as never[];
    }

    return NextResponse.json({ movie, recommendations, source: 'live', trailerKey });
  } catch {
    return NextResponse.json({ error: 'Could not reach TMDB.' }, { status: 502 });
  }
}
