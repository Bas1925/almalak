import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, ShieldCheck } from "lucide-react";

import { isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getAllProducts } from "@/lib/server/catalog";
import { getPolicy, policySlugs } from "@/lib/policies";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    policySlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const policy = getPolicy(params.slug);
  if (!policy) return {};
  const dict = await getDictionary(params.locale);
  return {
    title: `${policy.title[params.locale]} — ${dict.brand.name}`,
    description: policy.intro[params.locale],
    alternates: { canonical: `/${params.locale}/policies/${params.slug}` },
  };
}

export default async function PolicyPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const policy = getPolicy(params.slug);
  if (!policy) notFound();

  const dict = await getDictionary(locale);
  const allProducts = await getAllProducts();

  return (
    <>
      <Header dict={dict} locale={locale} products={allProducts} />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-cream-300 bg-gradient-to-b from-sage-50 to-cream-100">
          <div className="pointer-events-none absolute -end-16 top-0 h-64 w-64 rounded-full bg-blossom-100/50 blur-3xl" />
          <div className="container-px relative py-12 lg:py-16">
            <nav className="mb-5 flex items-center gap-1.5 text-sm text-ink-soft">
              <Link href={`/${locale}`} className="transition hover:text-sage-700">
                {dict.categoryPage.home}
              </Link>
              <ChevronLeft className="h-4 w-4 flip-rtl text-ink-faint" />
              <span className="font-semibold text-sage-700">{policy.title[locale]}</span>
            </nav>

            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-sage-500 text-white shadow-soft">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="font-display text-3xl font-bold text-sage-800 sm:text-4xl">
                {policy.title[locale]}
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container-px py-12 lg:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="text-lg leading-relaxed text-ink-soft">
              {policy.intro[locale]}
            </p>

            <div className="mt-10 space-y-8">
              {policy.sections.map((section, i) => (
                <div key={i} className="card p-6 sm:p-7">
                  <h2 className="font-display text-xl font-bold text-sage-700">
                    {section.heading[locale]}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {section.body.map((p, j) => (
                      <p key={j} className="leading-relaxed text-ink-soft">
                        {p[locale]}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href={`/${locale}`} className="btn-outline">
                {dict.categoryPage.home}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer dict={dict} locale={locale} />
      <WhatsAppFab locale={locale} />
    </>
  );
}
