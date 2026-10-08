import { z } from "zod";
import { INITIAL_SETUP, normalizeSetup, type Setup } from "./setup";

// Share link format: desk.chair.item.itemxN.wN, for example
// "desk-140.chair-ergo.mon-27-4kx2.lamp-1s.w8". "nochair" means the user stands.

const NO_CHAIR = "nochair";

const shareCodeSchema = z
  .string()
  .min(3)
  .max(500)
  .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)*$/, "Not a share code");

export function encodeSetup(setup: Setup): string {
  const parts = [setup.deskId, setup.chairId ?? NO_CHAIR];
  for (const [id, qty] of Object.entries(setup.items)) parts.push(qty > 1 ? `${id}x${qty}` : id);
  parts.push(`w${setup.weeks}`);
  return parts.join(".");
}

/** Parse a share code from a URL or a form. Returns null when the text is not a share code at all. */
export function decodeSetup(code: string): Setup | null {
  const parsed = shareCodeSchema.safeParse(code);
  if (!parsed.success) return null;

  const [deskId, chair, ...rest] = parsed.data.split(".");
  if (!deskId || !chair) return null;

  const items: Record<string, number> = {};
  let weeks = INITIAL_SETUP.weeks;
  for (const part of rest) {
    const week = /^w(\d{1,4})$/.exec(part);
    if (week) {
      weeks = Number(week[1]);
      continue;
    }
    const item = /^(.+?)(?:x(\d{1,4}))?$/.exec(part);
    if (item) items[item[1]] = Number(item[2] ?? 1);
  }
  return normalizeSetup({ deskId, chairId: chair === NO_CHAIR ? null : chair, items, weeks });
}
