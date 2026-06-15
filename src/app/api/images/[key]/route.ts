import { readImage } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Serves admin-uploaded images from Netlify Blobs in production. (Locally,
 * uploads are written to /public/products and served statically, so this
 * route isn't used.)
 */
export async function GET(
  _request: Request,
  { params }: { params: { key: string } },
) {
  const img = await readImage(params.key);
  if (!img) return new Response("Not found", { status: 404 });

  const ct =
    img.ext === "png"
      ? "image/png"
      : img.ext === "webp"
        ? "image/webp"
        : "image/jpeg";

  return new Response(new Uint8Array(img.buffer), {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
