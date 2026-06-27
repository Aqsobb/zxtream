import { NextRequest, NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await scraper.getAnimeDetail(slug);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
