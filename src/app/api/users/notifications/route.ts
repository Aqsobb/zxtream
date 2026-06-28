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
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      // Return global notifications
      const { data } = await axios.get(authUrl('notifications'));
      if (!data) return NextResponse.json({ success: true, data: [] });
      const items = Object.entries(data).map(([id, n]: [string, any]) => ({ id, ...n }));
      items.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      return NextResponse.json({ success: true, data: items });
    }
    // Return user-specific notifications (broadcasts + personal)
    const { data } = await axios.get(authUrl('notifications'));
    if (!data) return NextResponse.json({ success: true, data: [] });
    const items = Object.entries(data).map(([id, n]: [string, any]) => ({ id, ...n }));
    items.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    return NextResponse.json({ success: true, data: items });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, title, message, type } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Missing title or message' }, { status: 400 });
    }
    const notification = {
      title,
      message,
      type: type || 'broadcast',
      from: 'admin',
      read: false,
      createdAt: Date.now(),
    };
    const url = authUrl('notifications');
    await axios.post(url, notification);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
