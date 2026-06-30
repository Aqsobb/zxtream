import { NextRequest, NextResponse } from 'next/server';
import * as adminDb from '@/lib/server/admin-db';
import * as userDb from '@/lib/server/user-db';

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
    const { uid, requesterUid } = await req.json();
    if (!requesterUid) return NextResponse.json({ success: false, error: 'Missing requesterUid' }, { status: 400 });
    if (!(await isOwner(requesterUid))) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

    // Prevent self-deletion
    if (requesterUid === uid) {
      return NextResponse.json({ success: false, error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Prevent deleting other owners
    const targetUser = await userDb.getUser(uid);
    if (targetUser && (targetUser.isOwner || targetUser.role === 'owner')) {
      return NextResponse.json({ success: false, error: 'Cannot delete another owner' }, { status: 403 });
    }

    const result = await adminDb.deleteUser(uid, requesterUid);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
