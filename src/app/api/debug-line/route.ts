import { NextResponse } from "next/server";

export async function GET() {
  const shown = {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? null,
    LINE_CHANNEL_ID_present: !!process.env.LINE_CHANNEL_ID,
    LINE_CHANNEL_SECRET_present: !!process.env.LINE_CLIENT_SECRET,
    LINE_REDIRECT_URI: process.env.LINE_REDIRECT_URI ?? null,
    NEXT_PUBLIC_LINE_CHANNEL_ID_present: !!process.env.NEXT_PUBLIC_LINE_CLIENT_ID,
    NEXT_PUBLIC_LINE_REDIRECT_URI: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI ?? null,
    SESSION_SECRET_present: !!process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  };
  return NextResponse.json(shown, { status: 200 });
}
