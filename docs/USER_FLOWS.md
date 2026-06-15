# Al Malak — User Flow Diagrams

Mermaid diagrams for the core journeys. Render on GitHub or any Mermaid viewer.

---

## 1. Sitemap

```mermaid
graph TD
    Root["/ (redirect by Accept-Language)"] --> Home["/{locale}"]
    Home --> Cat["/{locale}/category/:slug"]
    Home --> PDP["/{locale}/product/:slug"]
    Home --> Custom["/{locale}/customize"]
    Home --> Cart["/{locale}/cart"]
    Cart --> Checkout["/{locale}/checkout"]
    Checkout --> Confirm["/{locale}/order/:number"]
    Home --> Track["/{locale}/track"]
    Home --> Account["/{locale}/account"]
    Account --> Orders["/{locale}/account/orders"]
    Account --> Wishlist["/{locale}/account/wishlist"]
```

---

## 2. Browse → buy (happy path)

```mermaid
flowchart TD
    A[Land on homepage] --> B{Pick language}
    B -->|AR/HE/EN| C[Browse Best Sellers / Categories]
    C --> D[Quick View or open product]
    D --> E{Choose variant}
    E --> F[Add to Cart]
    F --> G{Keep shopping?}
    G -->|Yes| C
    G -->|No| H[Open Cart]
    H --> I[Apply coupon?]
    I --> J[Checkout: contact + address]
    J --> K[Pay securely]
    K --> L[Order confirmed + tracking code]
    L --> M[WhatsApp confirmation]
```

---

## 3. Custom printing flow

```mermaid
flowchart TD
    A[Open Customize section] --> B[Select base product mug/shirt/frame/cushion]
    B --> C[Upload image PNG/JPG ≤5MB]
    C --> D[Add custom text ≤40 chars]
    D --> E[Pick background color]
    E --> F[Live preview updates instantly]
    F --> G{Happy?}
    G -->|No| C
    G -->|Yes| H{Path}
    H -->|Add to cart| I[Custom design saved to order]
    H -->|WhatsApp| J[Prefilled design brief sent to studio]
```

---

## 4. AI Gift Assistant

```mermaid
sequenceDiagram
    participant U as User
    participant W as Assistant UI
    participant API as /api/ai/recommend
    participant C as Claude API
    U->>W: Pick chip or type "graduation gift, ₪200"
    W->>API: { query, locale, budget }
    API->>C: catalogue + request (system-constrained)
    C-->>API: { rationale, productSlugs[] }
    API-->>W: hydrated products + whatsappPrefill
    W-->>U: Show 1–3 matches + rationale
    U->>W: Tap "Order via WhatsApp"
    W->>U: Opens wa.me with prefilled brief
```
> The shipped homepage uses a deterministic on‑device matcher as a fallback when no backend is configured.

---

## 5. Order tracking (no login required)

```mermaid
flowchart LR
    A[Enter tracking code] --> B[GET /api/track/:code]
    B --> C{Found?}
    C -->|No| D[Show not-found + WhatsApp support]
    C -->|Yes| E[Timeline: Paid → Preparing → Out for delivery → Delivered]
```

---

## 6. Auth & guest‑cart merge

```mermaid
flowchart TD
    A[Guest adds items] --> B[Cart stored by sessionId]
    B --> C{Login / Register}
    C --> D[POST /api/cart/merge]
    D --> E[Guest lines merged into user cart]
    E --> F[Continue to checkout]
```

---

## 7. Wishlist

```mermaid
flowchart LR
    A[Tap heart on ProductCard] --> B{Logged in?}
    B -->|Yes| C[POST /api/wishlist]
    B -->|No| D[Save to localStorage]
    D --> E[On login: sync local → server]
    C --> F[Heart filled, badge count++]
```
