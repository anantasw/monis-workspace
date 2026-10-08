"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { formatUsd, pluralize } from "@/domain/format";
import { MAX_WEEKS, priceSetup } from "@/domain/setup";
import { onRovingKeyDown } from "@/components/ui/roving-focus";
import { useSetup, useSetupActions } from "./setup-context";

const WEEK_OPTIONS = Array.from({ length: MAX_WEEKS }, (_, i) => i + 1);

export function WeekPicker() {
  const { weeks } = useSetup();
  const { setWeeks } = useSetupActions();
  // The picker is rendered twice on the builder (phone tray and desktop ticket), so the id must be unique.
  const labelId = useId();
  return (
    <div>
      <p id={labelId} className="mb-2 text-sm font-semibold text-ink">
        Rent for <span className="tabular-nums">{pluralize(weeks, "week")}</span>
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="grid grid-cols-6 gap-1.5 lg:grid-cols-12 lg:gap-1"
        onKeyDown={(e) => onRovingKeyDown(e, '[role="radio"]')}
      >
        {WEEK_OPTIONS.map((w) => (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={w === weeks}
            aria-label={pluralize(w, "week")}
            tabIndex={w === weeks ? 0 : -1}
            onClick={() => setWeeks(w)}
            className={`h-11 rounded-sm text-sm lg:h-7 lg:text-[11px] font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand ${
              w <= weeks ? "bg-brand text-white" : "bg-paper text-ink-muted hover:bg-sun/40"
            }`}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CopyLinkButton({ className = "" }: { className?: string }) {
  const { shareUrl } = useSetupActions();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        const url = shareUrl();
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        } catch {
          window.prompt("Copy this link", url);
        }
      }}
      className={`rounded-control border border-line px-4 py-3 text-sm font-semibold text-brand hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand ${className}`}
    >
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
    </button>
  );
}

export function PriceTicket() {
  const setup = useSetup();
  const { weeklyCents, totalCents, itemCount } = priceSetup(setup);

  return (
    <>
      {/* Desktop: full ticket at the bottom of the side rail */}
      <div className="ticket hidden rounded-ticket bg-paper px-5 pb-4 pt-5 lg:block">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ink-muted">{pluralize(itemCount, "item")}, free delivery</p>
            <p key={weeklyCents} className="price-bump font-display text-[2.5rem] font-extrabold leading-none tracking-tight tabular-nums text-brand">
              {formatUsd(weeklyCents)}
              <span className="ml-1 font-sans text-base font-medium text-ink-muted">/ week</span>
            </p>
          </div>
          <p className="pb-1 text-right text-sm tabular-nums text-ink-muted">
            {setup.weeks} wk total
            <br />
            <span className="text-base font-semibold text-ink">{formatUsd(totalCents)}</span>
          </p>
        </div>
        <div className="mt-3">
          <WeekPicker />
        </div>
        <div className="mt-3 flex gap-2">
          <Link
            href="/summary"
            className="flex-1 rounded-control bg-brand px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Review my setup
          </Link>
          <CopyLinkButton />
        </div>
      </div>

      {/* Phone and tablet: compact bar fixed at the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p key={weeklyCents} className="price-bump font-display text-2xl font-extrabold leading-none tabular-nums text-brand">
              {formatUsd(weeklyCents)}
              <span className="ml-1 font-sans text-sm font-medium text-ink-muted">/ wk</span>
            </p>
            <p className="mt-1 truncate text-xs tabular-nums text-ink-muted">
              {pluralize(itemCount, "item")} · {setup.weeks} wk · {formatUsd(totalCents)} total
            </p>
          </div>
          <Link
            href="/summary"
            className="rounded-control bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Review setup
          </Link>
        </div>
      </div>
    </>
  );
}
