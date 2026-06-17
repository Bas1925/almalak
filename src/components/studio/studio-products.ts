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

/** The four printable products. Names come from the dictionary (localized). */
export const STUDIO_PRODUCTS: StudioProduct[] = [
  {
    id: "frame",
    mockup: "/products/tpl-frame.jpeg",
    aspect: 600 / 750,
    printArea: { left: 14, top: 11, width: 72, height: 78 },
    price: 150,
  },
  {
    id: "bag",
    mockup: "/products/tpl-bag.jpeg",
    aspect: 478 / 800,
    printArea: { left: 16, top: 31, width: 68, height: 49 },
    price: 70,
  },
  {
    id: "bottle",
    mockup: "/products/tpl-bottle.jpeg",
    aspect: 533 / 800,
    printArea: { left: 37, top: 44, width: 29, height: 39 },
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
