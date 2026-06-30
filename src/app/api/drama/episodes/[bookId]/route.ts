import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string }> }) {
  try {
    const { bookId } = await params;
    const episodes = await scraper.getDramaEpisodes(bookId);
    return NextResponse.json({ success: true, data: episodes });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
