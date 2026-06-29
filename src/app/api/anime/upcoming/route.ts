import { NextRequest, NextResponse } from 'next/server';
const { getUpcomingAnime } = require('@/lib/server/scraper-az');

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET() {
  try {
    const data = await getUpcomingAnime();
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
