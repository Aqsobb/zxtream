import { NextRequest, NextResponse } from 'next/server';
import { getOngoingAnime } from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const data = await getOngoingAnime(page);
  return NextResponse.json({ success: true, page, count: data.length, data });
}
