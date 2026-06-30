import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1';
    const homeData = await scraper.getHomeAnime(forceRefresh);
    let ongoing: any[] = [];
    try {
      ongoing = await scraper.getOngoingAnime(1);
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        popular: homeData.popular || [],
        ongoing,
        schedule: homeData.schedule || [],
        hero: homeData.hero || [],
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
