import { NextResponse } from 'next/server';
import * as scraper from '../../../../../../server/services/scraper';

export async function GET() {
  try {
    const data = await scraper.getHomeAnime();
    return NextResponse.json({ success: true, data: { popular: data.popular, recent: data.recent } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
