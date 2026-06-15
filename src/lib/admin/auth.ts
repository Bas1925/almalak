import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal single-admin auth. The owner logs in with a password; we store an
 * HMAC token (not the password) in an httpOnly cookie. No database needed.
 *
 * Configure via env (Netlify dashboard → Environment variables):
 *   ADMIN_PASSWORD  — the owner's login password
 *   ADMIN_SECRET    — any long random string used to sign the session cookie
 */

export const ADMIN_COOKIE = "almalak_admin";

const PASSWORD = process.env.ADMIN_PASSWORD ?? "almalak2026";
const SECRET = process.env.ADMIN_SECRET ?? "almalak-dev-secret-change-me";

/** The opaque session token derived from the secret (constant per deployment). */
export function sessionToken(): string {
  return crypto.createHmac("sha256", SECRET).update("admin-session").digest("hex");
}

export function isValidPassword(input: string): boolean {
  const a = Buffer.from(input || "");
  const b = Buffer.from(PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Server-side check: is the current request from a logged-in admin? */
export function isAuthed(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = sessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
