import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function GET() {
  try {
    const url = API_KEY
      ? `${DB_URL}/config/heroSlides.json?auth=${API_KEY}`
      : `${DB_URL}/config/heroSlides.json`;
    const { data } = await axios.get(url);
    return NextResponse.json({ success: true, data: data || [] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slides } = await req.json();
    if (!Array.isArray(slides)) {
      return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
    }

    // Max 5 slides
    const limited = slides.slice(0, 5);

    const url = API_KEY
      ? `${DB_URL}/config/heroSlides.json?auth=${API_KEY}`
      : `${DB_URL}/config/heroSlides.json`;
    await axios.put(url, limited);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
