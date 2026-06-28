import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { userId, animeId, animeSlug, episodeId, episodeNumber, title, thumbnail, progress, duration } = await req.json();
    if (!userId || !episodeId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const entry = {
      animeId,
      animeSlug,
      episodeId,
      episodeNumber: episodeNumber || 0,
      title: title || '',
      thumbnail: thumbnail || '',
      progress: progress || 0,
      duration: duration || 0,
      timestamp: Date.now(),
    };

    const url = API_KEY
      ? `${DB_URL}/users/${userId}/history/${episodeId}.json?auth=${API_KEY}`
      : `${DB_URL}/users/${userId}/history/${episodeId}.json`;
    await axios.put(url, entry);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const episodeId = req.nextUrl.searchParams.get('episodeId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    if (episodeId) {
      // Get progress for specific episode
      const url = API_KEY
        ? `${DB_URL}/users/${userId}/history/${episodeId}.json?auth=${API_KEY}`
        : `${DB_URL}/users/${userId}/history/${episodeId}.json`;
      const { data } = await axios.get(url);
      return NextResponse.json({ success: true, data });
    } else {
      // Get all history
      const url = API_KEY
        ? `${DB_URL}/users/${userId}/history.json?auth=${API_KEY}`
        : `${DB_URL}/users/${userId}/history.json`;
      const { data } = await axios.get(url);
      return NextResponse.json({ success: true, data: data || {} });
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
