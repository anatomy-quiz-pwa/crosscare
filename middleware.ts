import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOW_LIST = [
  "/",
  "/login",
  "/api/auth/line/",
  "/api/debug-line",
  "/_next/",
  "/static/",
  "/favicon.ico",
];

function isAllowed(pathname: string) {
  return ALLOW_LIST.some((p) => pathname === p || pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isAllowed(pathname)) return NextResponse.next();

  // 檢查 session cookie
  const session = req.cookies.get("session")?.value;
  if (!session) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  // 可加驗簽，但在 middleware 無法用 Node crypto 簽，已由 API route 設置時保證。
  return NextResponse.next();
}

// 只保護這些頁面（依你的專案調整）
export const config = {
  matcher: ["/dashboard/:path*", "/encounters/:path*", "/patients/:path*", "/portal/:path*"],
};
