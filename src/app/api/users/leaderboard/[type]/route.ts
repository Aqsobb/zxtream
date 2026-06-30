import { NextRequest, NextResponse } from 'next/server';
import * as userDb from '@/lib/server/user-db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  try {
    const { type } = await params;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100', 10);
    // Map tab IDs to DB field names
    const fieldMap: Record<string, string> = { exp: 'totalExp', watchtime: 'watchTime', comments: 'commentCount' };
    const field = fieldMap[type] || type;
    const data = await userDb.getLeaderboard(field, limit);
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
