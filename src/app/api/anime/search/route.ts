import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ success: false, error: 'Missing query parameter q' }, { status: 400 });

    const [donghua, dramas] = await Promise.all([
      scraper.searchAnime(q),
      scraper.searchDrama(q),
    ]);

    // Deduplicate: searchAnime may include drama fallback results
    const seen = new Set();
    const data = [
      ...(donghua || []).map((d: any) => {
        const key = (d.title || '').toLowerCase().trim();
        if (seen.has(key)) return null;
        seen.add(key);
        return { ...d, _type: d.type === 'drama' ? 'drama' : 'donghua' };
      }).filter(Boolean),
      ...(dramas || []).map((d: any) => {
        const key = (d.title || '').toLowerCase().trim();
        if (seen.has(key)) return null;
        seen.add(key);
        return { ...d, _type: 'drama' };
      }).filter(Boolean),
    ];

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
