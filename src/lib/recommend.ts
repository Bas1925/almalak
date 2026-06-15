import type { Product, CategorySlug } from "@/types";

/**
 * On-device gift recommender. It reads the full local catalogue and scores
 * every in-stock product against the shopper's free-text request — detecting
 * the occasion / recipient (mapped to one or more categories), a budget
 * ceiling, and price sentiment (luxury vs. economical) — then ranks by
 * relevance, budget fit, rating and popularity.
 *
 * It works fully offline and in Arabic, English and Hebrew. In production the
 * same contract is served by POST /api/ai/recommend (see docs/API_STRUCTURE.md),
 * which proxies the Claude API for natural-language answers.
 */

export interface GiftReasons {
  catMatch: boolean;
  inBudget: boolean;
  topRated: boolean;
  bestSeller: boolean;
}

export interface GiftSuggestion {
  product: Product;
  reasons: GiftReasons;
}

export interface RecommendResult {
  suggestions: GiftSuggestion[];
  /** categories inferred from the request, ordered by confidence */
  categories: CategorySlug[];
  /** budget ceiling parsed from the request, if any */
  budgetMax: number | null;
  /** true when we matched an explicit intent or budget (vs. a generic fallback) */
  exact: boolean;
}

/** Normalise text so matching is robust across spelling and Arabic diacritics. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, "") // Arabic tashkeel
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type Weighted = Array<[CategorySlug, number]>;

/**
 * Keyword → category rules. Direct category words carry the most weight;
 * occasion and recipient words spread lighter weight across the categories
 * that suit them, so e.g. "gift for my mother" leans perfumes + flowers.
 */
const RULES: Array<{ keys: string[]; cats: Weighted }> = [
  // ── direct categories ──────────────────────────────────────────────
  {
    keys: ["ورد", "ورده", "زهور", "بوكيه", "باقه", "flower", "flowers", "rose", "roses", "bouquet", "floral", "פרח", "פרחים", "זר", "ורד"],
    cats: [["natural-flowers", 3]],
  },
  {
    keys: ["عطر", "عطور", "perfume", "perfumes", "fragrance", "cologne", "scent", "בושם", "בשמים"],
    cats: [["perfumes", 3]],
  },
  {
    keys: ["كوب", "كباية", "اكواب", "مج", "mug", "mugs", "cup", "ספל", "ספלים", "printed", "طباعه", "مطبوع"],
    cats: [["mugs", 3]],
  },
  {
    keys: ["برواز", "براويز", "frame", "frames", "wooden", "خشب", "خشبي", "מסגרת", "מסגרות"],
    cats: [["wooden-frames", 3]],
  },
  {
    keys: ["دبدوب", "دباديب", "دب", "teddy", "bear", "plush", "דובי", "דובון"],
    cats: [["teddy-gifts", 3]],
  },
  {
    keys: ["توزيعات", "توزيعه", "favor", "favors", "favour", "favours", "giveaway", "giveaways", "מזכרת", "מזכרות"],
    cats: [["giveaways", 3]],
  },
  {
    keys: ["درع", "دروع", "شهاده", "شهادات", "plaque", "plaques", "trophy", "award", "certificate", "מגן", "תעודה"],
    cats: [["plaques", 3]],
  },
  {
    keys: ["مدرسه", "مدرسي", "قرطاسيه", "حقيبه", "school", "backpack", "stationery", "pencil", "תיק", "בית ספר", "ציוד"],
    cats: [["school", 3]],
  },
  {
    keys: ["عرس", "اعراس", "زواج", "زفاف", "خطوبه", "عقد قران", "عروس", "عريس", "عروسين", "wedding", "weddings", "engagement", "bride", "groom", "marriage", "חתונה", "אירוסין", "כלה", "חתן"],
    cats: [["weddings", 3]],
  },

  // ── occasions ──────────────────────────────────────────────────────
  {
    keys: ["عيد ميلاد", "ميلاد", "birthday", "יום הולדת"],
    cats: [["natural-flowers", 2], ["teddy-gifts", 1.5], ["mugs", 1]],
  },
  {
    keys: ["تخرج", "خريج", "خريجه", "graduation", "graduate", "סיום", "בוגר"],
    cats: [["natural-flowers", 2], ["plaques", 1.5]],
  },
  {
    keys: ["مولود", "ولاده", "بيبي", "newborn", "baby", "לידה", "תינוק"],
    cats: [["teddy-gifts", 2.5], ["natural-flowers", 1]],
  },
  {
    keys: ["حب", "فالنتاين", "رومانسي", "valentine", "love", "romantic", "anniversary", "אהבה", "ולנטיין"],
    cats: [["natural-flowers", 2.5], ["teddy-gifts", 2], ["perfumes", 1.5]],
  },
  {
    keys: ["شكر", "تقدير", "thank", "thanks", "appreciation", "תודה", "הוקרה"],
    cats: [["plaques", 2], ["mugs", 1], ["natural-flowers", 1]],
  },

  // ── recipients ─────────────────────────────────────────────────────
  {
    keys: ["معلم", "معلمه", "استاذ", "استاذه", "teacher", "מורה"],
    cats: [["plaques", 2], ["mugs", 1.5], ["perfumes", 1]],
  },
  {
    keys: ["شركه", "شركات", "مدير", "زميل", "عمل", "corporate", "company", "boss", "colleague", "client", "עסק", "עבודה"],
    cats: [["plaques", 2], ["perfumes", 1.5], ["mugs", 1]],
  },
  {
    keys: ["امي", "ام", "والده", "عيد الام", "mother", "mom", "mum", "אמא", "אם"],
    cats: [["perfumes", 2], ["natural-flowers", 2]],
  },
  {
    keys: ["ابي", "اب", "والد", "father", "dad", "אבא"],
    cats: [["perfumes", 2], ["mugs", 1], ["plaques", 1]],
  },
  {
    keys: ["زوجه", "زوجتي", "wife", "אישה"],
    cats: [["perfumes", 2], ["natural-flowers", 2], ["teddy-gifts", 1]],
  },
  {
    keys: ["زوج", "زوجي", "husband", "בעל"],
    cats: [["perfumes", 2], ["mugs", 1]],
  },
  {
    keys: ["صديق", "صديقه", "صاحبي", "friend", "חבר", "חברה"],
    cats: [["mugs", 1.5], ["teddy-gifts", 1.5], ["natural-flowers", 1]],
  },
  {
    keys: ["طالب", "طالبه", "student", "תלמיד", "סטודנט"],
    cats: [["school", 2], ["mugs", 1]],
  },
];

