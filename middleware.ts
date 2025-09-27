import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOW = [
  "/",
  "/login",
  "/api/auth/line/authorize",
  "/api/auth/line/",
  "/api/auth/session",
  "/api/debug-line",
  "/api/debug-line-authorize",
  "/_next/",
  "/static/",
  "/favicon.ico",
];

function allowed(pathname: string) {
  return ALLOW.some((p) => pathname === p || pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (allowed(pathname)) return NextResponse.next();

  const session = req.cookies.get("session")?.value;
  if (!session) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/encounters/:path*", "/patients/:path*", "/portal/:path*"],
};