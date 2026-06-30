import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 1) return NextResponse.json({ success: true, data: [] });

  const [anime, dramas] = await Promise.all([
    scraper.suggestAnime(q),
    scraper.searchDrama(q),
  ]);

  const data = [
    ...(anime || []).map((d: any) => ({ ...d, _type: 'donghua' })),
    ...(dramas || []).map((d: any) => ({ ...d, _type: 'drama' })),
  ];

  return NextResponse.json({ success: true, data });
}
