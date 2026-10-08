// Catalog for the workspace builder.
// Prices are per week in USD cents, taken from https://www.monis.rent/ on 8 Oct 2026.
// Items marked `samplePrice: true` are not on monis.rent yet; their price must be confirmed by the client.

export type Category = "desk" | "chair" | "monitor" | "gear" | "zone";

export type ArtKey =
  | "desk-standing"
  | "desk-teak"
  | "chair-ergo"
  | "chair-task"
  | "chair-rattan"
  | "monitor"
  | "monitor-studio"
  | "keyboard"
  | "mouse"
  | "laptop-stand"
  | "webcam"
  | "lamp"
  | "riser"
  | "plant-desk"
  | "plant-floor"
  | "coffee"
  | "purifier";

export interface Product {
  id: string;
  name: string;
  category: Category;
  pricePerWeekCents: number;
  originalPerWeekCents?: number;
  highlight: string;
  art: ArtKey;
  maxQty: number;
  available: boolean;
  samplePrice?: boolean;
  sourceUrl?: string;
  meta?: {
    widthCm?: number;
    /** Desk only: how many monitors fit on it. */
    monitorSlots?: number;
    /** Monitor only: drawn screen width in scene units. */
    screenWidth?: number;
    /** Monitor only: short label drawn on the screen. */
    screenLabel?: string;
  };
}

const MONIS = "https://www.monis.rent/";

export const PRODUCTS: readonly Product[] = [
  // Desks
  {
    id: "desk-120",
    name: "Standing Desk 120",
    category: "desk",
    pricePerWeekCents: 600,
    originalPerWeekCents: 900,
    highlight: "Electric, 70–118 cm height",
    art: "desk-standing",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
    meta: { widthCm: 120, monitorSlots: 2 },
  },
  {
    id: "desk-140",
    name: "Standing Desk 140",
    category: "desk",
    pricePerWeekCents: 750,
    highlight: "Wide top, fits 3 screens",
    art: "desk-standing",
    maxQty: 1,
    available: true,
    samplePrice: true,
    sourceUrl: MONIS,
    meta: { widthCm: 140, monitorSlots: 3 },
  },
  {
    id: "desk-teak",
    name: "Teak Writing Desk",
    category: "desk",
    pricePerWeekCents: 500,
    highlight: "Solid teak, two drawers",
    art: "desk-teak",
    maxQty: 1,
    available: true,
    samplePrice: true,
    meta: { widthCm: 110, monitorSlots: 2 },
  },

  // Chairs
  {
    id: "chair-ergo",
    name: "Ergonomic Chair",
    category: "chair",
    pricePerWeekCents: 600,
    originalPerWeekCents: 900,
    highlight: "Mesh back, 4D armrests",
    art: "chair-ergo",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "chair-task",
    name: "Task Chair",
    category: "chair",
    pricePerWeekCents: 350,
    highlight: "Compact, height adjust",
    art: "chair-task",
    maxQty: 1,
    available: true,
    samplePrice: true,
  },
  {
    id: "chair-rattan",
    name: "Rattan Chair",
    category: "chair",
    pricePerWeekCents: 400,
    highlight: "Hand-woven in Bali",
    art: "chair-rattan",
    maxQty: 1,
    available: true,
    samplePrice: true,
  },

  // Monitors
  {
    id: "mon-24",
    name: '24" Full HD Monitor',
    category: "monitor",
    pricePerWeekCents: 650,
    highlight: "144 Hz, IPS",
    art: "monitor",
    maxQty: 3,
    available: true,
    sourceUrl: MONIS,
    meta: { screenWidth: 168, screenLabel: "FHD" },
  },
  {
    id: "mon-27",
    name: '27" Full HD Monitor',
    category: "monitor",
    pricePerWeekCents: 800,
    highlight: "100 Hz, VESA mount",
    art: "monitor",
    maxQty: 3,
    available: true,
    sourceUrl: MONIS,
    meta: { screenWidth: 190, screenLabel: "FHD" },
  },
  {
    id: "mon-27-4k",
    name: '27" 4K Monitor',
    category: "monitor",
    pricePerWeekCents: 1200,
    originalPerWeekCents: 1600,
    highlight: "USB-C, HDR, 95% DCI-P3",
    art: "monitor",
    maxQty: 3,
    available: true,
    sourceUrl: MONIS,
    meta: { screenWidth: 190, screenLabel: "4K" },
  },
  {
    id: "mon-studio",
    name: "Apple Studio Display 5K",
    category: "monitor",
    pricePerWeekCents: 7900,
    highlight: "27″ 5K Retina, 12MP camera",
    art: "monitor-studio",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
    meta: { screenWidth: 206, screenLabel: "5K" },
  },

  // Gear on the desk
  {
    id: "keyboard-mx",
    name: "Logitech MX Keyboard",
    category: "gear",
    pricePerWeekCents: 600,
    originalPerWeekCents: 800,
    highlight: "Wireless, 3 devices",
    art: "keyboard",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "mouse-mx",
    name: "MX Master Mouse",
    category: "gear",
    pricePerWeekCents: 300,
    originalPerWeekCents: 400,
    highlight: "8,000 DPI, 70-day battery",
    art: "mouse",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "laptop-stand",
    name: "Laptop Stand",
    category: "gear",
    pricePerWeekCents: 200,
    originalPerWeekCents: 300,
    highlight: "Fits 10–17″ laptops",
    art: "laptop-stand",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "webcam-4k",
    name: "Logitech 4K Webcam",
    category: "gear",
    pricePerWeekCents: 600,
    highlight: "Brio 4K, noise cancel mic",
    art: "webcam",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "lamp-1s",
    name: "Smart LED Desk Lamp",
    category: "gear",
    pricePerWeekCents: 300,
    originalPerWeekCents: 400,
    highlight: "2600–5000 K, voice control",
    art: "lamp",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "monitor-riser",
    name: "Monitor Riser",
    category: "gear",
    pricePerWeekCents: 200,
    highlight: "11–18 cm, holds 15 kg",
    art: "riser",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "plant-desk",
    name: "Desk Plant",
    category: "gear",
    pricePerWeekCents: 150,
    highlight: "Small pothos in a clay pot",
    art: "plant-desk",
    maxQty: 1,
    available: true,
    samplePrice: true,
  },

  // Zones
  {
    id: "coffee-essenza",
    name: "Nespresso Essenza",
    category: "zone",
    pricePerWeekCents: 700,
    originalPerWeekCents: 900,
    highlight: "19 bar, 25 s heat-up",
    art: "coffee",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "purifier-elite",
    name: "Air Purifier Elite",
    category: "zone",
    pricePerWeekCents: 1400,
    highlight: "Up to 125 m², 20 dB sleep mode",
    art: "purifier",
    maxQty: 1,
    available: true,
    sourceUrl: MONIS,
  },
  {
    id: "plant-floor",
    name: "Monstera",
    category: "zone",
    pricePerWeekCents: 300,
    highlight: "Big leaves, big mood",
    art: "plant-floor",
    maxQty: 1,
    available: true,
    samplePrice: true,
  },
];

