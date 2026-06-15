import type { Category } from "@/types";

/**
 * Storefront categories. Images are sourced from Unsplash (allowed in
 * next.config). Icon names map to lucide-react components in the UI layer.
 */
export const categories: Category[] = [
  {
    slug: "natural-flowers",
    icon: "Flower2",
    image: "/products/flowers-1.jpeg",
  },
  {
    slug: "giveaways",
    icon: "PartyPopper",
    image: "/products/giveaway-3.jpeg",
  },
  {
    slug: "weddings",
    icon: "Gem",
    image: "/products/wedding-5.jpeg",
  },
  {
    slug: "mugs",
    icon: "Coffee",
    image: "/products/mug-1.jpeg",
  },
  {
    slug: "teddy-gifts",
    icon: "Gift",
    image: "/products/teddy-2.jpeg",
  },
  {
    slug: "wooden-frames",
    icon: "Frame",
    image: "/products/frame-1.jpeg",
  },
  {
    slug: "perfumes",
    icon: "SprayCan",
    image: "/products/perfume-1.jpeg",
  },
  {
    slug: "plaques",
    icon: "Award",
    image: "/products/plaque-1.jpeg",
  },
  {
    slug: "school",
    icon: "Backpack",
    image: "/products/school-1.jpeg",
  },
];
