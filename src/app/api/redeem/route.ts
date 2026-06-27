import { NextRequest, NextResponse } from 'next/server';
import * as adminDb from '@/lib/server/admin-db';

export async function POST(req: NextRequest) {
  try {
    const { code, uid, displayName } = await req.json();
    if (!code || !uid) return NextResponse.json({ success: false, error: 'Missing code or uid' }, { status: 400 });
    const result = await adminDb.redeemCode(code, uid, displayName);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
