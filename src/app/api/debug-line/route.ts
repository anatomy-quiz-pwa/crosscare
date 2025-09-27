import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    LINE_CHANNEL_ID_present: !!process.env.LINE_CHANNEL_ID,
    LINE_CHANNEL_SECRET_present: !!process.env.LINE_CHANNEL_SECRET,
    LINE_REDIRECT_URI: process.env.LINE_REDIRECT_URI ?? null,
    NEXT_PUBLIC_LINE_CHANNEL_ID_present: !!process.env.NEXT_PUBLIC_LINE_CLIENT_ID,
    NEXT_PUBLIC_LINE_REDIRECT_URI: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI ?? null,
    NODE_ENV: process.env.NODE_ENV,
  });
}