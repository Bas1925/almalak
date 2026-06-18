import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import {
  STUDIO_PRODUCTS,
  type StudioProductId,
  type ResolvedStudioProduct,
  type StudioAdminItem,
} from "@/components/studio/studio-products";
import { readStudio, writeStudio } from "./store";

/**
 * Owner-editable overrides for the Design Studio products (the four printable
 * items: frame, bag, bottle, mug). Defaults live in studio-products.ts (price)
 * and the locale dictionaries (names); these overrides take precedence and are
 * persisted through the storage adapter (filesystem in dev, Netlify Blobs in
 * production) so the live site updates instantly from the admin panel.
 */
export interface StudioOverride {
  price?: number;
  name?: Partial<Record<Locale, string>>;
}

export type StudioConfig = Partial<Record<StudioProductId, StudioOverride>>;

const VALID_IDS = new Set<string>(STUDIO_PRODUCTS.map((p) => p.id));

async function readConfig(): Promise<StudioConfig> {
  const raw = await readStudio();
  return (raw as StudioConfig) ?? {};
}

/** Storefront read: products with the price + name resolved for one locale. */
export async function getStudioProducts(
  locale: Locale,
): Promise<ResolvedStudioProduct[]> {
  const config = await readConfig();
  const dict = await getDictionary(locale);
  return STUDIO_PRODUCTS.map((p) => {
    const o = config[p.id] ?? {};
    return {
      ...p,
      price: typeof o.price === "number" ? o.price : p.price,
      name: o.name?.[locale]?.trim() || dict.customPrinting.products[p.id],
    };
  });
}

/** Admin read: each product's price + name in all three languages. */
export async function getStudioAdminItems(): Promise<StudioAdminItem[]> {
  const config = await readConfig();
  const dictEntries = await Promise.all(
    locales.map(async (l) => [l, await getDictionary(l)] as const),
  );
  const dicts = Object.fromEntries(dictEntries) as Record<
    Locale,
    Awaited<ReturnType<typeof getDictionary>>
  >;

  return STUDIO_PRODUCTS.map((p) => {
    const o = config[p.id] ?? {};
    const name = {} as StudioAdminItem["name"];
    for (const l of locales) {
      name[l] = o.name?.[l]?.trim() || dicts[l].customPrinting.products[p.id];
    }
    return {
      id: p.id,
      price: typeof o.price === "number" ? o.price : p.price,
      name,
    };
  });
}

/** Admin write: validate incoming items and persist them as overrides. */
export async function saveStudioItems(input: unknown): Promise<boolean> {
  const items = Array.isArray((input as { items?: unknown })?.items)
    ? (input as { items: unknown[] }).items
    : null;
  if (!items) return false;

  const config: StudioConfig = {};
  for (const raw of items) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { id?: unknown; price?: unknown; name?: unknown };
    if (typeof item.id !== "string" || !VALID_IDS.has(item.id)) continue;

    const override: StudioOverride = {};

    const price = Number(item.price);
    if (Number.isFinite(price) && price > 0) {
      override.price = Math.round(price * 100) / 100;
    }

    if (item.name && typeof item.name === "object") {
      const src = item.name as Record<string, unknown>;
      const name: Partial<Record<Locale, string>> = {};
      for (const l of locales) {
        const v = src[l];
        if (typeof v === "string" && v.trim()) name[l] = v.trim();
      }
      if (Object.keys(name).length) override.name = name;
    }

    config[item.id as StudioProductId] = override;
  }

  await writeStudio(config);
  return true;
}
