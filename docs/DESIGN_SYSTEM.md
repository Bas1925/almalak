# Al Malak — Design System

A premium, soft‑luxury system derived from the brand logo: sage/olive green, blossom pink, warm cream, and champagne gold. Mobile‑first, fully responsive, and tri‑directional (Arabic RTL, Hebrew RTL, English LTR).

---

## 1. Brand foundations

| Token | Value | Usage |
|---|---|---|
| Primary | **Sage 500** `#6F8049` | Buttons, headings, primary actions |
| Accent | **Blossom 400** `#E67D9C` | Highlights, badges, secondary CTAs |
| Highlight | **Gold 400** `#C9A24A` | Dividers, sale badges, premium accents |
| Surface | **Cream 100** `#FAF6EF` | Page background |
| Ink | `#2C2A26` / soft `#6B6760` / faint `#9C978D` | Text hierarchy |

### Full palette (Tailwind scale)
Defined in [`tailwind.config.ts`](../tailwind.config.ts) — each hue ships a 50→900 ramp:
`cream` (50–300), `sage` (50–900), `blossom` (50–700), `gold` (50–500), `ink`.

> WhatsApp green `#25D366` is reserved exclusively for WhatsApp actions.

---

## 2. Typography

Fonts load via Google Fonts and are swapped per locale through CSS variables in [`[locale]/layout.tsx`](../src/app/%5Blocale%5D/layout.tsx).

| Locale | Body (`--font-sans`) | Display (`--font-display`) |
|---|---|---|
| Arabic | **Cairo** | Cairo |
| Hebrew | **Heebo** | Heebo |
| English | **Poppins** | **Cormorant Garamond** |

### Type scale
| Role | Class | Size |
|---|---|---|
| Hero | `font-display text-4xl→6xl font-bold` | 36–60px |
| Section title | `.section-title` | 30–36px |
| Card title | `font-semibold text-base` | 16px |
| Body | `text-base text-ink-soft` | 16px |
| Caption | `text-xs` | 12px |
| Eyebrow | `.eyebrow` (uppercase, tracked) | 12px |

---

## 3. Spacing, radius & elevation

- **Grid:** `container-px` = centered, `max-w-7xl`, responsive padding (16 → 32px).
- **Section rhythm:** `py-16 lg:py-20`.
- **Radius:** cards `rounded-3xl`, pills/buttons `rounded-full`, hero media `rounded-[2.5rem]`.
- **Shadows:** `shadow-soft` (resting), `shadow-card` (hover/raised), `shadow-glow` (gold focus).

---

## 4. Components (utility recipes)

Defined as `@layer components` in [`globals.css`](../src/app/globals.css):

| Class | Description |
|---|---|
| `.btn-primary` | Sage pill, white text, lifts on hover |
| `.btn-accent` | Blossom pill |
| `.btn-outline` | Bordered, glass background |
| `.btn-whatsapp` | WhatsApp‑green pill |
| `.card` | White, rounded‑3xl, soft border + shadow |
| `.eyebrow` | Pill label above section titles |
| `.section-title` | Display heading |
| `.gold-divider` | Hairline gold gradient rule |

### States
- **Hover:** `-translate-y-1` + `shadow-card` on cards; color shift on buttons.
- **Focus:** visible 2px ring (`focus-visible:ring-*`) with offset — keyboard accessible.
- **Disabled:** `opacity-60`.

---

## 5. Direction & i18n (RTL/LTR)

- Direction is set on `<html dir>` from [`getDirection()`](../src/i18n/config.ts) — `rtl` for `ar`/`he`, `ltr` for `en`.
- **Logical properties everywhere:** `ps-/pe-`, `ms-/me-`, `start-/end-` instead of left/right, so a single layout mirrors automatically.
- Directional icons (arrows, quotes, send) use the `.flip-rtl` helper to mirror in RTL.
- Numerals and phone numbers are wrapped with `dir="ltr"` where needed.

---

## 6. Motion

Keyframes in Tailwind config: `fade-up`, `fade-in`, `float`, `marquee`.
- Section entrances: `animate-fade-up` / `animate-fade-in`.
- Hero badge: gentle `animate-float`.
- WhatsApp FAB: `animate-ping` halo.
- All transitions 300–500ms, `cubic-bezier(0.16,1,0.3,1)` for natural easing.

---

## 7. Accessibility

- WCAG AA contrast for text on cream/sage surfaces.
- All interactive elements are real `<button>`/`<a>` with `aria-label`s.
- Language menu is a labelled `listbox` with `aria-selected`.
- Wishlist toggle exposes `aria-pressed`.
- Visible focus rings; respects keyboard navigation; `::selection` styled.
- Images carry localized `alt` text.

---

## 8. Iconography & imagery

- **Icons:** [lucide-react](https://lucide.dev) — 1.6 stroke weight for an elegant, thin‑line look.
- **Photography:** bright, airy product shots on neutral backgrounds; consistent 1:1 (product) and 4:5 (hero) ratios; subtle gradient overlays for text legibility.
