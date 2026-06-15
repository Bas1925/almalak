# Al Malak — Component Architecture

Next.js 14 **App Router** with a server‑first model: data‑bearing components render on the server; only islands that need state/effects are `"use client"`.

---

## 1. Route & rendering map

```
src/app/
  [locale]/
    layout.tsx        ← root layout (html/dir/fonts, <StoreProvider>) — Server
    page.tsx          ← homepage composition — Server (async, awaits dictionary)
    not-found.tsx     ← localized 404 — Server
  globals.css
src/middleware.ts     ← locale detection & redirect (Edge)
```

- `generateStaticParams` pre‑renders `/ar`, `/en`, `/he` as static HTML (SSG).
- `generateMetadata` emits per‑locale SEO + `hreflang` alternates.

---

## 2. Component tree

```
HomePage (server)
├─ AnnouncementBar (server)
├─ Header (client) ── LanguageSwitcher (client), useStore()
├─ main
│  ├─ Hero (server)              CTAs → Shop / Customize / WhatsApp
│  ├─ Categories (server)        9 categories + SectionHeading
│  ├─ BestSellers (server)
│  │   └─ ProductCard (client) × n   useStore(): add‑to‑cart, wishlist
│  ├─ WhyChooseUs (server)       4 value props
│  ├─ CustomPrinting (client)    upload + text + color + live preview
│  ├─ AiAssistant (client)       keyword recommender + WhatsApp handoff
│  ├─ Reviews (server)
│  ├─ InstagramGallery (server)
│  └─ Newsletter (client)        email capture
├─ Footer (server)
└─ WhatsAppFab (server)          floating deep link
```

**Server vs client split**

| Server (no JS shipped) | Client (interactive) |
|---|---|
| AnnouncementBar, Hero, Categories, BestSellers (shell), WhyChooseUs, Reviews, InstagramGallery, Footer, WhatsAppFab | Header, LanguageSwitcher, ProductCard, CustomPrinting, AiAssistant, Newsletter, StoreProvider |

---

## 3. State management

`StoreProvider` ([providers/StoreProvider.tsx](../src/components/providers/StoreProvider.tsx)) — a React Context exposing:

```ts
useStore(): {
  cart, wishlist,
  addToCart(product, variantId?), removeFromCart(id),
  toggleWishlist(id), isWishlisted(id),
  cartCount, cartTotal, wishlistCount
}
```

- Persisted to `localStorage` (`almalak.cart`, `almalak.wishlist`) with hydration guard.
- Wraps the whole app in the locale layout so any island can read/write.
- In production this layer is swapped for a server cart synced via the API (see [API_STRUCTURE.md](./API_STRUCTURE.md)); the hook contract stays identical.

---

## 4. i18n layer

```
src/i18n/
  config.ts                 locales, defaultLocale, getDirection(), localeMeta
  dictionaries.ts           getDictionary(locale) — server-only lazy import
  dictionaries/{ar,en,he}.json
```

- `Dictionary` type is **inferred from `ar.json`**, so every locale is structurally type‑checked against Arabic at build time.
- Server components `await getDictionary(locale)` and pass the slice (or whole `dict`) as props.
- Client islands receive the already‑resolved `dict` as a serializable prop (no client‑side i18n runtime).

---

## 5. Data layer (mock → API)

| File | Responsibility |
|---|---|
| [`lib/products.ts`](../src/lib/products.ts) | Catalogue + `getBestSellers()` |
| [`lib/categories.ts`](../src/lib/categories.ts) | 9 categories with icon + image |
| [`lib/utils.ts`](../src/lib/utils.ts) | `cn()`, `whatsappLink()`, `formatPrice()` |
| [`types/index.ts`](../src/types/index.ts) | `Product`, `Category`, `ProductVariant`, `Localized` |

`Localized = Record<Locale, string>` — product names carry all three languages inline; UI picks `name[locale]`.

To go live, replace the imports in `BestSellers`/`Categories` with `fetch()` calls to the documented API. Component props don't change.

---

## 6. Conventions

- **Logical CSS only** (`ps/pe/ms/me/start/end`) for free RTL mirroring.
- One component per file, colocated by domain (`layout/`, `home/`, `ui/`, `providers/`).
- `SectionHeading` is the single shared heading primitive (exported from `Categories.tsx`).
- Icons via `lucide-react`; never inline raw SVG.
- All external links: `target="_blank" rel="noopener noreferrer"`.
