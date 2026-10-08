// Bali uses WITA (Asia/Makassar), UTC+8 all year. Everything here is pure, so it can be tested
// with fixed dates and never runs during server rendering.

export const BALI_TIME_ZONE = "Asia/Makassar";

export type Phase = "morning" | "noon" | "sunset" | "night";

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: BALI_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateFormat = new Intl.DateTimeFormat("en-CA", { timeZone: BALI_TIME_ZONE });

export interface BaliClock {
  hour: number;
  /** "09:30" */
  label: string;
}

export function baliClock(date: Date): BaliClock {
  const parts = clockFormat.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return { hour, label: `${String(hour).padStart(2, "0")}:${minute}` };
}

/** "2026-10-09": the calendar date in Bali, used as the earliest delivery date. */
export function todayInBali(date: Date): string {
  return dateFormat.format(date);
}

export function phaseForHour(hour: number): Phase {
  if (hour >= 6 && hour < 11) return "morning";
  if (hour >= 11 && hour < 16) return "noon";
  if (hour >= 16 && hour < 19) return "sunset";
  return "night";
}
