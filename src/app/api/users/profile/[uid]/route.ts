import { NextRequest, NextResponse } from 'next/server';
import * as userDb from '@/lib/server/user-db';
import axios from 'axios';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

function authUrl(path: string) {
  return API_KEY
    ? `${DB_URL}/${path}.json?auth=${API_KEY}`
    : `${DB_URL}/${path}.json`;
}

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

    // If requesterUid is provided, verify owner permissions for sensitive fields
    if (body.requesterUid) {
      const requester = await userDb.getUser(body.requesterUid);
      const isRequesterOwner = requester?.role === 'owner' || requester?.isOwner;

      if (!isRequesterOwner) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }

      // Owner can set title and role for others
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.role !== undefined) updateData.role = body.role;
      if (Object.keys(updateData).length > 0) {
        await userDb.updateUser(uid, updateData);
      }
      return NextResponse.json({ success: true });
    }

    // Normal user updating own profile (no title/role changes)
    await userDb.updateUser(uid, body);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  return PUT(req, { params });
}
