# Al Malak — API Structure

REST API served from Next.js Route Handlers under `src/app/api/**`. JSON in/out, cookie session (`NextAuth`) or Bearer token. All list endpoints accept `?locale=ar|en|he` to localize returned content (defaults to `Accept-Language`).

Base URL: `/{locale?}/api` · Content‑Type: `application/json`.

---

## 1. Conventions

- **Auth:** session cookie for the storefront; `Authorization: Bearer <token>` for admin/API clients.
- **Errors:** `{ "error": { "code": "VALIDATION", "message": "...", "fields": {} } }` with proper HTTP status.
- **Pagination:** `?page=1&limit=24` → `{ data: [], meta: { page, limit, total } }`.
- **Money:** integer minor units; client formats.
- **Idempotency:** mutations that create orders accept an `Idempotency-Key` header.

---

## 2. Endpoint reference

### Catalogue
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/products` | List/filter products. Query: `category, q, minPrice, maxPrice, sort(price_asc\|price_desc\|rating\|newest), badge, page, limit` |
| GET | `/api/products/:slug` | Single product with variants, images, reviews |
| GET | `/api/categories` | All categories (localized) |
| GET | `/api/search?q=` | Typeahead product search |

### Cart
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/cart` | Current cart (session or user) |
| POST | `/api/cart/items` | Add `{ variantId, quantity }` |
| PATCH | `/api/cart/items/:id` | Update quantity |
| DELETE | `/api/cart/items/:id` | Remove line |
| POST | `/api/cart/merge` | Merge guest cart into user on login |

### Wishlist
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/wishlist` | User's saved products |
| POST | `/api/wishlist` | Add `{ productId }` |
| DELETE | `/api/wishlist/:productId` | Remove |

### Coupons & checkout
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/coupons/validate` | `{ code, subtotal }` → discount or error |
| POST | `/api/checkout` | Create order from cart `{ contact, address, couponCode?, customDesign? }` |
| POST | `/api/checkout/payment-intent` | Create payment intent (Stripe) |

### Orders & tracking
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/orders` | Auth: user's orders |
| GET | `/api/orders/:number` | Order detail |
| GET | `/api/track/:trackingCode` | **Public** order tracking (no auth) |

### Reviews
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/products/:slug/reviews` | Approved reviews |
| POST | `/api/products/:slug/reviews` | Auth: submit `{ rating, body }` |

### Custom printing
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/uploads` | Multipart image upload → `{ url }` (S3/Cloudinary) |
| POST | `/api/custom-designs` | Persist `{ baseProduct, text, imageUrl, bgColor }` |

### AI Gift Assistant
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/ai/recommend` | `{ query, locale, budget? }` → ranked products + rationale |

### Account & misc
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | Session auth |
| GET/PATCH | `/api/account` | Profile |
| POST | `/api/newsletter` | `{ email, locale }` |
| POST | `/api/contact` | Contact form / WhatsApp lead capture |

---

## 3. Example payloads

**GET `/api/products?category=graduation&locale=he`**
```json
{
  "data": [
    {
      "id": "p-004",
      "slug": "graduation-arrangement",
      "name": "סידור סיום",
      "price": 28000,
      "compareAt": 33000,
      "currency": "ILS",
      "rating": 5,
      "reviewCount": 64,
      "image": "https://.../graduation.jpg",
      "badges": ["bestSeller"],
      "inStock": true
    }
  ],
  "meta": { "page": 1, "limit": 24, "total": 1 }
}
```

**POST `/api/ai/recommend`**
```json
// request
{ "query": "graduation gift for my sister", "locale": "en", "budget": 25000 }

// response
{
  "rationale": "For a graduation under ₪250, a celebratory arrangement plus a keepsake mug works well.",
  "products": [
    { "slug": "graduation-arrangement", "name": "Graduation Arrangement", "price": 28000 },
    { "slug": "personalized-mug", "name": "Personalized Mug", "price": 6500 }
  ],
  "whatsappPrefill": "Hi Al Malak, I'd like a graduation gift around ₪250..."
}
```

---

## 4. AI assistant implementation

Server route proxies the **Claude API** (`claude-sonnet-4-6`) with the catalogue as tool context:

```ts
// src/app/api/ai/recommend/route.ts (sketch)
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { query, locale, budget } = await req.json();
  const catalogue = await getCatalogueForPrompt(); // id, name, price, category, tags
  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: `You are Al Malak's gift concierge. Recommend 1–3 products from the
             provided catalogue only. Respond in ${locale}. Respect the budget.
             Return JSON: { rationale, productSlugs[] }.`,
    messages: [{ role: "user", content: `Catalogue:\n${catalogue}\n\nRequest: ${query}\nBudget: ${budget ?? "any"}` }],
  });
  // parse → hydrate slugs → attach whatsappPrefill
}
```

The current homepage ships a **deterministic on‑device fallback** ([`AiAssistant.tsx`](../src/components/home/AiAssistant.tsx) `recommend()`) so the feature is demoable with zero backend; swap to this route in production.

---

## 5. Security & rate limiting

- Validate every body with **Zod**; reject unknown fields.
- Rate‑limit `/api/ai/*`, `/api/contact`, `/api/newsletter`, `/api/auth/*` (e.g. Upstash Ratelimit).
- Signed, size‑limited uploads (≤5 MB, png/jpg) with content‑type sniffing.
- Coupons validated server‑side only; never trust client‑computed totals.
- CSRF protection on cookie‑auth mutations; CORS locked to the storefront origin.
