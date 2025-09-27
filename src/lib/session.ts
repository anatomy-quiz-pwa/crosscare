import { cookies } from "next/headers";
import crypto from "crypto";
import { ENV } from "./env";

const COOKIE_NAME = "session";

function sign(data: string) {
  return crypto.createHmac("sha256", ENV.SESSION_SECRET).update(data).digest("base64url");
}

export function setSession(payload: object) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = sign(b64);
  cookies().set(COOKIE_NAME, `${b64}.${sig}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7d
  });
}

export function getSession(): null | any {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [b64, sig] = raw.split(".");
  if (!b64 || !sig) return null;
  if (sign(b64) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().delete(COOKIE_NAME);
}
