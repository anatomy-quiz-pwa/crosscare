import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";

function resolveRedirectUri(req: NextRequest) {
  if (ENV.LINE_REDIRECT_URI) return ENV.LINE_REDIRECT_URI;
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
  return `${proto}://${host}/api/auth/line/callback`;
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    computed_redirect_uri: resolveRedirectUri(req),
    LINE_CHANNEL_ID_present: !!ENV.LINE_CHANNEL_ID,
  });
}
