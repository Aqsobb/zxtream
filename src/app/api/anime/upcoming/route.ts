import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    message: 'Upcoming anime coming soon',
  });
}
