import { expect, test } from "vitest";
import { setupMessage, whatsappUrl } from "./messages";

const setup = { deskId: "desk-120", chairId: "chair-ergo", items: { "mon-27": 2 }, weeks: 2 };

test("lists every item with its weekly price and the totals", () => {
  expect(setupMessage(setup, "https://example.test/?s=x")).toBe(
    [
      "Hi monis! I would like to rent this setup:",
      "",
      "• Standing Desk 120 ($6/wk)",
      "• Ergonomic Chair ($6/wk)",
      '• 2 × 27" Full HD Monitor ($16/wk)',
      "",
      "$28 per week × 2 weeks = $56",
      "Setup: https://example.test/?s=x",
    ].join("\n"),
  );
});

test("mentions the request reference when there is one", () => {
  expect(setupMessage(setup, "u", "MON-ABC123").split("\n")[0]).toBe("Hi monis! I sent rent request MON-ABC123.");
});

test("builds an encoded wa.me link", () => {
  expect(whatsappUrl("6281234567890", "a b&c")).toBe("https://wa.me/6281234567890?text=a%20b%26c");
});
