import type { Locale } from "@/i18n/config";

/** A string localized across all three supported languages. */
export type Localized = Record<Locale, string>;

export type CategorySlug =
  | "natural-flowers"
  | "giveaways"
  | "weddings"
  | "mugs"
  | "teddy-gifts"
  | "wooden-frames"
  | "perfumes"
  | "plaques"
  | "school";

export interface Category {
  slug: CategorySlug;
  /** lucide-react icon name resolved in the UI layer */
  icon: string;
  image: string;
}

export interface ProductVariant {
  id: string;
  label: Localized;
  priceDelta: number;
}

export interface Product {
  id: string;
  slug: string;
  name: Localized;
  category: CategorySlug;
  price: number;
  /** original price before discount, if on sale */
  compareAt?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badges?: Array<"new" | "bestSeller">;
  variants?: ProductVariant[];
  inStock: boolean;
}
