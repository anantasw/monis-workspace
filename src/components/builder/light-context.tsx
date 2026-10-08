"use client";

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";
import { baliClock, phaseForHour, todayInBali, type Phase } from "@/domain/bali-time";

export type PhaseMode = Phase | "auto";

interface LightContextValue {
  state: {
    /** The light the room shows now. */
    phase: Phase;
    mode: PhaseMode;
    /** "09:41", live Bali time. */
    clockLabel: string;
    /** "2026-10-09", today's date in Bali; null until the browser has read the clock. */
    today: string | null;
  };
  actions: { setMode: (mode: PhaseMode) => void };
}

const LightContext = createContext<LightContextValue | null>(null);

interface ClockState {
  hour: number;
  label: string;
  today: string | null;
}

// Shown on the server and before the first tick. The real time is read only in the browser,
// so prerendered HTML never contains a time that is already wrong.
const STATIC_CLOCK: ClockState = { hour: 9, label: "09:41", today: null };

export function LightProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PhaseMode>("auto");
  const [clock, setClock] = useState<ClockState>(STATIC_CLOCK);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock({ ...baliClock(now), today: todayInBali(now) });
    };
    // Tick right after mount, then exactly when each Bali minute starts, so the clock never lags.
    let timer = window.setTimeout(function run() {
      tick();
      const now = Date.now();
      timer = window.setTimeout(run, 60_000 - (now % 60_000) + 50);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo<LightContextValue>(
    () => ({
      state: {
        phase: mode === "auto" ? phaseForHour(clock.hour) : mode,
        mode,
        clockLabel: clock.label,
        today: clock.today,
      },
      actions: { setMode },
    }),
    [mode, clock],
  );

  return <LightContext value={value}>{children}</LightContext>;
}

export function useLight(): LightContextValue {
  const ctx = use(LightContext);
  if (!ctx) throw new Error("useLight must be used inside <LightProvider>");
  return ctx;
}
