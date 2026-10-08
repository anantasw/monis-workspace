import { describe, expect, test } from "vitest";
import { PRODUCT_BY_ID } from "./catalog";
import { monitorCount, monitorSlots, normalizeSetup, priceSetup } from "./setup";
import { surpriseSetup } from "./surprise";

/** Small seeded random (mulberry32) so every test run picks the same items. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("surprise me", () => {
  test.each([1, 2, 3, 4, 5, 6, 7, 8])("seed %i stays within a $40 weekly budget and follows the rules", (seed) => {
    const setup = surpriseSetup({ budgetCents: 4000, weeks: 4, random: seeded(seed) });
    expect(priceSetup(setup).weeklyCents).toBeLessThanOrEqual(4000);
    expect(setup.chairId).not.toBeNull();
    expect(monitorCount(setup.items)).toBeLessThanOrEqual(monitorSlots(setup));
    expect(normalizeSetup(setup)).toEqual(setup);
  });

  test("always includes at least one screen when the budget allows it", () => {
    const setup = surpriseSetup({ budgetCents: 4000, weeks: 4, random: seeded(42) });
    expect(monitorCount(setup.items)).toBeGreaterThanOrEqual(1);
  });

  test("keeps the chosen rental length", () => {
    expect(surpriseSetup({ budgetCents: 6000, weeks: 9, random: seeded(1) }).weeks).toBe(9);
  });

  test("the same random source gives the same setup", () => {
    const a = surpriseSetup({ budgetCents: 8000, weeks: 4, random: seeded(7) });
    const b = surpriseSetup({ budgetCents: 8000, weeks: 4, random: seeded(7) });
    expect(a).toEqual(b);
  });

  test("a tiny budget still gives the cheapest desk and chair", () => {
    const setup = surpriseSetup({ budgetCents: 100, weeks: 4, random: seeded(3) });
    expect(PRODUCT_BY_ID[setup.deskId].pricePerWeekCents).toBe(500);
    expect(setup.chairId && PRODUCT_BY_ID[setup.chairId].pricePerWeekCents).toBe(350);
    expect(setup.items).toEqual({});
  });
});
