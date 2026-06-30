import { NextRequest, NextResponse } from 'next/server';
import * as adminDb from '@/lib/server/admin-db';
import * as userDb from '@/lib/server/user-db';

const DEV_UID = process.env.DEV_UID || '33333';

async function isAuthorized(uid: string): Promise<boolean> {
  if (String(uid) === String(DEV_UID)) return true;
  try {
    const user = await userDb.getUser(uid);
    if (!user) return false;
    return user.isOwner === true || user.role === 'owner' || user.role === 'dev' || user.isDev === true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, requesterUid } = await req.json();
    if (!requesterUid) return NextResponse.json({ success: false, error: 'Missing requesterUid' }, { status: 400 });

    const requesterStr = String(requesterUid);
    const targetStr = String(uid);

    if (!(await isAuthorized(requesterStr))) {
      return NextResponse.json({ success: false, error: 'Unauthorized - Owner/Dev only' }, { status: 403 });
    }

    if (requesterStr === targetStr) {
      return NextResponse.json({ success: false, error: 'Tidak bisa hapus diri sendiri' }, { status: 400 });
    }

    const targetUser = await userDb.getUser(targetStr);
    if (targetUser && (targetUser.isOwner === true || targetUser.role === 'owner')) {
      return NextResponse.json({ success: false, error: 'Tidak bisa hapus owner lain' }, { status: 403 });
    }

    const result = await adminDb.deleteUser(targetStr, requesterStr);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
