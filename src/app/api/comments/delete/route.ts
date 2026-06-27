import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as userDb from '../../../../../../server/services/user-db';

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

function authUrl(path: string) {
  return API_KEY
    ? `${DB_URL}/${path}.json?auth=${API_KEY}`
    : `${DB_URL}/${path}.json`;
}

export async function POST(req: NextRequest) {
  try {
    const { commentId, animeSlug, requesterUid } = await req.json();
    if (!commentId || !animeSlug || !requesterUid) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    if (!(await isOwner(requesterUid))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }
    await axios.delete(authUrl(`comments/${animeSlug}/${commentId}`));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
