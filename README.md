# الملاك · Al Malak · אל מלאכ — Gifts, Flowers & Printing

A modern, premium, **tri‑lingual** e‑commerce storefront for a gifts, flowers, and personalized‑printing business. Arabic (RTL) · Hebrew (RTL) · English (LTR).

Built with **Next.js 14 (App Router) · TypeScript · Tailwind CSS**. Mobile‑first, SEO‑optimized, accessible, and statically pre‑rendered per language.

![brand](public/brand/logo.jpeg)

---

## ✨ What's built

A complete, working homepage with all requested sections:

1. **Hero** — promo banner + Shop Now / Customize / Order via WhatsApp
2. **Categories** — 9 categories with line icons
3. **Best Sellers** — product cards (image, name, price, rating, Add to Cart, Quick View, wishlist, sale/new badges)
4. **Why Choose Us** — same‑day delivery, secure payments, premium packaging, high quality
5. **Custom Printing** — image upload, custom text, color, **live preview**, WhatsApp handoff
6. **AI Gift Assistant** — describe occasion/budget → instant recommendations + WhatsApp prefill
7. **Customer Reviews** — testimonials with star ratings
8. **Instagram Gallery** — latest customer photos
9. **Newsletter** + rich **Footer** (contact, socials, policies, FAQ)

Plus: sticky header with **language switcher**, search drawer, **cart & wishlist** (persisted to `localStorage`), mobile menu, and a floating WhatsApp button.

### Languages & direction
- Default locale resolved from `Accept-Language`, routed under `/{locale}`.
- `/ar`, `/he` render **RTL**; `/en` renders **LTR** — same layout mirrors automatically via CSS logical properties.
- Per‑locale fonts: Cairo (AR), Heebo (HE), Poppins + Cormorant (EN).

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # set WhatsApp number, Instagram, etc.
npm run dev                  # http://localhost:3000  → redirects to /ar
```

```bash
npm run build && npm start   # production
npm run lint                 # eslint
npx tsc --noEmit             # typecheck
```

Open `/ar`, `/en`, or `/he` to switch language (or use the in‑page globe switcher).

---

## 📁 Project structure

```
src/
  app/[locale]/        layout.tsx · page.tsx · not-found.tsx
  middleware.ts        locale detection & redirect
  i18n/                config.ts · dictionaries.ts · dictionaries/{ar,en,he}.json
  components/
    layout/            Header, Footer, AnnouncementBar, LanguageSwitcher, WhatsAppFab
    home/              Hero, Categories, BestSellers, WhyChooseUs,
                       CustomPrinting, AiAssistant, Reviews, InstagramGallery, Newsletter
    ui/                ProductCard
    providers/         StoreProvider (cart + wishlist)
  lib/                 products.ts · categories.ts · utils.ts
  types/               index.ts
docs/                  design system, DB schema, API, user flows, architecture, plan
```

---

## 📚 Documentation

| Doc | Contents |
|---|---|
| [Design System](docs/DESIGN_SYSTEM.md) | Colors, type, components, motion, a11y, RTL |
| [Component Architecture](docs/COMPONENT_ARCHITECTURE.md) | Server/client split, state, i18n, data layer |
| [Database Schema](docs/DATABASE_SCHEMA.md) | Prisma schema + ERD |
| [API Structure](docs/API_STRUCTURE.md) | REST endpoints, payloads, AI route |
| [User Flows](docs/USER_FLOWS.md) | Mermaid journey diagrams |
| [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) | Phased roadmap to production |

---

## 🔧 Configuration

Set in `.env.local` (see `.env.example`):

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | wa.me deep links (default `972545904020`) |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | Instagram links |
| `NEXT_PUBLIC_SITE_URL` | canonical/OG base URL |
| `DATABASE_URL`, `ANTHROPIC_API_KEY`, … | backend (see API docs) |

---

## 📦 Tech

Next.js 14 · React 18 · TypeScript · Tailwind CSS 3 · lucide-react · clsx + tailwind-merge.

> **Demo data** lives in `src/lib`. The catalogue, cart, AI assistant, and forms are wired to swap to the documented API with no change to component props — see the [implementation plan](docs/IMPLEMENTATION_PLAN.md).

---

© Al Malak Gifts, Flowers & Printing — Kafr Manda. All rights reserved.
