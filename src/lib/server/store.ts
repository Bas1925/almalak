import fs from "node:fs";
import path from "node:path";
import type { Product } from "@/types";

/**
 * Storage adapter. Two backends, selected automatically:
 *  - LOCAL (dev): filesystem — data/products.json + /public/products for images.
 *  - NETLIFY (production): Netlify Blobs — persistent, since Netlify's filesystem
 *    is read-only. Catalog lives in one blob; uploaded images in an image store
 *    served back through /api/images/[key].
 *
 * Everything else in the app talks to catalog.ts, which talks to this — so the
 * backend can change without touching pages, the admin, or the API routes.
 */

const onNetlify =
  process.env.NETLIFY === "true" || !!process.env.NETLIFY_BLOBS_CONTEXT;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "products.json");

const CATALOG_STORE = "almalak-catalog";
const CATALOG_KEY = "products";
const IMAGE_STORE = "almalak-images";

const STUDIO_STORE = "almalak-studio";
const STUDIO_KEY = "config";
const STUDIO_FILE = path.join(DATA_DIR, "studio.json");

/* ── catalogue ── */

export async function readCatalog(): Promise<Product[] | null> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const data = (await getStore(CATALOG_STORE).get(CATALOG_KEY, {
      type: "json",
    })) as Product[] | null;
    return data ?? null;
  }
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return Array.isArray(parsed) ? (parsed as Product[]) : null;
  } catch {
    return null;
  }
}

export async function writeCatalog(list: Product[]): Promise<void> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    await getStore(CATALOG_STORE).setJSON(CATALOG_KEY, list);
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

/* ── design studio config (names + prices for the printable products) ── */

export async function readStudio(): Promise<Record<string, unknown> | null> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const data = (await getStore(STUDIO_STORE).get(STUDIO_KEY, {
      type: "json",
    })) as Record<string, unknown> | null;
    return data ?? null;
  }
  try {
    if (!fs.existsSync(STUDIO_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(STUDIO_FILE, "utf-8"));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeStudio(config: unknown): Promise<void> {
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    await getStore(STUDIO_STORE).setJSON(STUDIO_KEY, config);
    return;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STUDIO_FILE, JSON.stringify(config, null, 2), "utf-8");
}

/* ── images ── */

export async function saveImage(buffer: Buffer, ext: string): Promise<string> {
  const fileName = `up-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}.${ext}`;
  if (onNetlify) {
    const { getStore } = await import("@netlify/blobs");
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer;
    await getStore(IMAGE_STORE).set(fileName, arrayBuffer, {
      metadata: { ext },
    });
    return `/api/images/${fileName}`;
  }
  const dir = path.join(process.cwd(), "public", "products");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, fileName), buffer);
  return `/products/${fileName}`;
}

/** Read an uploaded image back (Netlify only; local images are served statically). */
export async function readImage(
  key: string,
): Promise<{ buffer: Buffer; ext: string } | null> {
  if (!onNetlify) return null;
  const { getStore } = await import("@netlify/blobs");
  const ab = (await getStore(IMAGE_STORE).get(key, {
    type: "arrayBuffer",
  })) as ArrayBuffer | null;
  if (!ab) return null;
  return { buffer: Buffer.from(ab), ext: key.split(".").pop() || "jpeg" };
}
