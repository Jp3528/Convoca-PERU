import "server-only";
import { cookies } from "next/headers";
import {
  createHmac,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { storageProvider, supabaseRequest } from "./portal-store";
const name = "convoca_editor";
const secret = () => process.env.SESSION_SECRET || "";
export function authConfigured() {
  return (
    secret().length >= 32 &&
    !!process.env.ADMIN_PASSWORD_HASH &&
    !!process.env.ADMIN_EMAIL
  );
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function validPassword(password: string) {
  if (!authConfigured() || password.length > 256) return false;
  try {
    const [salt, hash] = process.env.ADMIN_PASSWORD_HASH!.split(":");
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return (
      expected.length === actual.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}
export async function currentEditor() {
  if (!authConfigured()) return null;
  const token = (await cookies()).get(name)?.value;
  if (!token) return null;
  try {
    const [payload, signature] = token.split(".");
    const actual = Buffer.from(signature || "");
    const expected = Buffer.from(sign(payload));
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return data.exp > Date.now() && data.email === process.env.ADMIN_EMAIL
      ? String(data.email)
      : null;
  } catch {
    return null;
  }
}
export async function createSession() {
  const payload = Buffer.from(
    JSON.stringify({
      email: process.env.ADMIN_EMAIL,
      exp: Date.now() + 8 * 3600000,
    }),
  ).toString("base64url");
  (await cookies()).set(name, payload + "." + sign(payload), {
    httpOnly: true,
    secure: process.env.VERCEL === "1",
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 3600,
  });
}
export async function endSession() {
  (await cookies()).delete(name);
}
export function assertOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  let sameOrigin = false;
  try {
    const parsed = new URL(origin || "");
    const protocol = (
      request.headers.get("x-forwarded-proto") ||
      new URL(request.url).protocol.replace(":", "")
    )
      .split(",")[0]
      .trim();
    sameOrigin =
      !!host &&
      parsed.host.toLowerCase() === host.toLowerCase() &&
      parsed.protocol === protocol + ":";
  } catch {}
  if (!sameOrigin) throw new Error("Origen de solicitud no permitido.");
}
const limits = new Map<string, { count: number; ends: number }>();
export async function rateLimit(
  request: Request,
  category: string,
  max: number,
  seconds: number,
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const bucket = createHash("sha256")
    .update(category + ":" + ip)
    .digest("hex");
  if (storageProvider() === "supabase")
    return !!(await supabaseRequest("rpc/consume_portal_limit", {
      method: "POST",
      body: JSON.stringify({
        bucket_key: bucket,
        max_hits: max,
        window_seconds: seconds,
      }),
    }));
  const now = Date.now();
  const previous = limits.get(bucket);
  const entry =
    previous && previous.ends > now
      ? previous
      : { count: 0, ends: now + seconds * 1000 };
  entry.count++;
  limits.set(bucket, entry);
  if (limits.size > 1000)
    for (const [key, value] of limits)
      if (value.ends <= now) limits.delete(key);
  return entry.count <= max;
}
