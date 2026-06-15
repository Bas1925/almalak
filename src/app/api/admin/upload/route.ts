import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/admin/auth";
import { saveImage } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Accepts a base64 data URL (already resized in the browser) and stores it via
 * the storage adapter: /public/products locally, Netlify Blobs in production.
 * Returns the URL to save on the product.
 */
export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let dataUrl = "";
  try {
    const body = await request.json();
    dataUrl = String(body?.dataUrl ?? "");
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }

  const match = /^data:image\/(png|jpe?g|webp);base64,(.+)$/i.exec(dataUrl);
  if (!match) return NextResponse.json({ error: "bad-image" }, { status: 400 });

  const ext =
    match[1].toLowerCase() === "png"
      ? "png"
      : match[1].toLowerCase() === "webp"
        ? "webp"
        : "jpeg";
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "too-large" }, { status: 413 });
  }

  const url = await saveImage(buffer, ext);
  return NextResponse.json({ ok: true, url });
}
