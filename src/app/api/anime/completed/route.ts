import { NextRequest, NextResponse } from 'next/server';
import { getCompletedAnime } from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const data = await getCompletedAnime(page);
  return NextResponse.json({ success: true, page, count: data.length, data });
}
