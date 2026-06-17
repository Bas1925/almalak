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

async function viaFal(prompt: string, key: string, count: number): Promise<string[]> {
  const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: styledPrompt(prompt),
      image_size: "square_hd",
      num_images: count,
      num_inference_steps: 4,
      enable_safety_checker: true,
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  const urls: string[] = (data?.images ?? [])
    .map((i: { url?: string }) => i?.url)
    .filter(Boolean);
  const imgs = await Promise.all(urls.map((u) => fetch(u).then(toDataUrl).catch(() => null)));
  return imgs.filter((x): x is string => !!x);
}

async function viaPollinations(prompt: string, count: number): Promise<string[]> {
  // Each request is capped with a timeout so a slow/overloaded free service
  // can never hang the whole generation.
  const fetchOne = async (): Promise<string | null> => {
    const seed = Math.floor(Math.random() * 1_000_000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      styledPrompt(prompt),
    )}?width=1024&height=1024&nologo=true&seed=${seed}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 18_000);
    try {
      return await toDataUrl(await fetch(url, { signal: ctrl.signal }));
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  // Over-request in parallel and keep the ones that come back in time.
  const results = await Promise.all(Array.from({ length: count + 2 }, () => fetchOne()));
  return results.filter((x): x is string => !!x).slice(0, count);
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
    const count = 4;
    const images = key
      ? await viaFal(prompt, key, count)
      : await viaPollinations(prompt, count);
    if (!images.length) {
      return NextResponse.json({ error: "gen-failed" }, { status: 502 });
    }
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ error: "exception" }, { status: 500 });
  }
}
