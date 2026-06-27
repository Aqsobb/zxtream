import { NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const homeData = await scraper.getHomeAnime();
    // Fetch ongoing separately — don't fail home if ongoing is slow
    let ongoing: any[] = [];
    try {
      ongoing = await scraper.getOngoingAnime(1);
    } catch {}
    return NextResponse.json({
      success: true,
      data: {
        popular: homeData.popular,
        recent: homeData.recent,
        ongoing,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
