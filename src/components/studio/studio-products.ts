/** A print area as percentages of the mockup image. */
export interface PrintArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type StudioProductId = "frame" | "bag" | "bottle" | "mug";

export interface StudioProduct {
  id: StudioProductId;
  /** blank product mockup served from /public */
  mockup: string;
  /** mockup width / height — drives the canvas aspect ratio */
  aspect: number;
  /** where the design is allowed, as % of the mockup */
  printArea: PrintArea;
  price: number;
}

/** A studio product with its localized name resolved for the current locale. */
export interface ResolvedStudioProduct extends StudioProduct {
  name: string;
}

/**
 * Editable studio product as shown in the admin panel: a single price plus the
 * name in all three languages. Defaults come from studio-products.ts + the
 * dictionaries; the owner can override them and the values persist.
 */
export interface StudioAdminItem {
  id: StudioProductId;
  price: number;
  name: { ar: string; en: string; he: string };
}

/** The four printable products. Names come from the dictionary (localized). */
export const STUDIO_PRODUCTS: StudioProduct[] = [
  {
    id: "frame",
    mockup: "/products/tpl-frame.jpeg",
    aspect: 600 / 750,
    // fills the white mat to its corners (mat ≈17.5–82.5% wide, 14–86% tall)
    printArea: { left: 17, top: 14, width: 66, height: 72 },
    price: 150,
  },
  {
    id: "bag",
    mockup: "/products/tpl-bag.jpeg",
    aspect: 478 / 800,
    // fills the white panel to its corners (panel ≈18–83% wide, ≈29–85% tall)
    printArea: { left: 18, top: 30, width: 65, height: 55 },
    price: 70,
  },
  {
    id: "bottle",
    mockup: "/products/tpl-bottle.jpeg",
    aspect: 533 / 800,
    // centered on the bottle body (body center ≈ 52%)
    printArea: { left: 38, top: 45, width: 28, height: 38 },
    price: 55,
  },
  {
    id: "mug",
    mockup: "/products/tpl-mug.jpeg",
    aspect: 533 / 800,
    printArea: { left: 31, top: 36, width: 47, height: 35 },
    price: 65,
  },
];
