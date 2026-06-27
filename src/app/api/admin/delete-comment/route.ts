import { NextRequest, NextResponse } from 'next/server';
import * as adminDb from '../../../../../server/services/admin-db';
import * as userDb from '../../../../../server/services/user-db';

const DEV_UID = process.env.DEV_UID || '33333';

async function isOwner(uid: string): Promise<boolean> {
  if (uid === DEV_UID) return true;
  try {
    const user = await userDb.getUser(uid);
    return user && (user.isOwner || user.role === 'owner');
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { commentId, requesterUid } = await req.json();
    if (!requesterUid) return NextResponse.json({ success: false, error: 'Missing requesterUid' }, { status: 400 });
    if (!(await isOwner(requesterUid))) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    await adminDb.deleteComment(commentId);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
