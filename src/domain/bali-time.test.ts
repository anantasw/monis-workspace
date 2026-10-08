import { describe, expect, test } from "vitest";
import { baliClock, phaseForHour, todayInBali } from "./bali-time";

describe("Bali time (UTC+8)", () => {
  test("shows the local clock in Bali", () => {
    // 01:30 UTC = 09:30 in Bali
    expect(baliClock(new Date("2026-10-09T01:30:00Z"))).toEqual({ hour: 9, label: "09:30" });
  });

  test("the Bali date can already be tomorrow", () => {
    // 17:00 UTC on the 9th = 01:00 on the 10th in Bali
    expect(todayInBali(new Date("2026-10-09T17:00:00Z"))).toBe("2026-10-10");
  });

  test.each([
    [5, "night"],
    [6, "morning"],
    [10, "morning"],
    [11, "noon"],
    [15, "noon"],
    [16, "sunset"],
    [18, "sunset"],
    [19, "night"],
    [0, "night"],
  ] as const)("hour %i is %s", (hour, phase) => {
    expect(phaseForHour(hour)).toBe(phase);
  });
});
