import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, LayoutGrid, Star } from "lucide-react";

import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getBestSellers, getAllProducts } from "@/lib/server/catalog";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { ProductCard } from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dict = await getDictionary(params.locale);
  return {
    title: `${dict.bestSellers.title} — ${dict.brand.name}`,
    description: dict.bestSellers.subtitle,
    alternates: { canonical: `/${params.locale}/best-sellers` },
  };
}

export default async function BestSellersPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;

  const dict = await getDictionary(locale);
  const items = await getBestSellers(1000); // all flagged best sellers
  const allProducts = await getAllProducts();

  return (
    <>
      <Header dict={dict} locale={locale} products={allProducts} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-cream-300 bg-gradient-to-b from-sage-50 to-cream-100">
          <div className="pointer-events-none absolute -end-16 top-0 h-64 w-64 rounded-full bg-gold-200/40 blur-3xl" />
          <div className="container-px relative py-12 lg:py-16">
            <nav className="mb-5 flex items-center gap-1.5 text-sm text-ink-soft">
              <Link href={`/${locale}`} className="transition hover:text-sage-700">
                {dict.categoryPage.home}
              </Link>
              <ChevronLeft className="h-4 w-4 flip-rtl text-ink-faint" />
              <span className="font-semibold text-sage-700">{dict.bestSellers.title}</span>
            </nav>

            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gold-400 text-white shadow-soft ring-1 ring-gold-200/60">
                <Star className="h-10 w-10 fill-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-sage-800 sm:text-4xl">
                  {dict.bestSellers.title}
                </h1>
                <p className="mt-2 text-ink-soft">
                  {items.length} {dict.categoryPage.results}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="container-px py-12 lg:py-16">
          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  dict={dict}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sage-50 text-sage-400">
                <LayoutGrid className="h-7 w-7" />
              </span>
              <p className="text-ink-soft">{dict.categoryPage.empty}</p>
              <Link href={`/${locale}#categories`} className="btn-primary">
                {dict.categoryPage.backToProducts}
              </Link>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href={`/${locale}#categories`} className="btn-outline">
              <LayoutGrid className="h-4 w-4" />
              {dict.categoryPage.backToProducts}
            </Link>
          </div>
        </section>
      </main>

      <Footer dict={dict} locale={locale} />
      <WhatsAppFab locale={locale} />
    </>
  );
}
