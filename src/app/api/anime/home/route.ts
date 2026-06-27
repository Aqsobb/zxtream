import { NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const debug: any = {};

    // Test direct fetch
    try {
      const res = await fetch('https://anichin.moe', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        },
        signal: AbortSignal.timeout(15000),
      });
      debug.fetchStatus = res.status;
      const html = await res.text();
      debug.htmlLength = html.length;
      debug.hasBs = html.includes('class="bs"');
    } catch (e: any) {
      debug.fetchError = e.message;
    }

    const data = await scraper.getHomeAnime();
    debug.popular = data.popular?.length || 0;
    debug.recent = data.recent?.length || 0;

    return NextResponse.json({ success: true, debug, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack?.substring(0, 500) }, { status: 500 });
  }
}
