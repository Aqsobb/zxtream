import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as userDb from '@/lib/server/user-db';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const DEV_UID = process.env.DEV_UID || '33333';

async function isOwner(uid: string): Promise<boolean> {
  if (uid === DEV_UID) return true;
  try {
    const user = await userDb.getUser(uid);
    return user && (user.isOwner || user.role === 'owner' || user.role === 'dev' || user.isDev);
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  try {
    const { title, message, requesterUid } = await req.json();
    if (!requesterUid) return NextResponse.json({ success: false, error: 'Missing requesterUid' }, { status: 400 });
    if (!(await isOwner(requesterUid))) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    if (!title || !message) return NextResponse.json({ success: false, error: 'Missing title or message' }, { status: 400 });

    const notification = {
      title,
      message,
      createdAt: Date.now(),
      from: 'admin',
      read: false,
    };

    const url = API_KEY
      ? `${DB_URL}/notifications.json?auth=${API_KEY}`
      : `${DB_URL}/notifications.json`;
    await axios.post(url, notification);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
