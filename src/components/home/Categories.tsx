import Link from "next/link";
import {
  Flower2,
  Frame,
  Gem,
  Coffee,
  Gift,
  PartyPopper,
  SprayCan,
  Award,
  Backpack,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { categories } from "@/lib/categories";

const iconMap: Record<string, LucideIcon> = {
  Flower2,
  Frame,
  Gem,
  Coffee,
  Gift,
  PartyPopper,
  SprayCan,
  Award,
  Backpack,
};

export function Categories({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <section id="categories" className="container-px py-16 lg:py-20">
      <SectionHeading
        title={dict.categories.title}
        subtitle={dict.categories.subtitle}
      />

      <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] ?? Gift;
          return (
            <Link
              key={cat.slug}
              href={`/${locale}/category/${cat.slug}`}
              className="group flex flex-col items-center gap-3 text-center"
            >
              <span className="grid h-20 w-20 place-items-center rounded-full border border-cream-300 bg-white text-sage-500 shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:border-blossom-200 group-hover:text-blossom-500 group-hover:shadow-card">
                <Icon className="h-8 w-8" strokeWidth={1.6} />
              </span>
              <span className="text-xs font-semibold text-ink-soft transition group-hover:text-sage-700 sm:text-sm">
                {dict.categories.items[cat.slug]}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  subtitle,
  center = true,
}: {
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <div className={center ? "mx-auto flex flex-col items-center" : ""}>
        <h2 className="section-title">{title}</h2>
        <span className="mt-3 block h-1 w-16 rounded-full bg-gradient-to-r from-gold-300 to-blossom-300" />
        {subtitle && (
          <p className="mt-4 max-w-2xl text-ink-soft">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
