"use client";

import { useState } from "react";
import { PRESETS, type Product } from "@/domain/catalog";
import { formatUsd } from "@/domain/format";
import { priceSetup } from "@/domain/setup";
import { SURPRISE_BUDGETS_CENTS } from "@/domain/surprise";
import { Scene } from "@/components/preview/scene";
import { onRovingKeyDown } from "@/components/ui/roving-focus";
import { useLight, type PhaseMode } from "./light-context";
import { PriceTicket, WeekPicker } from "./price-ticket";
import { useSetup, useSetupActions, useSetupReady } from "./setup-context";
import { StickerTray, tabForCategory, type TrayTab } from "./sticker-tray";

const PHASE_OPTIONS = [
  { id: "auto", label: "Bali time" },
  { id: "morning", label: "Morning" },
  { id: "sunset", label: "Sunset" },
  { id: "night", label: "Night" },
] as const satisfies readonly { id: PhaseMode; label: string }[];

function PhaseToggle() {
  const {
    state: { mode },
    actions: { setMode },
  } = useLight();
  return (
    <div
      role="radiogroup"
      aria-label="Light in the room"
      className="flex w-full rounded-control border border-line bg-surface p-0.5 shadow-sm sm:w-auto"
      onKeyDown={(e) => onRovingKeyDown(e, '[role="radio"]')}
    >
      {PHASE_OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={mode === o.id}
          tabIndex={mode === o.id ? 0 : -1}
          onClick={() => setMode(o.id)}
          className={`min-h-11 flex-1 rounded-[4px] px-2.5 text-xs font-semibold sm:min-h-0 sm:flex-none sm:py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
            mode === o.id ? "bg-brand text-white" : "text-ink-muted hover:text-brand"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function StartOptions() {
  const { loadPreset, surprise } = useSetupActions();
  const [budget, setBudget] = useState<number>(SURPRISE_BUDGETS_CENTS[1]);

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-ink">Start from a setup</h2>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => loadPreset(p.id, p.name)}
            className="shrink-0 rounded-control border border-line bg-surface px-3 py-2 text-left transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            <span className="block text-sm font-semibold text-ink">{p.name}</span>
            <span className="block text-xs text-ink-muted">{p.note}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => surprise(budget)}
          className="min-h-11 rounded-control bg-sun px-3 text-sm font-semibold text-brand lg:min-h-9 transition-colors hover:bg-sun/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Surprise me
        </button>
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          up to
          <select
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="select min-h-11 rounded-control border border-line bg-surface pl-3 text-sm lg:min-h-9 font-medium text-ink focus-visible:outline-2 focus-visible:outline-brand"
          >
            {SURPRISE_BUDGETS_CENTS.map((c) => (
              <option key={c} value={c}>
                {formatUsd(c)} / week
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function Room({ onPick, onEmptySlot }: { onPick: (product: Product) => void; onEmptySlot: () => void }) {
  const setup = useSetup();
  const ready = useSetupReady();
  const {
    state: { phase, clockLabel },
  } = useLight();

  const summary = priceSetup(setup)
    .lines.map((l) => (l.qty > 1 ? `${l.qty} × ${l.product.name}` : l.product.name))
    .join(", ");

  return (
    <div className="relative lg:flex lg:min-h-0 lg:flex-1 lg:items-end">
      <Scene
        setup={setup}
        phase={phase}
        onItemClick={onPick}
        onEmptySlotClick={onEmptySlot}
        className={`block aspect-[1200/760] w-full transition-opacity duration-200 lg:aspect-auto lg:h-full ${ready ? "" : "opacity-0"}`}
        title={`Preview of your workspace: ${summary}`}
      />
      <div className="riso-grain" aria-hidden="true" />
      <p className="sr-only" aria-live="polite">
        {ready ? `Your setup: ${summary}.` : ""}
      </p>
      <div className="absolute right-3 top-3 hidden sm:block">
        <PhaseToggle />
      </div>
      <div
        className="absolute bottom-2 left-2 -rotate-2 border-2 border-brand/80 bg-paper/75 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide text-brand sm:bottom-5 sm:left-5 sm:px-2.5 sm:py-1 sm:text-sm"
        aria-hidden="true"
      >
        Your desk · Canggu · {clockLabel} WITA
      </div>
    </div>
  );
}

export function Builder() {
  const [tab, setTab] = useState<TrayTab>("desk");
  const { reset } = useSetupActions();

  const focusSticker = (product: Product) => {
    setTab(tabForCategory(product.category));
    // Wait until the tab panel has rendered, then move focus to the sticker.
    window.setTimeout(() => {
      const el = document.getElementById(`sticker-${product.id}`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      el?.focus({ preventScroll: true });
    }, 0);
  };

  return (
    <main
      id="main"
      className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-[minmax(0,1fr)] lg:h-[calc(100dvh-3.5rem)] lg:flex-none lg:grid-cols-[minmax(0,1fr)_420px] lg:grid-rows-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_460px]"
    >
      <div className="sticky top-14 z-20 flex flex-col bg-paper lg:static lg:min-h-0 lg:border-r lg:border-line">
        <Room onPick={focusSticker} onEmptySlot={() => setTab("gear")} />
      </div>

      <div className="flex min-h-0 min-w-0 flex-col bg-surface">
        <div className="flex-1 space-y-5 px-4 pb-40 pt-5 sm:px-6 lg:overflow-y-auto lg:pb-6">
          <div>
            <h1 className="font-display text-[clamp(1.75rem,1.2rem+1.6vw,2.25rem)] font-bold leading-[1.05] tracking-tight text-brand">
              Design your Bali workspace
            </h1>
            <p className="mt-2 max-w-prose text-[15px] text-ink-muted">
              Tap a sticker and it lands in your room. Every price is per week, with free delivery and setup.
            </p>
          </div>
          <div className="sm:hidden">
            <PhaseToggle />
          </div>
          <StartOptions />
          <StickerTray tab={tab} onTabChange={setTab} />
          <div className="lg:hidden">
            <WeekPicker />
          </div>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center rounded-control text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
          >
            Start over
          </button>
        </div>
        <div className="shrink-0 px-4 pb-4 sm:px-6 lg:pb-6">
          <PriceTicket />
        </div>
      </div>
    </main>
  );
}
