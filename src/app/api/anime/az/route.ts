import { NextRequest, NextResponse } from 'next/server';
const { getAZList } = require('@/lib/server/scraper-az');

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const letter = req.nextUrl.searchParams.get('letter') || '#';
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const data = await getAZList(letter, page);
    return NextResponse.json({ success: true, letter, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
