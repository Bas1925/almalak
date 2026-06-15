import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "../globals.css";
import {
  getDirection,
  isLocale,
  locales,
  localeMeta,
  type Locale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { CookieConsent } from "@/components/layout/CookieConsent";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = isLocale(params.locale) ? params.locale : "ar";
  const dict = await getDictionary(locale);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://almalak.example";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: dict.meta.title,
      template: `%s | ${dict.brand.name}`,
    },
    description: dict.meta.description,
    keywords:
      locale === "ar"
        ? ["هدايا", "ورود", "تنسيقات", "طباعة", "كفر مندا", "بوكيه", "أعراس", "الملاك"]
        : locale === "he"
          ? ["מתנות", "פרחים", "סידורי פרחים", "הדפסה", "כפר מנדא", "זר", "אל מלאכ"]
          : ["gifts", "flowers", "bouquet", "printing", "Kafr Manda", "wedding gifts", "Al Malak"],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: "/ar",
        en: "/en",
        he: "/he",
        "x-default": "/ar",
      },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      type: "website",
      url: `${siteUrl}/${locale}`,
      siteName: dict.brand.name,
      locale: localeMeta[locale].htmlLang,
      images: [{ url: "/brand/logo.jpeg", width: 512, height: 512, alt: dict.brand.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/brand/logo.jpeg"],
    },
    robots: { index: true, follow: true },
    icons: { icon: "/brand/logo.jpeg" },
  };
}

/** Per-locale typography. Fonts are loaded via <link> in the head below. */
const fontVars: Record<Locale, CSSProperties> = {
  ar: {
    ["--font-sans" as string]: "'Cairo', system-ui, sans-serif",
    ["--font-display" as string]: "'Amiri', 'Cairo', Georgia, serif",
  },
  he: {
    ["--font-sans" as string]: "'Heebo', system-ui, sans-serif",
    ["--font-display" as string]: "'Frank Ruhl Libre', 'Heebo', Georgia, serif",
  },
  en: {
    ["--font-sans" as string]: "'Poppins', system-ui, sans-serif",
    ["--font-display" as string]: "'Cormorant Garamond', Georgia, serif",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const dir = getDirection(locale);
  const dict = await getDictionary(locale);

  return (
    <html lang={localeMeta[locale].htmlLang} dir={dir} style={fontVars[locale]}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Frank+Ruhl+Libre:wght@400;500;700;900&family=Heebo:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans">
        <StoreProvider>{children}</StoreProvider>
        <CookieConsent
          locale={locale}
          message={dict.cookies.message}
          accept={dict.cookies.accept}
          decline={dict.cookies.decline}
          learnMore={dict.cookies.learnMore}
        />
      </body>
    </html>
  );
}
