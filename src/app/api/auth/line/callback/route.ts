import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";
import { setSession } from "@/lib/session";

function resolveRedirectUri(req: NextRequest) {
  if (ENV.LINE_REDIRECT_URI) return ENV.LINE_REDIRECT_URI;
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
  return `${proto}://${host}/api/auth/line/callback`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, req.nextUrl.origin));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", req.nextUrl.origin));
  }

  const redirectUri = resolveRedirectUri(req);

  // 1) 授權碼換 token
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: ENV.LINE_CHANNEL_ID,
    client_secret: ENV.LINE_CHANNEL_SECRET,
  });

  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    // @ts-expect-error: next runtime hints
    cache: "no-store",
  });

  if (!tokenRes.ok) {
    const detail = await tokenRes.text();
    return NextResponse.redirect(
      new URL(`/login?error=token_exchange_failed&detail=${encodeURIComponent(detail)}`, req.nextUrl.origin)
    );
  }

  const token = await tokenRes.json();

  // 2) 取使用者 profile（或驗 ID token）
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    // @ts-expect-error
    cache: "no-store",
  });
  if (!profileRes.ok) {
    const detail = await profileRes.text();
    return NextResponse.redirect(
      new URL(`/login?error=profile_failed&detail=${encodeURIComponent(detail)}`, req.nextUrl.origin)
    );
  }
  const profile = await profileRes.json();

  // 3) 設置 Session（最小必要資訊）
  setSession({
    provider: "line",
    sub: profile.userId, // LINE 的使用者 id
    name: profile.displayName,
    picture: profile.pictureUrl ?? null,
  });

  // 4) 導回受保護頁
  return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
}