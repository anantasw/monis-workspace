import { describe, expect, test, vi } from "vitest";
import { createSetupStore } from "./setup-store";

describe("setup store", () => {
  test("is not ready until the browser state is restored", () => {
    const store = createSetupStore();
    expect(store.getSnapshot().ready).toBe(false);
    store.markReady({ deskId: "desk-teak", chairId: null, items: {}, weeks: 2 });
    expect(store.getSnapshot()).toMatchObject({ ready: true, setup: { deskId: "desk-teak", chairId: null, weeks: 2 } });
  });

  test("notifies listeners only when the setup really changes", () => {
    const store = createSetupStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    expect(store.dispatch({ type: "ADD_ITEM", id: "lamp-1s" }).changed).toBe(true);
    expect(store.dispatch({ type: "ADD_ITEM", id: "lamp-1s" }).changed).toBe(false); // max 1 lamp
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().setup.items).toEqual({ "lamp-1s": 1 });

    unsubscribe();
    store.dispatch({ type: "SET_WEEKS", weeks: 9 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test("returns the setup before and after, for Undo", () => {
    const store = createSetupStore();
    store.dispatch({ type: "SELECT_DESK", id: "desk-140" });
    store.dispatch({ type: "ADD_ITEM", id: "mon-24" });
    store.dispatch({ type: "ADD_ITEM", id: "mon-24" });
    store.dispatch({ type: "ADD_ITEM", id: "mon-24" });
    const { before, after } = store.dispatch({ type: "SELECT_DESK", id: "desk-120" });
    expect(before.items).toEqual({ "mon-24": 3 });
    expect(after.items).toEqual({ "mon-24": 2 });
  });
});
