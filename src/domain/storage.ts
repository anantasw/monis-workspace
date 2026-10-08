import { z } from "zod";
import { normalizeSetup, setupInputSchema, type Setup } from "./setup";

export const STORAGE_KEY = "monis-workspace-setup";

/**
 * Version history of the saved setup:
 * - v1 (8 Oct 2026): a bare Setup object, no version field.
 * - v2 (9 Oct 2026): { version: 2, setup }.
 */
export const STORAGE_VERSION = 2;

const v2Schema = z.object({ version: z.literal(2), setup: setupInputSchema });
const v1Schema = setupInputSchema;

export function serializeForStorage(setup: Setup): string {
  return JSON.stringify({ version: STORAGE_VERSION, setup });
}

/** Read what the browser saved. Unknown, broken or future versions return null. */
export function parseStoredSetup(raw: string | null): Setup | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  const current = v2Schema.safeParse(data);
  if (current.success) return normalizeSetup(current.data.setup);

  // v1 had no version field: migrate by wrapping it.
  const isVersioned = typeof data === "object" && data !== null && "version" in data;
  if (!isVersioned) {
    const legacy = v1Schema.safeParse(data);
    if (legacy.success) return normalizeSetup(legacy.data);
  }
  return null;
}
