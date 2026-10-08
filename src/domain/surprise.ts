import { PRODUCTS, type Product } from "./catalog";
import { addBlockReason, normalizeSetup, priceSetup, setupReducer, type Setup } from "./setup";

export const SURPRISE_BUDGETS_CENTS = [2500, 4000, 6000, 10000] as const;

interface SurpriseOptions {
  /** Highest weekly total in cents. */
  budgetCents: number;
  weeks: number;
  /** Returns a number in [0, 1). Injected so tests are repeatable. */
  random: () => number;
}

function pick<T>(list: readonly T[], random: () => number): T | undefined {
  return list.at(Math.floor(random() * list.length));
}

/** Fisher-Yates shuffle on a copy. A sort() with a random comparator is biased. */
function shuffle<T>(list: readonly T[], random: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const cheapest = (list: Product[]) => list.reduce((a, b) => (b.pricePerWeekCents < a.pricePerWeekCents ? b : a));

/**
 * Build a random but valid setup within a weekly budget: a desk, a chair, at least one screen
 * when it fits, then random gear and zones until nothing else fits.
 */
export function surpriseSetup({ budgetCents, weeks, random }: SurpriseOptions): Setup {
  const available = PRODUCTS.filter((p) => p.available);
  const desks = available.filter((p) => p.category === "desk");
  const chairs = available.filter((p) => p.category === "chair");

  // Desk and chair: random pair that fits, else the cheapest pair.
  const pairs = desks.flatMap((d) => chairs.map((c) => [d, c] as const));
  const affordable = pairs.filter(([d, c]) => d.pricePerWeekCents + c.pricePerWeekCents <= budgetCents);
  const [desk, chair] = pick(affordable, random) ?? [cheapest(desks), cheapest(chairs)];

  let setup = normalizeSetup({ deskId: desk.id, chairId: chair.id, items: {}, weeks });
  const fits = (s: Setup) => priceSetup(s).weeklyCents <= budgetCents;
  const tryAdd = (product: Product) => {
    if (addBlockReason(setup, product)) return false;
    const next = setupReducer(setup, { type: "ADD_ITEM", id: product.id });
    if (next === setup || !fits(next)) return false;
    setup = next;
    return true;
  };

  // One screen first: a desk setup without a screen is rarely what people want.
  const screens = available.filter((p) => p.category === "monitor");
  const shuffledScreens = shuffle(screens, random);
  for (const screen of shuffledScreens) if (tryAdd(screen)) break;

  // Then everything else, in random order, each tried once; screens can be picked again.
  const rest = available.filter((p) => p.category !== "desk" && p.category !== "chair");
  const order = shuffle([...rest, ...screens], random);
  for (const product of order) tryAdd(product);

  return setup;
}
