import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { notFound } from "next/navigation";
import { getAllProducts, getBestSellers } from "@/lib/server/catalog";
import { INSTAGRAM_HANDLE } from "@/lib/utils";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://almalak.example";

export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";

import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { BestSellers } from "@/components/home/BestSellers";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CustomPrinting } from "@/components/home/CustomPrinting";
import { AiAssistant } from "@/components/home/AiAssistant";
import { InstagramGallery } from "@/components/home/InstagramGallery";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const dict = await getDictionary(locale);
  const allProducts = await getAllProducts();
  const bestSellers = await getBestSellers(8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE}/#store`,
    name: "Al Malak Gifts, Flowers & Printing",
    alternateName: dict.brand.name,
    description: dict.meta.description,
    image: `${SITE}/brand/logo.jpeg`,
    url: `${SITE}/${locale}`,
    telephone: "+972509011449",
    priceRange: "₪₪",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kafr Manda",
      addressRegion: "Northern District",
      addressCountry: "IL",
    },
    areaServed: "Kafr Manda",
    sameAs: [`https://instagram.com/${INSTAGRAM_HANDLE}`],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header dict={dict} locale={locale} products={allProducts} />

      <main>
        <Hero dict={dict} locale={locale} />
        <Categories dict={dict} locale={locale} />
        <BestSellers dict={dict} locale={locale} products={bestSellers} />
        <WhyChooseUs dict={dict} />
        <CustomPrinting dict={dict} locale={locale} />
        <AiAssistant dict={dict} locale={locale} products={allProducts} />
        <InstagramGallery dict={dict} />
      </main>

      <Footer dict={dict} locale={locale} />
      <WhatsAppFab locale={locale} />
    </>
  );
}
