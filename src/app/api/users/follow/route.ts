import { NextRequest, NextResponse } from 'next/server';
import * as userDb from '../../../../../../server/services/user-db';

export async function POST(req: NextRequest) {
  try {
    const { followerId, followingId } = await req.json();
    if (!followerId || !followingId) return NextResponse.json({ success: false, error: 'Missing followerId or followingId' }, { status: 400 });
    const isFollowing = await userDb.toggleFollow(followerId, followingId);
    return NextResponse.json({ success: true, data: { isFollowing } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
