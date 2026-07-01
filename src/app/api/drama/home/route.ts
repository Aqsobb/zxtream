import { NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const [dramas, movies, trending] = await Promise.allSettled([
      scraper.getDramaHomeData(),
      scraper.getMovieHomeData(),
      scraper.getDramaTrending(),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        dramas: dramas.status === 'fulfilled' ? dramas.value || [] : [],
        movies: movies.status === 'fulfilled' ? movies.value || [] : [],
        trending: trending.status === 'fulfilled' ? trending.value || [] : [],
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
