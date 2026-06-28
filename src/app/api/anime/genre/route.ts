import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const genre = req.nextUrl.searchParams.get('genre');
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    if (!genre) return NextResponse.json({ success: false, error: 'Missing genre parameter' }, { status: 400 });

    const results = await scraper.getAnimeByGenre(genre, page);
    return NextResponse.json({ success: true, genre, page, count: results.length, data: results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
