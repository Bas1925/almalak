import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * AI design generator. Turns a text prompt into a printable design image.
 *
 * - If FAL_KEY is set → uses fal.ai's FLUX (fast ~3s, high quality, paid).
 * - Otherwise → falls back to Pollinations.ai, which is FREE and needs no key
 *   (good for testing; slower and less reliable, so set FAL_KEY for production).
 *
 * Returns a base64 data URL so the result is self-contained for the canvas.
 */

function styledPrompt(prompt: string): string {
  return `${prompt}, clean print-ready design, vibrant colours, centered composition, high detail, sticker art style`;
}

async function toDataUrl(res: Response): Promise<string | null> {
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get("content-type") || "image/jpeg";
  return `data:${ct};base64,${buf.toString("base64")}`;
}

async function viaFal(prompt: string, key: string): Promise<string | null> {
  const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: styledPrompt(prompt),
      image_size: "square_hd",
      num_images: 1,
      num_inference_steps: 4,
      enable_safety_checker: true,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const url: string | undefined = data?.images?.[0]?.url;
  if (!url) return null;
  return toDataUrl(await fetch(url));
}

async function viaPollinations(prompt: string): Promise<string | null> {
  const seed = Math.floor(Math.random() * 1_000_000);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    styledPrompt(prompt),
  )}?width=1024&height=1024&nologo=true&seed=${seed}`;
  return toDataUrl(await fetch(url));
}

export async function POST(request: Request) {
  let prompt = "";
  try {
    const body = await request.json();
    prompt = String(body?.prompt ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad-json" }, { status: 400 });
  }
  if (!prompt || prompt.length < 2) {
    return NextResponse.json({ error: "no-prompt" }, { status: 400 });
  }
  prompt = prompt.slice(0, 400);

  try {
    const key = process.env.FAL_KEY;
    const image = key ? await viaFal(prompt, key) : await viaPollinations(prompt);
    if (!image) {
      return NextResponse.json({ error: "gen-failed" }, { status: 502 });
    }
    return NextResponse.json({ image });
  } catch {
    return NextResponse.json({ error: "exception" }, { status: 500 });
  }
}
