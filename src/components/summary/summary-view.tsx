"use client";

import Link from "next/link";
import { useRef, useState, type RefObject } from "react";
import { formatUsd, pluralize } from "@/domain/format";
import { setupMessage, whatsappUrl } from "@/domain/messages";
import { addBlockReason, priceSetup, type SetupPrice } from "@/domain/setup";
import { useLight } from "@/components/builder/light-context";
import { CopyLinkButton, WeekPicker } from "@/components/builder/price-ticket";
import { useSetup, useSetupActions, useSetupReady } from "@/components/builder/setup-context";
import { Scene } from "@/components/preview/scene";
import { useToast } from "@/components/ui/toast-context";
import { downloadBlob, renderPostcard } from "./postcard-image";
import { RentForm } from "./rent-form";

type SceneRef = RefObject<SVGSVGElement | null>;

function Postcard({ price, sceneRef }: { price: SetupPrice; sceneRef: SceneRef }) {
  const setup = useSetup();
  const {
    state: { phase, clockLabel },
  } = useLight();
  const screens = price.lines.filter((l) => l.product.category === "monitor").reduce((n, l) => n + l.qty, 0);
  const first = price.lines.at(0);

  return (
    <figure className="overflow-hidden rounded-ticket border border-line bg-surface shadow-lift md:grid md:grid-cols-[1.35fr_1fr]">
      <div className="relative bg-paper">
        <div className="riso-grain" aria-hidden="true" />
        <Scene ref={sceneRef} setup={setup} phase={phase} interactive={false} className="block aspect-[1200/760] w-full" />
      </div>
      <figcaption className="relative flex flex-col gap-4 border-t border-dashed border-brand/25 p-5 md:border-l md:border-t-0">
        <div className="flex items-start justify-end gap-2 sm:absolute sm:right-5 sm:top-5" aria-hidden="true">
          <svg viewBox="0 0 80 80" className="size-16 -rotate-12 text-frangipani">
            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="40" cy="40" r="26" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="40" y="36" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="var(--font-bricolage)">
              CANGGU
            </text>
            <text x="40" y="50" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="var(--font-bricolage)">
              {clockLabel} WITA
            </text>
          </svg>
          <div className="grid h-20 min-w-20 place-items-center border-2 border-dashed border-brand bg-sun/60 px-1.5 text-center">
            <span className="font-display text-base font-extrabold leading-none tabular-nums text-brand">
              {formatUsd(price.weeklyCents)}
              <span className="block text-[10px] font-semibold">PER WEEK</span>
            </span>
          </div>
        </div>
        <p className="font-note text-3xl leading-tight text-brand">
          Greetings
          <br />
          from my desk!
        </p>
        <p className="max-w-[28ch] text-sm leading-relaxed text-ink-muted">
          {first?.product.name}, {screens > 0 ? pluralize(screens, "screen") : "no screens yet"}, {pluralize(price.itemCount, "piece")} in
          total. Ready in Bali for {pluralize(setup.weeks, "week")}.
        </p>
        <div className="mt-auto space-y-1.5 border-t border-line pt-3 text-sm">
          <p className="flex justify-between">
            <span className="text-ink-muted">To</span>
            <span className="font-medium text-ink">Your villa or coworking space</span>
          </p>
          <p className="flex justify-between">
            <span className="text-ink-muted">Delivery and setup</span>
            <span className="font-medium text-leaf">Free</span>
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

function SummaryTable({ price }: { price: SetupPrice }) {
  const setup = useSetup();
  const { addItem, removeItem, deleteItem } = useSetupActions();
  const {
    actions: { show },
  } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);

  /** The row disappears, so move focus to the next remove button, or to the heading. */
  const removeRow = (id: string) => {
    const buttons = Array.from(tableRef.current?.querySelectorAll<HTMLButtonElement>("[data-remove]") ?? []);
    const index = buttons.findIndex((b) => b.dataset.remove === id);
    deleteItem(id);
    // After React has removed the row (rAF would not run in a background tab).
    window.setTimeout(() => {
      const next = Array.from(tableRef.current?.querySelectorAll<HTMLButtonElement>("[data-remove]") ?? []);
      (next.at(Math.min(index, next.length - 1)) ?? document.getElementById("items-heading"))?.focus();
    }, 0);
  };

  return (
    <div ref={tableRef} className="overflow-x-auto rounded-ticket border border-line">
      <table className="w-full text-sm">
        <caption className="sr-only">Items in your setup, price per week</caption>
        <thead>
          <tr className="border-b border-line text-left text-xs text-ink-muted">
            <th scope="col" className="px-4 py-2.5 font-medium">Item</th>
            <th scope="col" className="px-2 py-2.5 text-center font-medium">Qty</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">Per week</th>
            <th scope="col" className="w-10 py-2.5 pl-0 pr-1 sm:px-2">
              <span className="sr-only">Remove</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {price.lines.map(({ product, qty, lineCents }) => {
            const fixed = product.category === "desk" || product.category === "chair";
            const blockReason = fixed ? null : addBlockReason(setup, product);
            return (
              <tr key={product.id} className="border-b border-line last:border-b-0">
                <th scope="row" className="py-3 pl-3 pr-2 text-left font-medium text-ink sm:px-4">
                  {product.name}
                  <span className="block text-xs font-normal text-ink-muted">
                    {product.highlight}
                    {product.samplePrice ? " · sample price" : ""}
                  </span>
                </th>
                <td className="px-2 py-3">
                  {fixed || product.maxQty === 1 ? (
                    <span className="block text-center tabular-nums">{qty}</span>
                  ) : (
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                      <button
                        type="button"
                        aria-label={`Remove one ${product.name}`}
                        onClick={() => removeItem(product.id)}
                        className="grid size-11 place-items-center rounded-control sm:size-8 border border-line text-brand hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand"
                      >
                        −
                      </button>
                      <output className="w-5 text-center tabular-nums">{qty}</output>
                      <button
                        type="button"
                        aria-label={`Add one more ${product.name}`}
                        // At the limit the button stays focusable and explains why nothing happens.
                        aria-disabled={Boolean(blockReason)}
                        onClick={() => (blockReason ? show(blockReason) : addItem(product.id))}
                        className="grid size-11 place-items-center rounded-control sm:size-8 border border-line text-brand hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-2 py-3 text-right tabular-nums text-ink sm:px-4">{formatUsd(lineCents)}</td>
                <td className="py-3 pl-0 pr-1 text-right sm:px-2">
                  {fixed ? null : (
                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from the setup`}
                      data-remove={product.id}
                      onClick={() => removeRow(product.id)}
                      className="grid size-11 place-items-center rounded-control sm:size-8 text-ink-muted hover:bg-paper hover:text-danger focus-visible:outline-2 focus-visible:outline-brand"
                    >
                      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
                        <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-paper text-ink">
          <tr>
            <th scope="row" colSpan={2} className="px-4 pt-3 text-left font-medium">Per week</th>
            <td colSpan={2} className="px-4 pt-3 text-right tabular-nums">{formatUsd(price.weeklyCents)}</td>
          </tr>
          <tr>
            <th scope="row" colSpan={2} className="px-4 pb-3 text-left font-semibold">
              Total for {pluralize(setup.weeks, "week")}
            </th>
            <td colSpan={2} className="px-4 pb-3 text-right font-display text-xl font-extrabold tabular-nums text-brand">
              {formatUsd(price.totalCents)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function ShareActions({ sceneRef, price, whatsappNumber }: { sceneRef: SceneRef; price: SetupPrice; whatsappNumber: string | null }) {
  const setup = useSetup();
  const { shareUrl } = useSetupActions();
  const {
    state: { clockLabel },
  } = useLight();
  const {
    actions: { show },
  } = useToast();
  const [saving, setSaving] = useState(false);

  const download = async () => {
    const svg = sceneRef.current;
    if (!svg || saving) return;
    setSaving(true);
    try {
      const blob = await renderPostcard({ svg, price, weeks: setup.weeks, clockLabel });
      downloadBlob(blob, "my-bali-desk.png");
    } catch {
      show("Sorry, this browser could not create the image. Please take a screenshot instead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={download}
        // aria-disabled (not disabled) so keyboard focus stays on the button while the PNG is made.
        aria-disabled={saving}
        className="rounded-control border border-line px-4 py-3 text-sm font-semibold text-brand hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand aria-disabled:cursor-progress aria-disabled:opacity-60"
      >
        {saving ? "Making postcard…" : "Download postcard"}
      </button>
      <CopyLinkButton />
      {whatsappNumber ? (
        <a
          // Built on click so the link always carries the latest setup.
          href={`https://wa.me/${whatsappNumber}`}
          onClick={(e) => {
            e.currentTarget.href = whatsappUrl(whatsappNumber, setupMessage(setup, shareUrl()));
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-control border border-line px-4 py-3 text-sm font-semibold text-leaf hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand"
        >
          Ask on WhatsApp
        </a>
      ) : null}
    </div>
  );
}

export function SummaryView({ whatsappNumber }: { whatsappNumber: string | null }) {
  const ready = useSetupReady();
  const setup = useSetup();
  const price = priceSetup(setup);
  const sceneRef = useRef<SVGSVGElement>(null);

  return (
    <main id="main" className={`mx-auto w-full max-w-6xl flex-1 px-4 py-8 transition-opacity duration-200 sm:px-6 ${ready ? "" : "opacity-0"}`}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/"
            className="rounded-control text-sm font-medium text-ink-muted underline-offset-4 hover:text-brand hover:underline focus-visible:outline-2 focus-visible:outline-brand"
          >
            ← Back to the builder
          </Link>
          <h1 className="mt-2 font-display text-[clamp(1.75rem,1.2rem+2vw,2.5rem)] font-bold leading-tight tracking-tight text-brand">
            Your Bali workspace
          </h1>
        </div>
        <ShareActions sceneRef={sceneRef} price={price} whatsappNumber={whatsappNumber} />
      </div>

      <Postcard price={price} sceneRef={sceneRef} />

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section aria-labelledby="items-heading" className="min-w-0 space-y-4">
          <h2 id="items-heading" tabIndex={-1} className="text-lg font-semibold text-ink outline-none">
            What we deliver
          </h2>
          <SummaryTable price={price} />
          <div className="rounded-ticket border border-line p-4">
            <WeekPicker />
          </div>
        </section>
        <section aria-labelledby="rent-heading">
          <h2 id="rent-heading" className="mb-4 text-lg font-semibold text-ink">Rent this setup</h2>
          <RentForm whatsappNumber={whatsappNumber} />
        </section>
      </div>
    </main>
  );
}
