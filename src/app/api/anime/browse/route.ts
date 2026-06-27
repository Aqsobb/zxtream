import { NextRequest, NextResponse } from 'next/server';
import { getCachedData } from '@/lib/server/firebase';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const type = req.nextUrl.searchParams.get('type') || 'popular'; // popular | ongoing | completed
  const perPage = 30;

  const indexCache = await getCachedData('search/index');
  let items = indexCache?.data || [];

  // Sort by type relevance if needed
  if (type === 'ongoing') {
    items = items.filter((i: any) => i.episode && parseInt(i.episodeNum || '0') > 0);
  } else if (type === 'completed') {
    items = items.filter((i: any) => !i.episode || i.episode.includes('Completed'));
  }

  const start = (page - 1) * perPage;
  const paged = items.slice(start, start + perPage);

  return NextResponse.json({
    success: true,
    page,
    count: paged.length,
    total: items.length,
    hasMore: start + perPage < items.length,
    data: paged,
  });
}
