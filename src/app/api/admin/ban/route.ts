import { NextRequest, NextResponse } from 'next/server';
import * as adminDb from '@/lib/server/admin-db';
import * as userDb from '@/lib/server/user-db';

const DEV_UID = process.env.DEV_UID || '33333';

async function isOwner(uid: string): Promise<boolean> {
  if (String(uid) === String(DEV_UID)) return true;
  try {
    const user = await userDb.getUser(uid);
    if (!user) return false;
    return user.isOwner === true || user.role === 'owner';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, requesterUid } = await req.json();
    if (!requesterUid) return NextResponse.json({ success: false, error: 'Missing requesterUid' }, { status: 400 });
    if (!(await isOwner(String(requesterUid)))) return NextResponse.json({ success: false, error: 'Unauthorized - Owner only' }, { status: 403 });
    await adminDb.banUser(String(uid));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
