import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) return NextResponse.json({ success: false, error: 'Missing query parameter url' }, { status: 400 });
    const data = await scraper.getEpisodeStream(url);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
