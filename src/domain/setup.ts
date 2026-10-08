import { z } from "zod";
import {
  DEFAULT_CHAIR_ID,
  DEFAULT_DESK_ID,
  PRESETS,
  PRODUCTS,
  findProduct,
  type Product,
} from "./catalog";

export const MIN_WEEKS = 1;
export const MAX_WEEKS = 12;
/** Upper bound for any single item, so untrusted input cannot ask for huge loops. */
const MAX_QTY_INPUT = 10;

/**
 * Shape of a setup that comes from outside (share link, browser storage, form).
 * It only checks types and sizes; business rules are applied by normalizeSetup().
 */
export const setupInputSchema = z.object({
  deskId: z.string().max(64),
  chairId: z.string().max(64).nullable(),
  items: z.record(z.string().max(64), z.number().int().min(0).max(MAX_QTY_INPUT)),
  weeks: z.number().int(),
});

export type SetupInput = z.infer<typeof setupInputSchema>;

export interface Setup {
  deskId: string;
  chairId: string | null;
  /** productId -> quantity, for screens, gear and zones. Insertion order = order added. */
  items: Readonly<Record<string, number>>;
  weeks: number;
}

export type PresetId = (typeof PRESETS)[number]["id"];

export const INITIAL_SETUP: Setup = {
  deskId: DEFAULT_DESK_ID,
  chairId: DEFAULT_CHAIR_ID,
  items: {},
  weeks: 4,
};

export type SetupAction =
  | { type: "SELECT_DESK"; id: string }
  | { type: "SELECT_CHAIR"; id: string | null }
  | { type: "ADD_ITEM"; id: string }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "DELETE_ITEM"; id: string }
  | { type: "SET_WEEKS"; weeks: number }
  | { type: "LOAD_PRESET"; id: PresetId }
  | { type: "REPLACE"; setup: Setup }
  | { type: "RESET" };

export function monitorSlots(setup: Pick<Setup, "deskId">): number {
  return findProduct(setup.deskId)?.meta?.monitorSlots ?? 2;
}

export function monitorCount(items: Setup["items"]): number {
  let sum = 0;
  for (const [id, qty] of Object.entries(items)) {
    if (findProduct(id)?.category === "monitor") sum += qty;
  }
  return sum;
}

/** Why one more of this product cannot be added, or null when it can. */
export function addBlockReason(setup: Setup, product: Product): string | null {
  if (!product.available) return "Out of stock";
  const qty = setup.items[product.id] ?? 0;
  if (qty >= product.maxQty) return product.maxQty === 1 ? "Already in your setup" : `Max ${product.maxQty}`;
  if (product.category === "monitor") {
    const slots = monitorSlots(setup);
    if (monitorCount(setup.items) >= slots) {
      return slots < 3 ? `This desk fits ${slots} screens. Pick Standing Desk 140 for 3.` : `This desk fits ${slots} screens.`;
    }
  }
  return null;
}

/** Remove screens, last-added first, until they fit on the desk. */
function trimMonitors(items: Setup["items"], slots: number): Setup["items"] {
  let over = monitorCount(items) - slots;
  if (over <= 0) return items;
  const next: Record<string, number> = { ...items };
  const monitorIds = Object.keys(next)
    .filter((id) => findProduct(id)?.category === "monitor")
    .reverse();
  for (const id of monitorIds) {
    const remove = Math.min(over, next[id]);
    next[id] -= remove;
    over -= remove;
    if (next[id] === 0) delete next[id];
    if (over === 0) break;
  }
  return next;
}

function clampWeeks(weeks: number): number {
  if (!Number.isFinite(weeks)) return INITIAL_SETUP.weeks;
  return Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, Math.round(weeks)));
}

