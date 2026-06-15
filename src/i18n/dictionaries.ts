import "server-only";
import type { Locale } from "./config";
import type ar from "./dictionaries/ar.json";

export type Dictionary = typeof ar;

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  he: () => import("./dictionaries/he.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
