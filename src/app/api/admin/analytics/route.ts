import { NextResponse } from 'next/server';
import axios from 'axios';
import * as adminDb from '@/lib/server/admin-db';

const DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;

export async function GET() {
  try {
    const users = await adminDb.getAllUsers();
    const codes = await adminDb.getAllCodes();
    const codeList = codes ? Object.values(codes) : [];

    let totalViews = 0;
    try {
      const url = API_KEY ? `${DB_URL}/analytics.json?auth=${API_KEY}` : `${DB_URL}/analytics.json`;
      const { data } = await axios.get(url);
      totalViews = data?.totalViews || 0;
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: users.length,
        totalCodes: codeList.length,
        totalViews,
        bannedUsers: users.filter((u: any) => u.banned).length,
        roles: {
          owner: users.filter((u: any) => u.role === 'owner').length,
          vvip: users.filter((u: any) => u.role === 'vvip').length,
          vip: users.filter((u: any) => u.role === 'vip').length,
          member: users.filter((u: any) => u.role === 'member' || !u.role).length,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
