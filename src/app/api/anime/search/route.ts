import { NextRequest, NextResponse } from 'next/server';
import { getCachedData } from '@/lib/server/firebase';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ success: false, error: 'Missing query parameter q' }, { status: 400 });

    // Search from Firebase index
    const indexCache = await getCachedData('search/index');
    const hasIndex = !!(indexCache?.data?.length);

    if (hasIndex) {
      const ql = q.toLowerCase();
      const results = (indexCache.data as any[]).filter((item: any) =>
        item.title?.toLowerCase().includes(ql)
      ).slice(0, 30);
      return NextResponse.json({ success: true, count: results.length, data: results });
    }

    // No index yet - return empty
    return NextResponse.json({ success: true, count: 0, data: [], note: 'No search index built yet' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
