import { NextRequest, NextResponse } from "next/server";
import { ENV, missingEnvKeys } from "@/lib/env";
import { setSession } from "@/lib/session";

function redirectUriFromReq(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host  = req.headers.get("x-forwarded-host")  ?? req.nextUrl.host;
  return `${proto}://${host}/api/auth/line/callback`;
}
const backToLogin = (req: NextRequest, p: Record<string,string>) => {
  const u = new URL("/login", req.nextUrl.origin);
  Object.entries(p).forEach(([k,v]) => u.searchParams.set(k,v));
  return NextResponse.redirect(u);
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) return backToLogin(req, { error: "oauth_error", detail: error });
  if (!code) return backToLogin(req, { error: "missing_code" });

  const miss = missingEnvKeys();
  if (miss.length) return backToLogin(req, { error: "server_env_missing", detail: `Missing: ${miss.join(", ")}` });

  const redirectUri = redirectUriFromReq(req);

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
    cache: "no-store" as RequestCache,
  });
  const rawToken = await tokenRes.text();
  if (!tokenRes.ok) return backToLogin(req, { error: "token_exchange_failed", detail: rawToken.slice(0,800) });
  const token = JSON.parse(rawToken);

  const profileRes = await fetch("https://api.line.me/v2/profile", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store" as RequestCache,
  });
  const rawProfile = await profileRes.text();
  if (!profileRes.ok) return backToLogin(req, { error: "profile_failed", detail: rawProfile.slice(0,800) });
  const profile = JSON.parse(rawProfile);

  setSession({ provider: "line", sub: profile.userId, name: profile.displayName, picture: profile.pictureUrl ?? null });
  return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
}