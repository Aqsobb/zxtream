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

    const data = [
      ...(donghua || []).map((d: any) => ({ ...d, _type: 'donghua' })),
      ...(dramas || []).map((d: any) => ({ ...d, _type: 'drama' })),
    ];

    return NextResponse.json({ success: true, count: data.length, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
