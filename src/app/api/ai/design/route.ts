import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * AI design generator. Turns a text prompt into a printable design image.
 *
 * Uses fal.ai's FLUX (schnell) model — fast (~3s, fits Netlify's function
 * timeout) and cheap. Configure with the FAL_KEY environment variable
 * (Netlify → Site configuration → Environment variables). Returns a base64
 * data URL so the result is self-contained for the preview + WhatsApp order.
 */
export async function POST(request: Request) {
  const key = process.env.FAL_KEY;
  if (!key) {
    return NextResponse.json({ error: "not-configured" }, { status: 503 });
  }

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

  // Light styling so results look like clean, printable artwork.
  const styled = `${prompt}, clean print-ready design, vibrant colours, centered composition, high detail, sticker art style`;

  try {
    const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: styled,
        image_size: "square_hd",
        num_images: 1,
        num_inference_steps: 4,
        enable_safety_checker: true,
      }),
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      return NextResponse.json({ error: "gen-failed", detail }, { status: 502 });
    }

    const data = await res.json();
    const url: string | undefined = data?.images?.[0]?.url;
    if (!url) {
      return NextResponse.json({ error: "no-image" }, { status: 502 });
    }

    // Fetch the generated image and return it as a self-contained data URL.
    const imgRes = await fetch(url);
    if (!imgRes.ok) {
      return NextResponse.json({ error: "fetch-failed" }, { status: 502 });
    }
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const ct = imgRes.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${ct};base64,${buf.toString("base64")}`;

    return NextResponse.json({ image: dataUrl });
  } catch {
    return NextResponse.json({ error: "exception" }, { status: 500 });
  }
}
