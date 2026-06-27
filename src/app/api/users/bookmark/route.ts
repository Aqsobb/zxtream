import { NextRequest, NextResponse } from 'next/server';
import * as userDb from '../../../../../../server/services/user-db';

export async function POST(req: NextRequest) {
  try {
    const { userId, animeSlug } = await req.json();
    if (!userId || !animeSlug) return NextResponse.json({ success: false, error: 'Missing userId or animeSlug' }, { status: 400 });
    const isBookmarked = await userDb.toggleBookmark(userId, animeSlug);
    return NextResponse.json({ success: true, data: { isBookmarked } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
