import { NextResponse } from 'next/server'

export async function GET() {
  const shown = {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? null,
    LINE_CHANNEL_ID_present: !!process.env.NEXT_PUBLIC_LINE_CLIENT_ID,
    LINE_CHANNEL_SECRET_present: !!process.env.LINE_CLIENT_SECRET,
    NEXT_PUBLIC_LINE_REDIRECT_URI: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI ?? null,
    NODE_ENV: process.env.NODE_ENV,
  };
  return NextResponse.json(shown, { status: 200 });
}
