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

export async function GET(req: NextRequest) {
  try {
    const url = API_KEY ? `${DB_URL}/comments.json?auth=${API_KEY}` : `${DB_URL}/comments.json`;
    const { data } = await axios.get(url);
    if (!data) return NextResponse.json({ success: true, data: [] });

    const allComments: any[] = [];
    for (const [type, targets] of Object.entries(data as Record<string, any>)) {
      for (const [targetId, comments] of Object.entries(targets as Record<string, any>)) {
        if (typeof comments === 'object' && comments !== null) {
          for (const [id, comment] of Object.entries(comments)) {
            allComments.push({ id, type, targetId, ...(comment as any) });
          }
        }
      }
    }
    allComments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return NextResponse.json({ success: true, data: allComments });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { commentId, type, targetId, requesterUid } = await req.json();
    if (!requesterUid) return NextResponse.json({ success: false, error: 'Missing requesterUid' }, { status: 400 });
    if (!(await isOwner(requesterUid))) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

    const url = API_KEY
      ? `${DB_URL}/comments/${type}/${targetId}/${commentId}.json?auth=${API_KEY}`
      : `${DB_URL}/comments/${type}/${targetId}/${commentId}.json`;
    await axios.delete(url);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
