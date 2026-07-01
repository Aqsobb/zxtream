import { NextRequest, NextResponse } from 'next/server';
import { getCompletedAnime } from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 20;

export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const data = await getCompletedAnime(page);
    return NextResponse.json({ success: true, page, count: data.length, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, page: 1, count: 0, data: [] }, { status: 500 });
  }
}
