import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";

function resolveRedirectUri(req: NextRequest) {
  if (ENV.LINE_REDIRECT_URI) return ENV.LINE_REDIRECT_URI;
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
  return `${proto}://${host}/api/auth/line/callback`;
}

export async function GET(req: NextRequest) {
  const redirectUri = resolveRedirectUri(req);
  const clientId = ENV.LINE_CHANNEL_ID || "";
  if (!clientId) {
    const u = new URL("/login", req.nextUrl.origin);
    u.searchParams.set("error", "server_env_missing");
    u.searchParams.set("detail", "Missing LINE_CHANNEL_ID");
    return NextResponse.redirect(u);
  }

  const state = Math.random().toString(36).slice(2);
  const auth = new URL("https://access.line.me/oauth2/v2.1/authorize");
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("scope", "profile openid email");
  auth.searchParams.set("state", state);

  const res = NextResponse.redirect(auth.toString());
  res.cookies.set("line_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  return res;
}
