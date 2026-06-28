import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

function authUrl(path: string) {
  return API_KEY
    ? `${DB_URL}/${path}.json?auth=${API_KEY}`
    : `${DB_URL}/${path}.json`;
}

// Subscribe to push notifications
export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();
    if (!userId || !subscription) {
      return NextResponse.json({ success: false, error: 'Missing userId or subscription' }, { status: 400 });
    }

    // Save subscription to Firebase
    await axios.put(authUrl(`pushSubscriptions/${userId}`), {
      ...subscription,
      subscribedAt: Date.now(),
      userAgent: req.headers.get('user-agent') || '',
    });

    return NextResponse.json({ success: true, message: 'Subscribed to push notifications' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// Unsubscribe from push notifications
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    await axios.delete(authUrl(`pushSubscriptions/${userId}`));

    return NextResponse.json({ success: true, message: 'Unsubscribed from push notifications' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// Get subscription status
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    const { data } = await axios.get(authUrl(`pushSubscriptions/${userId}`)).catch(() => ({ data: null }));

    return NextResponse.json({
      success: true,
      subscribed: !!data,
      subscribedAt: data?.subscribedAt || null,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
