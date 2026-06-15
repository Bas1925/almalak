import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://almalak.example";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/ar/admin", "/en/admin", "/he/admin"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
