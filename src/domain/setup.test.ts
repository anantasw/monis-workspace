import { describe, expect, test } from "vitest";
import {
  INITIAL_SETUP,
  addBlockReason,
  normalizeSetup,
  priceSetup,
  setupReducer,
  type Setup,
  type SetupAction,
} from "./setup";
import { PRODUCT_BY_ID } from "./catalog";

const run = (actions: SetupAction[], from: Setup = INITIAL_SETUP) => actions.reduce(setupReducer, from);

describe("desk and chair", () => {
  test("starts with the 120 cm standing desk, the ergonomic chair and 4 weeks", () => {
    expect(INITIAL_SETUP).toEqual({ deskId: "desk-120", chairId: "chair-ergo", items: {}, weeks: 4 });
  });

  test("selecting a desk replaces the old one", () => {
    expect(run([{ type: "SELECT_DESK", id: "desk-teak" }]).deskId).toBe("desk-teak");
  });

  test("a chair id that is not a chair is ignored", () => {
    const state = run([{ type: "SELECT_CHAIR", id: "mon-27" }]);
    expect(state).toBe(INITIAL_SETUP);
  });

  test("the user can choose no chair", () => {
    expect(run([{ type: "SELECT_CHAIR", id: null }]).chairId).toBeNull();
  });
});

describe("screens must fit on the desk", () => {
  test("a 120 cm desk takes 2 screens, the third is refused", () => {
    const state = run([
      { type: "ADD_ITEM", id: "mon-27" },
      { type: "ADD_ITEM", id: "mon-27" },
      { type: "ADD_ITEM", id: "mon-24" },
    ]);
    expect(state.items).toEqual({ "mon-27": 2 });
    expect(addBlockReason(state, PRODUCT_BY_ID["mon-24"])).toMatch(/fits 2 screens/);
  });

  test("a 140 cm desk takes 3 screens", () => {
    const state = run([
      { type: "SELECT_DESK", id: "desk-140" },
      { type: "ADD_ITEM", id: "mon-27" },
      { type: "ADD_ITEM", id: "mon-27" },
      { type: "ADD_ITEM", id: "mon-24" },
    ]);
    expect(state.items).toEqual({ "mon-27": 2, "mon-24": 1 });
  });

  test("moving to a smaller desk removes the last-added screens first", () => {
    const wide = run([
      { type: "SELECT_DESK", id: "desk-140" },
      { type: "ADD_ITEM", id: "mon-27" },
      { type: "ADD_ITEM", id: "mon-24" },
      { type: "ADD_ITEM", id: "mon-24" },
    ]);
    const narrow = setupReducer(wide, { type: "SELECT_DESK", id: "desk-120" });
    expect(narrow.items).toEqual({ "mon-27": 1, "mon-24": 1 });
  });

  test("only one Studio Display is allowed", () => {
    const state = run([
      { type: "SELECT_DESK", id: "desk-140" },
      { type: "ADD_ITEM", id: "mon-studio" },
      { type: "ADD_ITEM", id: "mon-studio" },
    ]);
    expect(state.items).toEqual({ "mon-studio": 1 });
  });
});

describe("gear and weeks", () => {
  test("removing the last unit deletes the item", () => {
    const state = run([
      { type: "ADD_ITEM", id: "lamp-1s" },
      { type: "REMOVE_ITEM", id: "lamp-1s" },
    ]);
    expect(state.items).toEqual({});
  });

  test("weeks are kept between 1 and 12", () => {
    expect(run([{ type: "SET_WEEKS", weeks: 0 }]).weeks).toBe(1);
    expect(run([{ type: "SET_WEEKS", weeks: 30 }]).weeks).toBe(12);
  });

  test("a preset replaces desk, chair and items but keeps the weeks", () => {
    const state = run([
      { type: "SET_WEEKS", weeks: 8 },
      { type: "LOAD_PRESET", id: "trader" },
    ]);
    expect(state).toEqual({
      deskId: "desk-140",
      chairId: "chair-ergo",
      items: { "mon-27": 3, "keyboard-mx": 1, "mouse-mx": 1, "monitor-riser": 1 },
      weeks: 8,
    });
  });

  test("reset goes back to the starting setup", () => {
    const state = run([{ type: "LOAD_PRESET", id: "creator" }, { type: "RESET" }]);
    expect(state).toEqual(INITIAL_SETUP);
  });
});

describe("normalizeSetup fixes untrusted setups with the same rules", () => {
  test("drops unknown ids and screens that do not fit", () => {
    const setup = normalizeSetup({
      deskId: "desk-120",
      chairId: "chair-ergo",
      items: { "mon-27": 3, bogus: 1, "lamp-1s": 4 },
      weeks: 6,
    });
    expect(setup.items).toEqual({ "mon-27": 2, "lamp-1s": 1 });
    expect(setup.weeks).toBe(6);
  });

  test("an unknown desk falls back to the default desk", () => {
    expect(normalizeSetup({ deskId: "nope", chairId: null, items: {}, weeks: 4 }).deskId).toBe("desk-120");
  });
});

describe("priceSetup", () => {
  test("adds desk, chair and items per week, then multiplies by weeks", () => {
    // desk-120 $6 + chair-ergo $6 + 2 x mon-27 $8 + lamp $3 = $31 per week; 3 weeks = $93
    const price = priceSetup({
      deskId: "desk-120",
      chairId: "chair-ergo",
      items: { "mon-27": 2, "lamp-1s": 1 },
      weeks: 3,
    });
    expect(price.weeklyCents).toBe(3100);
    expect(price.totalCents).toBe(9300);
    expect(price.itemCount).toBe(5);
    expect(price.lines.map((l) => l.product.id)).toEqual(["desk-120", "chair-ergo", "mon-27", "lamp-1s"]);
  });

  test("no chair means no chair line", () => {
    const price = priceSetup({ deskId: "desk-teak", chairId: null, items: {}, weeks: 1 });
    expect(price.weeklyCents).toBe(500);
    expect(price.lines).toHaveLength(1);
  });
});
