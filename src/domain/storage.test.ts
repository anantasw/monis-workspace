import { describe, expect, test } from "vitest";
import { STORAGE_VERSION, parseStoredSetup, serializeForStorage } from "./storage";

const setup = { deskId: "desk-140", chairId: "chair-task", items: { "mon-24": 1 }, weeks: 6 };

describe("saved setup in the browser", () => {
  test("is saved with a version number", () => {
    expect(JSON.parse(serializeForStorage(setup))).toEqual({ version: STORAGE_VERSION, setup });
  });

  test("reads back the current version", () => {
    expect(parseStoredSetup(serializeForStorage(setup))).toEqual(setup);
  });

  test("migrates version 1 (a bare setup object without a version)", () => {
    expect(parseStoredSetup(JSON.stringify(setup))).toEqual(setup);
  });

  test("returns null for missing, broken or foreign data", () => {
    expect(parseStoredSetup(null)).toBeNull();
    expect(parseStoredSetup("{not json")).toBeNull();
    expect(parseStoredSetup(JSON.stringify({ version: 99, setup }))).toBeNull();
    expect(parseStoredSetup(JSON.stringify({ hello: "world" }))).toBeNull();
  });

  test("fixes a saved setup that breaks today's rules", () => {
    const stored = JSON.stringify({ version: STORAGE_VERSION, setup: { ...setup, deskId: "desk-120", items: { "mon-24": 3 } } });
    expect(parseStoredSetup(stored)?.items).toEqual({ "mon-24": 2 });
  });
});
