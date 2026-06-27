import { NextRequest, NextResponse } from 'next/server';
import * as userDb from '@/lib/server/user-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, ...historyData } = body;
    if (!userId) return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    await userDb.addHistory(userId, historyData);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
