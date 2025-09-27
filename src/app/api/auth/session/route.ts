import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const ck = cookies().get("session")?.value ?? null;
  return NextResponse.json({ hasSessionCookie: !!ck, sessionPreview: ck ? ck.slice(0, 24) + "..." : null });
}
