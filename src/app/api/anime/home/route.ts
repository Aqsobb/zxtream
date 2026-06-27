import { NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const [homeData, ongoingData] = await Promise.all([
      scraper.getHomeAnime(),
      scraper.getOngoingAnime(1),
    ]);
    return NextResponse.json({
      success: true,
      data: {
        popular: homeData.popular,
        recent: homeData.recent,
        ongoing: ongoingData,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