const productMap: ReadonlyMap<string, Product> = new Map(PRODUCTS.map((p) => [p.id, p]));

/** Look up a product by id. Returns undefined for ids that are not in the catalog. */
export function findProduct(id: string): Product | undefined {
  return productMap.get(id);
}

/**
 * Index for ids that are known to exist (catalog constants, presets, tests).
 * Use findProduct() for ids that come from users, URLs or storage.
 */
export const PRODUCT_BY_ID: Readonly<Record<string, Product>> = Object.fromEntries(productMap);

export const DEFAULT_DESK_ID = "desk-120";
export const DEFAULT_CHAIR_ID = "chair-ergo";

export interface Preset {
  id: string;
  name: string;
  note: string;
  deskId: string;
  chairId: string | null;
  items: Readonly<Record<string, number>>;
}

export const PRESETS = [
  {
    id: "essentials",
    name: "The Essentials",
    note: "Desk and chair. Start here.",
    deskId: "desk-120",
    chairId: "chair-ergo",
    items: {},
  },
  {
    id: "founders",
    name: "The Founders Setup",
    note: "4K screen, MX keys, laptop stand",
    deskId: "desk-120",
    chairId: "chair-ergo",
    items: { "mon-27-4k": 1, "keyboard-mx": 1, "mouse-mx": 1, "laptop-stand": 1, "lamp-1s": 1 },
  },
  {
    id: "trader",
    name: "The Trading Setup",
    note: "Three screens on a wide desk",
    deskId: "desk-140",
    chairId: "chair-ergo",
    items: { "mon-27": 3, "keyboard-mx": 1, "mouse-mx": 1, "monitor-riser": 1 },
  },
  {
    id: "creator",
    name: "The Creator Setup",
    note: "5K display, webcam, coffee",
    deskId: "desk-teak",
    chairId: "chair-rattan",
    items: {
      "mon-studio": 1,
      "webcam-4k": 1,
      "lamp-1s": 1,
      "plant-desk": 1,
      "coffee-essenza": 1,
      "plant-floor": 1,
    },
  },
] as const satisfies readonly Preset[];
