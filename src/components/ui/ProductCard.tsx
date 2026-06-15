"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Star, Eye, X, MessageCircle } from "lucide-react";
import type { Product } from "@/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { useStore } from "@/components/providers/StoreProvider";
import { cn, formatPrice, whatsappLink } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({
  product,
  dict,
  locale,
}: {
  product: Product;
  dict: Dictionary;
  locale: Locale;
}) {
  const { toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.id);
  const currency = dict.product.currency;
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;
  const [quickView, setQuickView] = useState(false);

  return (
    <>
    <article className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-square overflow-hidden bg-cream-100">
        <Image
          src={product.image}
          alt={product.name[locale]}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* badges */}
        <div className="absolute start-3 top-3 flex flex-col gap-1.5">
          {product.badges?.includes("bestSeller") && (
            <span className="rounded-full bg-sage-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-soft">
              {dict.product.bestSeller}
            </span>
          )}
          {product.badges?.includes("new") && (
            <span className="rounded-full bg-blossom-400 px-2.5 py-1 text-[10px] font-bold text-white shadow-soft">
              {dict.product.new}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-gold-400 px-2.5 py-1 text-[10px] font-bold text-white shadow-soft">
              {discount}% {dict.product.off}
            </span>
          )}
        </div>

        {/* wishlist */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={dict.common.wishlist}
          aria-pressed={wished}
          className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-sage-700 shadow-soft backdrop-blur transition hover:text-blossom-500"
        >
          <Heart
            className={cn("h-4.5 w-4.5", wished && "fill-blossom-400 text-blossom-400")}
            style={{ height: 18, width: 18 }}
          />
        </button>

        {/* quick view (hover) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-all duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => setQuickView(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white/95 py-2 text-xs font-semibold text-sage-700 shadow-card backdrop-blur transition hover:bg-white"
          >
            <Eye className="h-4 w-4" />
            {dict.actions.quickView}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-ink">
          {product.name[locale]}
        </h3>

        {product.reviewCount > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-ink-soft">
            <Star className="h-3.5 w-3.5 fill-gold-300 text-gold-300" />
            <span className="font-semibold text-ink">{product.rating}</span>
            <span>
              ({product.reviewCount} {dict.product.reviews})
            </span>
          </div>
        )}

        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-sage-700">
              {formatPrice(product.price, currency)}
            </span>
            {product.compareAt && (
              <span className="text-sm text-ink-faint line-through">
                {formatPrice(product.compareAt, currency)}
              </span>
            )}
          </div>
        </div>

        <AddToCartButton
          product={product}
          label={dict.actions.addToCart}
          addedLabel={dict.actions.added}
          className="btn-primary mt-4 w-full !py-2.5 text-xs"
        />
      </div>
    </article>

    {quickView && (
      <QuickView
        product={product}
        dict={dict}
        locale={locale}
        onClose={() => setQuickView(false)}
        wished={wished}
        onToggleWishlist={() => toggleWishlist(product.id)}
      />
    )}
    </>
  );
}

function QuickView({
  product,
  dict,
  locale,
  onClose,
  wished,
  onToggleWishlist,
}: {
  product: Product;
  dict: Dictionary;
  locale: Locale;
  onClose: () => void;
  wished: boolean;
  onToggleWishlist: () => void;
}) {
  const currency = dict.product.currency;
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const variant = product.variants?.find((v) => v.id === variantId);
  const price = product.price + (variant?.priceDelta ?? 0);
  const discount = product.compareAt
    ? Math.round((1 - product.price / product.compareAt) * 100)
    : 0;

  const waMessage = whatsappLink(
    `${product.name[locale]}${variant ? ` (${variant.label[locale]})` : ""} — ${formatPrice(price, currency)}`,
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-cream-50 shadow-card animate-fade-up sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.common.close}
          className="absolute end-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-sage-700 shadow-soft backdrop-blur transition hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-square w-full overflow-hidden bg-cream-100">
          <Image
            src={product.image}
            alt={product.name[locale]}
            fill
            sizes="(max-width: 640px) 100vw, 28rem"
            className="object-cover"
          />
          <div className="absolute start-3 top-3 flex flex-col gap-1.5">
            {product.badges?.includes("bestSeller") && (
              <span className="rounded-full bg-sage-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-soft">
                {dict.product.bestSeller}
              </span>
            )}
            {product.badges?.includes("new") && (
              <span className="rounded-full bg-blossom-400 px-2.5 py-1 text-[10px] font-bold text-white shadow-soft">
                {dict.product.new}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-gold-400 px-2.5 py-1 text-[10px] font-bold text-white shadow-soft">
                {discount}% {dict.product.off}
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-xl font-bold text-ink">
            {product.name[locale]}
          </h3>

          {product.reviewCount > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-xs text-ink-soft">
              <Star className="h-3.5 w-3.5 fill-gold-300 text-gold-300" />
              <span className="font-semibold text-ink">{product.rating}</span>
              <span>
                ({product.reviewCount} {dict.product.reviews})
              </span>
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-sage-700">
              {formatPrice(price, currency)}
            </span>
            {product.compareAt && (
              <span className="text-base text-ink-faint line-through">
                {formatPrice(product.compareAt, currency)}
              </span>
            )}
          </div>

          {!product.inStock && (
            <p className="mt-2 text-sm font-semibold text-blossom-500">
              {dict.product.outOfStock}
            </p>
          )}

          {product.variants && product.variants.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                    variantId === v.id
                      ? "border-sage-500 bg-sage-500 text-white"
                      : "border-cream-300 bg-white text-sage-700 hover:border-sage-400",
                  )}
                >
                  {v.label[locale]}
                  {v.priceDelta ? ` +${formatPrice(v.priceDelta, currency)}` : ""}
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center gap-2">
            <AddToCartButton
              product={product}
              variantId={variantId}
              label={dict.actions.addToCart}
              addedLabel={dict.actions.added}
              className="btn-primary flex-1 justify-center !py-3"
            />
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-label={dict.common.wishlist}
              aria-pressed={wished}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cream-300 bg-white text-sage-700 transition hover:border-blossom-300 hover:text-blossom-500"
            >
              <Heart
                className={cn(wished && "fill-blossom-400 text-blossom-400")}
                style={{ height: 20, width: 20 }}
              />
            </button>
          </div>

          <a
            href={waMessage}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp mt-2.5 w-full"
          >
            <MessageCircle className="h-4 w-4" />
            {dict.actions.whatsapp}
          </a>
        </div>
      </div>
    </div>
  );
}
