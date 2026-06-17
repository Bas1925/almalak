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
    printArea: { left: 17, top: 14, width: 66, height: 72 },
    price: 150,
  },
  {
    id: "bag",
    mockup: "/products/tpl-bag.jpeg",
    aspect: 478 / 800,
    printArea: { left: 19, top: 34, width: 63, height: 43 },
    price: 70,
  },
  {
    id: "bottle",
    mockup: "/products/tpl-bottle.jpeg",
    aspect: 533 / 800,
    printArea: { left: 41, top: 47, width: 22, height: 31 },
    price: 55,
  },
  {
    id: "mug",
    mockup: "/products/tpl-mug.jpeg",
    aspect: 533 / 800,
    printArea: { left: 35, top: 40, width: 41, height: 28 },
    price: 65,
  },
];
