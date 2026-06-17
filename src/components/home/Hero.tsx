import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export function Hero({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cream-50 to-cream-100">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -start-24 top-10 h-72 w-72 rounded-full bg-blossom-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -end-20 bottom-0 h-80 w-80 rounded-full bg-sage-100/70 blur-3xl" />

      <div className="container-px relative grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        {/* Copy */}
        <div className="animate-fade-up text-center lg:text-start">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            {dict.hero.badge}
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-sage-800 text-balance sm:text-5xl lg:text-6xl">
            {dict.hero.title}
          </h1>

          <p className="mt-4 text-lg font-semibold text-blossom-500">
            {dict.hero.subtitle}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-base text-ink-soft lg:mx-0">
            {dict.hero.lead}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href={`/${locale}#best-sellers`} className="btn-primary">
              {dict.actions.shopNow}
              <ArrowRight className="h-4 w-4 flip-rtl" />
            </Link>
            <Link href={`/${locale}#custom`} className="btn-outline">
              {dict.actions.customize}
            </Link>
          </div>

          {/* stats */}
          <dl className="mt-10 grid max-w-xs grid-cols-2 gap-4 text-center lg:mx-0">
            {[
              { value: "5K+", label: dict.hero.stat1 },
              { value: "300+", label: dict.hero.stat3 },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-white/70 px-2 py-3 shadow-soft"
              >
                <dt className="font-display text-2xl font-bold text-sage-600">
                  {s.value}
                </dt>
                <dd className="mt-0.5 text-xs text-ink-soft">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Visual */}
        <div className="relative animate-fade-in">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.5rem] shadow-card ring-1 ring-gold-200/60">
            <Image
              src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80"
              alt={dict.brand.name}
              fill
              sizes="(max-width: 1024px) 90vw, 40vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sage-800/30 to-transparent" />
          </div>

          {/* floating badge */}
          <div className="absolute -bottom-4 start-0 flex animate-float items-center gap-3 rounded-2xl bg-white/90 p-3 pe-5 shadow-card backdrop-blur sm:start-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-blossom-100 text-blossom-500">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="text-start">
              <p className="text-sm font-bold text-sage-700">
                {dict.whyUs.items.packaging.title}
              </p>
              <p className="text-xs text-ink-soft">
                {dict.whyUs.items.delivery.title}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
