import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOW = [
  "/", "/login",
  "/api/auth/line/authorize",
  "/api/auth/line/",
  "/api/auth/session",
  "/api/debug-line", "/api/debug-line-authorize",
  "/_next/", "/static/", "/favicon.ico",
];
const allowed = (p: string) => ALLOW.some(a => p === a || p.startsWith(a));

export function middleware(req: NextRequest) {
  if (allowed(req.nextUrl.pathname)) return NextResponse.next();
  const has = req.cookies.get("session")?.value;
  if (!has) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*", "/encounters/:path*", "/patients/:path*", "/portal/:path*"] };