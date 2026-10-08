import { describe, expect, test } from "vitest";
import { z } from "zod";
import { makeRentRequestSchema } from "./rent-request";

const schema = makeRentRequestSchema("2026-10-09");
const valid = {
  name: "Rina Putri",
  email: "rina@example.com",
  whatsapp: "",
  area: "Canggu",
  date: "2026-10-12",
  note: "",
  setup: "desk-120.chair-ergo.w4",
  website: "",
};

describe("rent request form", () => {
  test("accepts a complete request and drops empty optional fields", () => {
    const parsed = schema.parse(valid);
    expect(parsed.whatsapp).toBeUndefined();
    expect(parsed.note).toBeUndefined();
    expect(parsed.setup).toEqual({ deskId: "desk-120", chairId: "chair-ergo", items: {}, weeks: 4 });
  });

  test("today is a valid delivery date, yesterday is not", () => {
    expect(schema.safeParse({ ...valid, date: "2026-10-09" }).success).toBe(true);
    const result = schema.safeParse({ ...valid, date: "2026-10-08" });
    expect(result.success).toBe(false);
  });

  test("explains every wrong field", () => {
    const result = schema.safeParse({ ...valid, name: " ", email: "rina", area: "Bandung", date: "soon" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(z.flattenError(result.error).fieldErrors).sort()).toEqual(["area", "date", "email", "name"]);
    }
  });

  test("checks the WhatsApp number only when it is given", () => {
    expect(schema.safeParse({ ...valid, whatsapp: "+62 812-3456-7890" }).success).toBe(true);
    expect(schema.safeParse({ ...valid, whatsapp: "call me" }).success).toBe(false);
  });

  test("refuses a request with a broken setup code", () => {
    expect(schema.safeParse({ ...valid, setup: "<script>" }).success).toBe(false);
  });

  test("refuses bots that fill the hidden website field", () => {
    expect(schema.safeParse({ ...valid, website: "https://spam.example" }).success).toBe(false);
  });
});
