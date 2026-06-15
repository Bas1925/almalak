import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidPassword, sessionToken } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = await request.json();
    password = String(body?.password ?? "");
  } catch {
    /* ignore */
  }

  if (!isValidPassword(password)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
