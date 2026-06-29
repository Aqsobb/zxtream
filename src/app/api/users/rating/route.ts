import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function GET(req: NextRequest) {
  try {
    const targetId = req.nextUrl.searchParams.get('targetId');
    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Missing targetId' }, { status: 400 });
    }

    // Get all ratings for this anime
    const url = API_KEY
      ? `${DB_URL}/ratings/${targetId}.json?auth=${API_KEY}`
      : `${DB_URL}/ratings/${targetId}.json`;
    const { data } = await axios.get(url);

    if (!data) {
      return NextResponse.json({ success: true, average: 0, count: 0, ratings: {} });
    }

    // Calculate average
    const values = Object.values(data) as any[];
    const total = values.reduce((sum, r) => sum + (r.score || 0), 0);
    const average = values.length > 0 ? total / values.length : 0;

    return NextResponse.json({
      success: true,
      average: Math.round(average * 10) / 10,
      count: values.length,
      ratings: data,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { targetId, userId, score } = await req.json();
    if (!targetId || !userId || !score) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const validScore = Math.min(10, Math.max(1, Math.round(score)));

    const url = API_KEY
      ? `${DB_URL}/ratings/${targetId}/${userId}.json?auth=${API_KEY}`
      : `${DB_URL}/ratings/${targetId}/${userId}.json`;
    await axios.put(url, { score: validScore, userId, timestamp: Date.now() });

    // Recalculate average
    const allUrl = API_KEY
      ? `${DB_URL}/ratings/${targetId}.json?auth=${API_KEY}`
      : `${DB_URL}/ratings/${targetId}.json`;
    const { data } = await axios.get(allUrl);
    const values = Object.values(data || {}) as any[];
    const total = values.reduce((sum, r) => sum + (r.score || 0), 0);
    const average = values.length > 0 ? total / values.length : 0;

    return NextResponse.json({
      success: true,
      average: Math.round(average * 10) / 10,
      count: values.length,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
