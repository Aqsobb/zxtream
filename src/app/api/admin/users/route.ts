import { NextResponse } from 'next/server';
import * as adminDb from '@/lib/server/admin-db';

export async function GET() {
  try {
    const data = await adminDb.getAllUsers();
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
