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
    return user && (user.isOwner || user.role === 'owner');
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const url = API_KEY
      ? `${DB_URL}/siteSettings.json?auth=${API_KEY}`
      : `${DB_URL}/siteSettings.json`;
    const { data } = await axios.get(url);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { requesterUid, ...settings } = await req.json();
    if (!requesterUid) return NextResponse.json({ success: false, error: 'Missing requesterUid' }, { status: 400 });
    if (!(await isOwner(requesterUid))) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    const url = API_KEY
      ? `${DB_URL}/siteSettings.json?auth=${API_KEY}`
      : `${DB_URL}/siteSettings.json`;
    await axios.put(url, settings);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
