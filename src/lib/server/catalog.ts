import type { Product, CategorySlug } from "@/types";
import seedData from "../../../data/products.json";
import { readCatalog, writeCatalog } from "./store";

/**
 * Runtime catalogue. Reads/writes through the storage adapter (store.ts):
 * filesystem locally, Netlify Blobs in production. When the store is empty
 * (e.g. a fresh Netlify deploy before the first admin edit) it falls back to
 * the committed seed in data/products.json so the site is never empty.
 */

const seed = seedData as Product[];

async function readProducts(): Promise<Product[]> {
  const data = await readCatalog();
  if (data && data.length) return data;
  return seed;
}

/* ── storefront reads ── */

export async function getAllProducts(): Promise<Product[]> {
  return readProducts();
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  const all = await readProducts();
  const flagged = all.filter((p) => p.badges?.includes("bestSeller"));
  return (flagged.length ? flagged : all).slice(0, limit);
}

export async function getProductsByCategory(
  category: CategorySlug,
): Promise<Product[]> {
  return (await readProducts()).filter((p) => p.category === category);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return (await readProducts()).find((p) => p.id === id);
}

/* ── admin writes ── */

export async function createProduct(product: Product): Promise<Product> {
  const list = await readProducts();
  list.push(product);
  await writeCatalog(list);
  return product;
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>,
): Promise<Product | null> {
  const list = await readProducts();
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], ...patch, id: list[idx].id };
  await writeCatalog(list);
  return list[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const list = await readProducts();
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) return false;
  await writeCatalog(next);
  return true;
}
