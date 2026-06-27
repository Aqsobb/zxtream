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
    const animeSlug = req.nextUrl.searchParams.get('animeSlug');
    if (!animeSlug) return NextResponse.json({ success: false, error: 'Missing animeSlug' }, { status: 400 });
    const { data } = await axios.get(authUrl(`comments/${animeSlug}`));
    return NextResponse.json({ success: true, data: data || {} });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { animeSlug, uid, displayName, text, role } = await req.json();
    if (!animeSlug || !uid || !text) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const timestamp = Date.now();
    const comment = { uid, displayName, text, role: role || 'user', timestamp };
    await axios.put(authUrl(`comments/${animeSlug}/${timestamp}`), comment);
    return NextResponse.json({ success: true, data: comment });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
