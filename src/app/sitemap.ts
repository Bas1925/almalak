import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { categories } from "@/lib/categories";
import { policySlugs } from "@/lib/policies";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://almalak.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${SITE}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    });
    entries.push({
      url: `${SITE}/${locale}/best-sellers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const c of categories) {
      entries.push({
        url: `${SITE}/${locale}/category/${c.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const slug of policySlugs) {
      entries.push({
        url: `${SITE}/${locale}/policies/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.3,
      });
    }
  }

  return entries;
}
