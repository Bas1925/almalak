# Al Malak — Production Implementation Plan

A phased roadmap from the current homepage scaffold to a production storefront.

**Current status (Phase 0 — done):** Next.js 14 + TS + Tailwind project; tri‑lingual (AR/HE RTL, EN LTR) homepage with all 9 sections; design system; cart/wishlist store (localStorage); custom‑printing live preview; on‑device AI recommender; SEO metadata + hreflang; static prerender of all three locales; passing `tsc` + `next build`.

---

## Phase 1 — Backend foundation (Week 1–2)
- Provision **PostgreSQL** (Neon/Supabase/RDS). Add Prisma; migrate [schema](./DATABASE_SCHEMA.md); seed categories + products (port `lib/*`).
- Build catalogue endpoints: `GET /api/products`, `/api/products/:slug`, `/api/categories`, `/api/search`.
- Replace mock imports in `BestSellers`/`Categories` with server `fetch` (props unchanged).
- Add product‑listing (`/category/:slug`) and product‑detail (`/product/:slug`) routes with filtering/sort.
- **Exit:** real data renders; filtering, sorting, search work.

## Phase 2 — Commerce core (Week 2–4)
- Server **cart** (guest `sessionId` + user) and `cart/merge`; keep `useStore` hook contract, back it with the API.
- **Wishlist** persistence + login sync.
- **Coupons**: validate endpoint + cart UI.
- **Checkout**: contact/address forms (Zod validated), order creation, `Idempotency-Key`.
- **Payments**: Stripe (or local gateway) payment intents + webhook → `Order.status = PAID`.
- **Exit:** a real order can be placed and paid.

## Phase 3 — Accounts, orders, tracking (Week 4–5)
- **Auth** via NextAuth (email/password + OTP/phone optional). Account dashboard: profile, addresses, orders, wishlist.
- **Order tracking** page consuming public `/api/track/:code` with status timeline.
- Transactional email/WhatsApp confirmations.
- **Exit:** full post‑purchase journey.

## Phase 4 — Personalization & content (Week 5–6)
- **Custom printing**: signed uploads (S3/Cloudinary), persist `CustomDesign`, attach to order; admin sees the brief.
- **AI assistant**: implement `/api/ai/recommend` against Claude (`claude-sonnet-4-6`), constrained to catalogue; rate‑limited. Keep on‑device fallback.
- **Reviews**: submission + moderation; recompute `Product.rating`.
- **Newsletter**: persist subscribers, integrate ESP (Mailchimp/Resend).
- **Exit:** all "advanced features" live.

## Phase 5 — Admin & operations (Week 6–7)
- Admin panel (protected `ADMIN/STAFF`): products, categories, orders, coupons, reviews moderation, custom‑design queue.
- Inventory/stock decrement on paid orders.
- Basic analytics dashboard (orders, revenue, top products).

## Phase 6 — Hardening & launch (Week 7–8)
- **Performance:** `next/image` everywhere, route‑level caching/ISR, bundle audit, Lighthouse ≥ 90 mobile.
- **SEO:** `sitemap.xml`, `robots.txt`, JSON‑LD (`Product`, `BreadcrumbList`, `Organization`), per‑locale OG images.
- **A11y:** axe/Lighthouse audit, keyboard + screen‑reader pass for RTL & LTR.
- **Security:** rate limits, CSRF, input validation, secret rotation, dependency audit (`npm audit`), upgrade Next to latest patched release.
- **Observability:** Sentry + analytics (Plausible/GA4) + uptime checks.
- **CI/CD:** GitHub Actions (lint, typecheck, build, e2e) → Vercel preview → production.
- **Exit:** launch.

---

## Testing strategy
| Layer | Tooling |
|---|---|
| Unit | Vitest (utils, recommender, price/coupon logic) |
| Component | React Testing Library |
| E2E | Playwright — browse→checkout, custom design, tracking, **RTL/LTR in all 3 locales** |
| Visual | Playwright screenshots / Chromatic |
| a11y | axe-core in CI |

## Tech stack summary
| Concern | Choice |
|---|---|
| Framework | Next.js 14 App Router, React 18, TypeScript |
| Styling | Tailwind CSS 3, lucide-react |
| i18n | Custom `[locale]` segment + typed JSON dictionaries |
| DB / ORM | PostgreSQL + Prisma |
| Auth | NextAuth |
| Payments | Stripe (+ local gateway option) |
| Media | S3 or Cloudinary |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Email | Resend / Mailchimp |
| Hosting | Vercel (Edge middleware for locale routing) |
| Monitoring | Sentry, Plausible/GA4 |

## Risks & mitigations
- **RTL/LTR regressions** → logical CSS only; Playwright matrix across locales.
- **Multilingual content drift** → `Dictionary` type inferred from `ar.json` enforces parity at build.
- **AI cost/latency/hallucination** → cache, rate‑limit, constrain to catalogue, deterministic fallback.
- **Coupon/price tampering** → all totals computed server‑side.
- **Next.js security advisories** → pin patched releases; automated `npm audit` in CI.

## Definition of done (launch)
Real catalogue · working cart→checkout→payment · accounts + order tracking · custom printing persisted · AI assistant live with fallback · reviews moderated · admin panel · Lighthouse ≥ 90 (perf/SEO/a11y) mobile · all three languages verified · CI green.
