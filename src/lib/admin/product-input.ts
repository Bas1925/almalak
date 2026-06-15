import type { Product, CategorySlug } from "@/types";
import { categories } from "@/lib/categories";

const CATEGORY_SLUGS = new Set(categories.map((c) => c.slug));

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Coerce raw admin form input into a valid Product. Arabic name + price +
 * image + a known category are required; en/he names fall back to Arabic.
 * Returns null when required fields are missing.
 */
export function normalizeProduct(
  raw: unknown,
  opts: { isNew: boolean; existing?: Product },
): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  const name = (b.name ?? {}) as Record<string, unknown>;

  const ar = str(name.ar);
  const en = str(name.en) || ar;
  const he = str(name.he) || ar;
  const category = str(b.category) as CategorySlug;
  const image = str(b.image);
  const price = num(b.price, NaN);

  if (!ar) return null;
  if (!CATEGORY_SLUGS.has(category)) return null;
  if (!image) return null;
  if (!Number.isFinite(price) || price < 0) return null;

  const badges: Array<"new" | "bestSeller"> = [];
  if (Array.isArray(b.badges)) {
    if (b.badges.includes("bestSeller")) badges.push("bestSeller");
    if (b.badges.includes("new")) badges.push("new");
  }

  const compareAtRaw = num(b.compareAt, 0);
  const compareAt = compareAtRaw > price ? compareAtRaw : undefined;

  const id = opts.existing?.id ?? `p-${Date.now().toString(36)}`;
  const slug = str(b.slug) || opts.existing?.slug || slugify(en || ar);

  return {
    id,
    slug,
    name: { ar, en, he },
    category,
    price,
    ...(compareAt ? { compareAt } : {}),
    rating: Math.min(5, Math.max(0, num(b.rating, opts.existing?.rating ?? 4.8))),
    reviewCount: Math.max(0, Math.round(num(b.reviewCount, opts.existing?.reviewCount ?? 0))),
    image,
    ...(badges.length ? { badges } : {}),
    ...(opts.existing?.variants ? { variants: opts.existing.variants } : {}),
    inStock: b.inStock === undefined ? true : Boolean(b.inStock),
  };
}
