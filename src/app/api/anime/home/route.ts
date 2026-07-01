import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1';
    const requesterUid = req.headers.get('x-user-uid');

    if (forceRefresh) {
      const DEV_UID = process.env.DEV_UID || '33333';
      const isAdmin = req.headers.get('x-user-role') === 'admin' || String(requesterUid) === String(DEV_UID);
      if (!isAdmin) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
      const axios = require('axios');
      const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://dtabase-80c9a-default-rtdb.asia-southeast1.firebasedatabase.app';
      const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
      const deleteUrl = API_KEY
        ? `${DB_URL}/content/home.json?auth=${API_KEY}`
        : `${DB_URL}/content/home.json`;
      await axios.delete(deleteUrl).catch(() => {});
    }

    const [homeData, ongoing] = await Promise.allSettled([
      scraper.getHomeAnime(),
      scraper.getOngoingAnime(1),
    ]).then(r => [r[0].status === 'fulfilled' ? r[0].value : { popular: [], schedule: [], hero: [] }, r[1].status === 'fulfilled' ? r[1].value : []]);

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
