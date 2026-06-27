import { NextRequest, NextResponse } from 'next/server';
import * as userDb from '../../../../../../../server/services/user-db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const user = await userDb.getUser(uid);
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const { email, ...safe } = user;
    return NextResponse.json({ success: true, data: safe });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const { uid } = await params;
    const body = await req.json();
    await userDb.updateUser(uid, body);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  return PUT(req, { params });
}
