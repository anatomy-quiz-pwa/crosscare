import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";
import { setSession } from "@/lib/session";

function resolveRedirectUri(req: NextRequest) {
  if (ENV.LINE_REDIRECT_URI) return ENV.LINE_REDIRECT_URI;
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
  return `${proto}://${host}/api/auth/line/callback`;
}

function backToLogin(req: NextRequest, params: Record<string, string>) {
  const url = new URL("/login", req.nextUrl.origin);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return backToLogin(req, { error: "oauth_error", detail: error });
  }
  if (!code) {
    return backToLogin(req, { error: "missing_code" });
  }

  const redirectUri = resolveRedirectUri(req);

  // 1) 用授權碼換 token
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: ENV.LINE_CHANNEL_ID,
    client_secret: ENV.LINE_CHANNEL_SECRET,
  });

  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
    // @ts-expect-error
    cache: "no-store",
  });

  const rawToken = await tokenRes.text();
  if (!tokenRes.ok) {
    return backToLogin(req, {
      error: "token_exchange_failed",
      detail: rawToken.slice(0, 800),
    });
  }

  const token = JSON.parse(rawToken);

  // 2) 取使用者 profile
  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    // @ts-expect-error
    cache: "no-store",
  });
  const rawProfile = await profileRes.text();
  if (!profileRes.ok) {
    return backToLogin(req, {
      error: "profile_failed",
      detail: rawProfile.slice(0, 800),
    });
  }
  const profile = JSON.parse(rawProfile);

  // 3) 設定 Session
  setSession({
    provider: "line",
    sub: profile.userId,
    name: profile.displayName,
    picture: profile.pictureUrl ?? null,
  });

  // 4) 確認 cookie 是否已寫入（避免被瀏覽器策略擋掉）
  const hasCookie = req.cookies.get("session") ? "1" : "0"; // API Route 內通常拿不到新值，僅作參考
  const redirect = new URL("/dashboard", req.nextUrl.origin);
  redirect.searchParams.set("logged", "1");
  redirect.searchParams.set("ck", hasCookie);
  return NextResponse.redirect(redirect);
}