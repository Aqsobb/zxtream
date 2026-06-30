import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const forceRefresh = req.nextUrl.searchParams.get('refresh') === '1';
    const data = await scraper.getAnimeDetail(slug, forceRefresh);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