/** The single place where business rules live. Invalid actions return the same state object. */
export function setupReducer(state: Setup, action: SetupAction): Setup {
  switch (action.type) {
    case "SELECT_DESK": {
      const desk = findProduct(action.id);
      if (!desk || desk.category !== "desk" || !desk.available || desk.id === state.deskId) return state;
      return { ...state, deskId: desk.id, items: trimMonitors(state.items, desk.meta?.monitorSlots ?? 2) };
    }
    case "SELECT_CHAIR": {
      if (action.id === null) return state.chairId === null ? state : { ...state, chairId: null };
      const chair = findProduct(action.id);
      if (!chair || chair.category !== "chair" || !chair.available || chair.id === state.chairId) return state;
      return { ...state, chairId: chair.id };
    }
    case "ADD_ITEM": {
      const product = findProduct(action.id);
      if (!product || product.category === "desk" || product.category === "chair") return state;
      if (addBlockReason(state, product)) return state;
      return { ...state, items: { ...state.items, [product.id]: (state.items[product.id] ?? 0) + 1 } };
    }
    case "REMOVE_ITEM": {
      const qty = state.items[action.id] ?? 0;
      if (qty === 0) return state;
      const items: Record<string, number> = { ...state.items };
      if (qty === 1) delete items[action.id];
      else items[action.id] = qty - 1;
      return { ...state, items };
    }
    case "DELETE_ITEM": {
      if (!(action.id in state.items)) return state;
      const items: Record<string, number> = { ...state.items };
      delete items[action.id];
      return { ...state, items };
    }
    case "SET_WEEKS": {
      const weeks = clampWeeks(action.weeks);
      return weeks === state.weeks ? state : { ...state, weeks };
    }
    case "LOAD_PRESET": {
      const preset = PRESETS.find((p) => p.id === action.id);
      if (!preset) return state;
      return normalizeSetup({ ...preset, items: { ...preset.items }, weeks: state.weeks });
    }
    case "REPLACE":
      return normalizeSetup(action.setup);
    case "RESET":
      return { ...INITIAL_SETUP, weeks: INITIAL_SETUP.weeks };
    default: {
      // Compile error here means a new action type is not handled above.
      const unhandled: never = action;
      return unhandled;
    }
  }
}

/**
 * Turn a type-checked but untrusted setup into a valid one by replaying it through the reducer.
 * Unknown ids are dropped, quantities and weeks are clamped, screens are trimmed to the desk.
 */
export function normalizeSetup(input: SetupInput | Setup): Setup {
  let state: Setup = { ...INITIAL_SETUP, items: {} };
  state = setupReducer(state, { type: "SELECT_DESK", id: input.deskId });
  state = setupReducer(state, { type: "SELECT_CHAIR", id: input.chairId });
  for (const [id, qty] of Object.entries(input.items)) {
    const n = Math.min(Math.max(0, Math.floor(qty)), MAX_QTY_INPUT);
    for (let i = 0; i < n; i++) state = setupReducer(state, { type: "ADD_ITEM", id });
  }
  return setupReducer(state, { type: "SET_WEEKS", weeks: input.weeks });
}

export interface LineItem {
  product: Product;
  qty: number;
  lineCents: number;
}

export interface SetupPrice {
  lines: LineItem[];
  weeklyCents: number;
  totalCents: number;
  itemCount: number;
}

/** Everything the UI needs to show a price, computed in one place (integer cents). */
export function priceSetup(setup: Setup): SetupPrice {
  const entries: [string, number][] = [[setup.deskId, 1]];
  if (setup.chairId) entries.push([setup.chairId, 1]);
  entries.push(...Object.entries(setup.items));

  const lines: LineItem[] = [];
  let weeklyCents = 0;
  let itemCount = 0;
  for (const [id, qty] of entries) {
    const product = findProduct(id);
    if (!product || qty <= 0) continue;
    const lineCents = product.pricePerWeekCents * qty;
    lines.push({ product, qty, lineCents });
    weeklyCents += lineCents;
    itemCount += qty;
  }
  return { lines, weeklyCents, totalCents: weeklyCents * setup.weeks, itemCount };
}

/** Products the user can pick from in a tray group. */
export function productsIn(category: Product["category"]): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}
