import { NextRequest, NextResponse } from 'next/server';
import { suggestAnime } from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 1) return NextResponse.json({ success: true, data: [] });
  const data = await suggestAnime(q);
  return NextResponse.json({ success: true, data });
}
