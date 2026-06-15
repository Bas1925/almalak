"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Trash2,
  MessageCircle,
} from "lucide-react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { Product } from "@/types";
import { useStore } from "@/components/providers/StoreProvider";
import { cn, formatPrice, whatsappLink } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

type Panel = "cart" | "wishlist" | null;

export function Header({
  dict,
  locale,
  products = [],
}: {
  dict: Dictionary;
  locale: Locale;
  products?: Product[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const {
    cart,
    wishlist,
    cartCount,
    cartTotal,
    wishlistCount,
    removeFromCart,
    toggleWishlist,
  } = useStore();
  const base = `/${locale}`;
  const currency = dict.product.currency;

  // Bounce the cart icon whenever an item is added.
  const [cartBounce, setCartBounce] = useState(false);
  const prevCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 500);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  const nav = [
    { href: `${base}`, label: dict.nav.home },
    { href: `${base}#categories`, label: dict.nav.products },
    { href: `${base}#best-sellers`, label: dict.nav.offers },
    { href: `${base}#custom`, label: dict.nav.custom },
    { href: `${base}#footer`, label: dict.nav.contact },
  ];

  const wishlistItems = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as Product[];

  const checkoutMessage = [
    locale === "ar"
      ? "مرحباً، أرغب بطلب المنتجات التالية:"
      : locale === "he"
        ? "שלום, ברצוני להזמין את המוצרים הבאים:"
        : "Hello, I'd like to order the following:",
    ...cart.map(
      (l) =>
        `• ${l.product.name[locale]} ×${l.quantity} — ${formatPrice(
          l.product.price * l.quantity,
          currency,
        )}`,
    ),
    "",
    `${dict.cart.subtotal}: ${formatPrice(cartTotal, currency)}`,
  ].join("\n");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-cream-300/70 bg-cream-50/90 backdrop-blur-md">
      <div className="container-px flex h-20 items-center justify-between gap-4">
        {/* Start: mobile menu + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label={dict.common.menu}
          >
            <Menu className="h-6 w-6 text-sage-700" />
          </button>

          <Link href={base} className="flex items-center gap-2.5">
            <Image
              src="/brand/logo.jpeg"
              alt={dict.brand.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-200"
              priority
            />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-display text-lg font-bold text-sage-700">
                {dict.brand.name}
              </span>
              <span className="text-[11px] font-medium text-blossom-400">
                {dict.brand.tagline}
              </span>
            </span>
          </Link>
        </div>

        {/* Center: desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-white hover:text-sage-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* End: actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            aria-label={dict.actions.search}
            className="rounded-full p-2 text-sage-700 transition hover:bg-white"
          >
            <Search className="h-5 w-5" />
          </button>

          <LanguageSwitcher locale={locale} label={dict.common.language} />

          <IconWithBadge
            label={dict.common.wishlist}
            count={wishlistCount}
            badgeClass="bg-blossom-400"
            onClick={() => setPanel("wishlist")}
          >
            <Heart className="h-5 w-5" />
          </IconWithBadge>

          <IconWithBadge
            label={dict.common.cart}
            count={cartCount}
            badgeClass="bg-sage-500"
            onClick={() => setPanel("cart")}
          >
            <ShoppingBag
              className={cn("h-5 w-5", cartBounce && "animate-cart-bounce")}
            />
          </IconWithBadge>

          <button
            type="button"
            aria-label={dict.common.account}
            className="hidden rounded-full p-2 text-sage-700 transition hover:bg-white sm:block"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search drawer */}
      {searchOpen && (
        <div className="border-t border-cream-300 bg-white animate-fade-in">
          <div className="container-px py-3">
            <div className="flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5">
              <Search className="h-5 w-5 text-ink-faint" />
              <input
                autoFocus
                type="search"
                placeholder={dict.actions.search}
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
              />
            </div>
          </div>
        </div>
      )}
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 w-80 max-w-[85%] bg-cream-50 p-6 shadow-card animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-sage-700">
                {dict.brand.name}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={dict.common.close}
              >
                <X className="h-6 w-6 text-sage-700" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-ink transition hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Cart / Wishlist side drawer */}
      {panel && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setPanel(null)}
          />
          <aside className="absolute inset-y-0 end-0 flex w-96 max-w-[90%] flex-col bg-cream-50 shadow-card animate-fade-in">
            <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-sage-700">
                {panel === "cart" ? (
                  <>
                    <ShoppingBag className="h-5 w-5" /> {dict.cart.title}
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" /> {dict.common.wishlist}
                  </>
                )}
              </h2>
              <button
                type="button"
                onClick={() => setPanel(null)}
                aria-label={dict.common.close}
                className="rounded-full p-1.5 text-sage-700 transition hover:bg-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {/* CART */}
              {panel === "cart" &&
                (cart.length === 0 ? (
                  <EmptyState
                    icon={<ShoppingBag className="h-7 w-7" />}
                    text={dict.cart.empty}
                    cta={dict.actions.shopNow}
                    href={`${base}#best-sellers`}
                    onNavigate={() => setPanel(null)}
                  />
                ) : (
                  cart.map((line) => (
                    <div
                      key={`${line.product.id}-${line.variantId ?? ""}`}
                      className="flex gap-3 rounded-2xl border border-cream-300 bg-white p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={line.product.image}
                          alt={line.product.name[locale]}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {line.product.name[locale]}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-soft">
                          ×{line.quantity}
                        </p>
                        <p className="mt-1 font-display font-bold text-sage-600">
                          {formatPrice(
                            line.product.price * line.quantity,
                            currency,
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(line.product.id)}
                        aria-label={dict.cart.remove}
                        className="self-start rounded-full p-1.5 text-ink-faint transition hover:bg-blossom-50 hover:text-blossom-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ))}

              {/* WISHLIST */}
              {panel === "wishlist" &&
                (wishlistItems.length === 0 ? (
                  <EmptyState
                    icon={<Heart className="h-7 w-7" />}
                    text={
                      locale === "ar"
                        ? "قائمة المفضّلة فارغة"
                        : locale === "he"
                          ? "רשימת המועדפים ריקה"
                          : "Your wishlist is empty"
                    }
                    cta={dict.actions.shopNow}
                    href={`${base}#best-sellers`}
                    onNavigate={() => setPanel(null)}
                  />
                ) : (
                  wishlistItems.map((p) => (
                    <div
                      key={p.id}
                      className="flex gap-3 rounded-2xl border border-cream-300 bg-white p-3"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={p.image}
                          alt={p.name[locale]}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {p.name[locale]}
                        </p>
                        <p className="mt-1 font-display font-bold text-sage-600">
                          {formatPrice(p.price, currency)}
                        </p>
                        <AddToCartButton
                          product={p}
                          label={dict.actions.addToCart}
                          addedLabel={dict.actions.added}
                          icon="plus"
                          className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-sage-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sage-600"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(p.id)}
                        aria-label={dict.cart.remove}
                        className="self-start rounded-full p-1.5 text-ink-faint transition hover:bg-blossom-50 hover:text-blossom-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ))}
            </div>

            {/* Cart footer: subtotal + WhatsApp checkout */}
            {panel === "cart" && cart.length > 0 && (
              <div className="space-y-3 border-t border-cream-300 px-5 py-4">
                <div className="flex items-center justify-between font-semibold text-ink">
                  <span>{dict.cart.subtotal}</span>
                  <span className="font-display text-lg text-sage-700">
                    {formatPrice(cartTotal, currency)}
                  </span>
                </div>
                <a
                  href={whatsappLink(checkoutMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  {dict.cart.checkout}
                </a>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function EmptyState({
  icon,
  text,
  cta,
  href,
  onNavigate,
}: {
  icon: React.ReactNode;
  text: string;
  cta: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sage-50 text-sage-400">
        {icon}
      </span>
      <p className="text-ink-soft">{text}</p>
      <Link href={href} onClick={onNavigate} className="btn-primary">
        {cta}
      </Link>
    </div>
  );
}

function IconWithBadge({
  children,
  label,
  count,
  badgeClass,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  count: number;
  badgeClass: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative rounded-full p-2 text-sage-700 transition hover:bg-white"
    >
      {children}
      {count > 0 && (
        <span
          className={cn(
            "absolute -end-0.5 -top-0.5 flex items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
            badgeClass,
          )}
          style={{ height: 18, minWidth: 18 }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
