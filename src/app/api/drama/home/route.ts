import { NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const [dramas, movies] = await Promise.all([
      scraper.getDramaHomeData(),
      scraper.getMovieHomeData(),
    ]);
    return NextResponse.json({
      success: true,
      data: { dramas: dramas || [], movies: movies || [] },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
