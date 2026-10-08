import { describe, expect, test } from "vitest";
import { decodeSetup, encodeSetup } from "./share-link";

describe("share link", () => {
  test("round-trips a full setup", () => {
    const setup = {
      deskId: "desk-140",
      chairId: "chair-rattan",
      items: { "mon-27-4k": 2, "lamp-1s": 1 },
      weeks: 8,
    };
    const code = encodeSetup(setup);
    expect(code).toBe("desk-140.chair-rattan.mon-27-4kx2.lamp-1s.w8");
    expect(decodeSetup(code)).toEqual(setup);
  });

  test("keeps 'no chair'", () => {
    expect(decodeSetup("desk-teak.nochair.w2")).toEqual({ deskId: "desk-teak", chairId: null, items: {}, weeks: 2 });
  });

  test("drops unknown items and applies desk rules", () => {
    expect(decodeSetup("desk-120.chair-ergo.mon-27x5.hack.w4")).toEqual({
      deskId: "desk-120",
      chairId: "chair-ergo",
      items: { "mon-27": 2 },
      weeks: 4,
    });
  });

  test("returns null for text that is not a share code", () => {
    expect(decodeSetup("")).toBeNull();
    expect(decodeSetup("<script>alert(1)</script>")).toBeNull();
    expect(decodeSetup("a".repeat(600))).toBeNull();
  });
});