const LUXURY_KEYS = ["فاخر", "فخم", "غالي", "راقي", "luxury", "premium", "deluxe", "expensive", "יוקרתי", "יוקרה"];
const CHEAP_KEYS = ["رخيص", "اقتصادي", "بسيط", "cheap", "budget", "affordable", "cheapest", "זול", "חסכוני"];

function parseBudget(raw: string): number | null {
  const nums = (raw.match(/\d+/g) || []).map(Number).filter((n) => n >= 10 && n <= 100000);
  if (!nums.length) return null;
  return Math.max(...nums);
}

export function recommendGifts(rawQuery: string, products: Product[]): RecommendResult {
  const q = normalize(rawQuery);

  // 1. infer categories
  const catScore: Partial<Record<CategorySlug, number>> = {};
  for (const rule of RULES) {
    if (rule.keys.some((k) => q.includes(normalize(k)))) {
      for (const [cat, w] of rule.cats) {
        catScore[cat] = (catScore[cat] ?? 0) + w;
      }
    }
  }
  const detectedCats = (Object.keys(catScore) as CategorySlug[]).sort(
    (a, b) => (catScore[b] ?? 0) - (catScore[a] ?? 0),
  );
  const hasIntent = detectedCats.length > 0;

  // 2. budget + price sentiment
  const budgetMax = parseBudget(rawQuery);
  const wantLuxury = LUXURY_KEYS.some((k) => q.includes(normalize(k)));
  const wantCheap = CHEAP_KEYS.some((k) => q.includes(normalize(k)));

  // 3. candidate pool — respect budget when it still leaves enough choice
  const inStock = products.filter((p) => p.inStock);
  const inBudget = budgetMax ? inStock.filter((p) => p.price <= budgetMax) : inStock;
  const pool = inBudget.length >= 2 ? inBudget : inStock;

  const scoreOf = (p: Product): number => {
    let s = 0;
    s += (catScore[p.category] ?? 0) * 4; // relevance dominates
    if (budgetMax) {
      if (p.price <= budgetMax) s += 2 + (p.price / budgetMax) * 3; // use the budget well
      else s -= 6;
    }
    s += p.rating; // ~4.5–5
    if (p.badges?.includes("bestSeller")) s += 1.5;
    s += Math.min(p.reviewCount, 200) / 200; // popularity, up to +1
    if (wantLuxury) s += p.price / 100;
    if (wantCheap) s += (300 - Math.min(p.price, 300)) / 100;
    return s;
  };

  let ranked = [...pool].sort((a, b) => scoreOf(b) - scoreOf(a));

  // when we understood an intent, keep the picks on-theme if we can
  if (hasIntent) {
    const onTheme = ranked.filter((p) => detectedCats.includes(p.category));
    if (onTheme.length >= 3) ranked = onTheme;
  }

  const suggestions: GiftSuggestion[] = ranked.slice(0, 4).map((p) => ({
    product: p,
    reasons: {
      catMatch: detectedCats.includes(p.category),
      inBudget: budgetMax != null && p.price <= budgetMax,
      topRated: p.rating >= 4.8,
      bestSeller: !!p.badges?.includes("bestSeller"),
    },
  }));

  return {
    suggestions,
    categories: detectedCats,
    budgetMax,
    exact: hasIntent || budgetMax != null,
  };
}
