import { NextRequest, NextResponse } from "next/server";
import { ENV, missingEnvKeys } from "@/lib/env";
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

  // 先檢查 env，避免送出空 client_id
  const miss = missingEnvKeys();
  if (miss.length) {
    return backToLogin(req, {
      error: "server_env_missing",
      detail: `Missing: ${miss.join(", ")}`
    });
  }

  const redirectUri = resolveRedirectUri(req);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: ENV.LINE_CHANNEL_ID,         // ← 這裡以前是空的
    client_secret: ENV.LINE_CHANNEL_SECRET,
  });

  const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    // @ts-expect-error
    cache: "no-store",
  });

  const rawToken = await tokenRes.text();
  if (!tokenRes.ok) {
    return backToLogin(req, { error: "token_exchange_failed", detail: rawToken.slice(0, 800) });
  }
  const token = JSON.parse(rawToken);

  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    // @ts-expect-error
    cache: "no-store",
  });
  const rawProfile = await profileRes.text();
  if (!profileRes.ok) {
    return backToLogin(req, { error: "profile_failed", detail: rawProfile.slice(0, 800) });
  }
  const profile = JSON.parse(rawProfile);

  setSession({
    provider: "line",
    sub: profile.userId,
    name: profile.displayName,
    picture: profile.pictureUrl ?? null,
  });

  return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
}