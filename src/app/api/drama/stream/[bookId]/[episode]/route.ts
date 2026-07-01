import { NextResponse } from 'next/server';
import * as scraper from '@/lib/server/scraper';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string; episode: string }> }
) {
  try {
    const { bookId, episode } = await params;
    const episodeNum = parseInt(episode) || 1;
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId') || undefined;

    const result = await scraper.getDramaEpisodeStream(bookId, episodeNum, chapterId);
    if (!result) {
      return NextResponse.json({ success: false, error: 'Stream not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[drama stream error]', error.message);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
