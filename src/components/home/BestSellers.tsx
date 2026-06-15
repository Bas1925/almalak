import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "./Categories";

export function BestSellers({
  dict,
  locale,
  products,
}: {
  dict: Dictionary;
  locale: Locale;
  products: Product[];
}) {
  return (
    <section id="best-sellers" className="bg-cream-50 py-16 lg:py-20">
      <div className="container-px">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            title={dict.bestSellers.title}
            subtitle={dict.bestSellers.subtitle}
            center={false}
          />
          <Link
            href={`/${locale}/best-sellers`}
            className="btn-outline shrink-0 !py-2.5"
          >
            {dict.actions.viewAll}
            <ArrowRight className="h-4 w-4 flip-rtl" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              dict={dict}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
