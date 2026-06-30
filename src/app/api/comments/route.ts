import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

function authUrl(path: string) {
  return API_KEY
    ? `${DB_URL}/${path}.json?auth=${API_KEY}`
    : `${DB_URL}/${path}.json`;
}

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type');
    const targetId = req.nextUrl.searchParams.get('targetId');
    if (!type || !targetId) {
      return NextResponse.json({ success: false, error: 'Missing type or targetId' }, { status: 400 });
    }
    const { data } = await axios.get(authUrl(`comments/${type}/${targetId}`));
    if (!data) return NextResponse.json({ success: true, data: [] });

    const comments = Object.entries(data).map(([id, c]: [string, any]) => ({
      id,
      uid: c.uid,
      displayName: c.displayName,
      photoURL: c.photoURL || '',
      role: c.role || 'member',
      text: c.text,
      likes: c.likes || [],
      createdAt: c.timestamp || c.createdAt || 0,
      replies: c.replies ? Object.entries(c.replies).map(([rid, r]: [string, any]) => ({
        id: rid,
        uid: r.uid,
        displayName: r.displayName,
        photoURL: r.photoURL || '',
        role: r.role || 'member',
        text: r.text,
        createdAt: r.timestamp || r.createdAt || 0,
      })) : [],
    }));
    comments.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    return NextResponse.json({ success: true, data: comments });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Handle like action
    if (body.action === 'like') {
      const { commentId, userId, type, targetId } = body;
      if (!commentId || !userId) {
        return NextResponse.json({ success: false, error: 'Missing commentId or userId' }, { status: 400 });
      }
      const url = authUrl(`comments/${type || 'anime'}/${targetId || commentId}/${commentId}`);
      const { data: existing } = await axios.get(url).catch(() => ({ data: null }));
      if (existing) {
        const likes = existing.likes || [];
        const idx = likes.indexOf(userId);
        if (idx >= 0) likes.splice(idx, 1); else likes.push(userId);
        await axios.patch(url, { likes });
      }
      return NextResponse.json({ success: true });
    }

    // Handle delete action
    if (body.action === 'delete') {
      const { commentId, userId, type, targetId } = body;
      if (!commentId) {
        return NextResponse.json({ success: false, error: 'Missing commentId' }, { status: 400 });
      }
      const url = authUrl(`comments/${type || 'anime'}/${targetId || ''}/${commentId}`);
      await axios.delete(url);
      return NextResponse.json({ success: true });
    }

    // Handle reply action
    if (body.action === 'reply') {
      const { commentId, type, targetId, uid, displayName, photoURL, role, text } = body;
      if (!commentId || !uid || !text) {
        return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
      }
      const now = Date.now();
      const replyId = `r_${now}_${Math.random().toString(36).slice(2, 8)}`;
      const reply = { uid, displayName, photoURL: photoURL || '', role: role || 'member', text, timestamp: now };
      await axios.put(authUrl(`comments/${type || 'anime'}/${targetId}/${commentId}/replies/${replyId}`), reply);
      return NextResponse.json({ success: true, data: { id: replyId, ...reply } });
    }

    // Handle new comment
    const { type, targetId, uid, displayName, photoURL, role, text } = body;
    if (!type || !targetId || !uid || !text) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const now = Date.now();
    const commentId = `c_${now}_${Math.random().toString(36).slice(2, 8)}`;
    const comment = { uid, displayName, photoURL: photoURL || '', role: role || 'member', text, likes: [], timestamp: now };
    await axios.put(authUrl(`comments/${type}/${targetId}/${commentId}`), comment);
    return NextResponse.json({ success: true, data: { id: commentId, ...comment } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
