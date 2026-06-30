import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1';

    if (forceRefresh) {
      // Force re-scrape by clearing stored home data
      const axios = require('axios');
      const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://dtabase-80c9a-default-rtdb.asia-southeast1.firebasedatabase.app';
      const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
      const deleteUrl = API_KEY
        ? `${DB_URL}/content/home.json?auth=${API_KEY}`
        : `${DB_URL}/content/home.json`;
      await axios.delete(deleteUrl).catch(() => {});
    }

    const homeData = await scraper.getHomeAnime();
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
