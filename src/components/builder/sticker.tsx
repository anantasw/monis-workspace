"use client";

import { useId, useRef } from "react";
import type { Product } from "@/domain/catalog";
import { formatUsd } from "@/domain/format";
import { ProductArt } from "@/components/preview/art";

function peel(el: HTMLElement | null) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(
    [
      { transform: "none" },
      { transform: "translateY(-10px) rotate(-7deg) scale(1.08)", offset: 0.45 },
      { transform: "none" },
    ],
    { duration: 380, easing: "cubic-bezier(0.34, 1.4, 0.64, 1)" },
  );
}

function StickerFace({ product, badge, selected }: { product: Product; badge: string | null; selected: boolean }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={`absolute left-1/2 top-3 size-20 -translate-x-1/2 rounded-full transition-[transform,background-color] duration-200 ${
          selected ? "scale-100 bg-sun/70" : "scale-50 bg-transparent"
        }`}
      />
      <span data-art className="relative flex h-24 w-full items-end justify-center">
        <ProductArt product={product} className="sticker-art max-h-24 w-auto max-w-[92%]" />
      </span>
      {badge !== null ? (
        <span
          aria-hidden="true"
          className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand text-xs font-bold text-white"
        >
          {badge}
        </span>
      ) : null}
      <span className="mt-2 text-[13px] font-semibold leading-tight text-ink">{product.name}</span>
      <span className="mt-0.5 text-[13px] tabular-nums text-ink-muted">
        {product.originalPerWeekCents ? (
          <s className="mr-1 opacity-70">
            <span className="sr-only">was </span>
            {formatUsd(product.originalPerWeekCents)}
          </s>
        ) : null}
        <span className="font-semibold text-ink">{formatUsd(product.pricePerWeekCents)}</span>/wk
      </span>
      {!product.available ? <span className="mt-1 text-xs font-semibold text-danger">Out of stock</span> : null}
      {product.samplePrice ? <span className="mt-1 text-[11px] text-ink-muted">sample price</span> : null}
    </>
  );
}

const faceClass =
  "sticker relative flex w-full flex-col items-center rounded-control px-2 pb-2 pt-3 text-center outline-none transition-colors hover:bg-paper focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent";

interface RadioStickerProps {
  product: Product;
  checked: boolean;
  /** Roving tab index: only one radio in the group is in the Tab order. */
  tabbable: boolean;
  onSelect: (id: string) => void;
}

/** Desk or chair: one of a group. */
export function RadioSticker({ product, checked, tabbable, onSelect }: RadioStickerProps) {
  const artRef = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={artRef}
      id={`sticker-${product.id}`}
      type="button"
      role="radio"
      aria-checked={checked}
      tabIndex={tabbable ? 0 : -1}
      disabled={!product.available}
      onClick={() => {
        if (checked) return;
        peel(artRef.current?.querySelector("[data-art]") ?? null);
        onSelect(product.id);
      }}
      className={faceClass}
    >
      <StickerFace product={product} selected={checked} badge={checked ? "✓" : null} />
    </button>
  );
}

interface ItemStickerProps {
  product: Product;
  qty: number;
  /** Why one more cannot be added, or null. */
  blockReason: string | null;
  /** Id of a hint shown once for the whole group (for example "this desk is full"). */
  groupHintId?: string;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

/** Gear or zone item: a toggle when only one is allowed, a stepper when several are. */
export function ItemSticker({ product, qty, blockReason, groupHintId, onAdd, onRemove }: ItemStickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const ownHintId = useId();
  const hintId = groupHintId ?? ownHintId;
  const selected = qty > 0;
  const stepper = product.maxQty > 1;
  const add = () => {
    peel(ref.current?.querySelector("[data-art]") ?? null);
    onAdd(product.id);
  };

  return (
    <div ref={ref} className="flex flex-col">
      <button
        id={`sticker-${product.id}`}
        type="button"
        aria-pressed={selected}
        aria-describedby={blockReason ? hintId : undefined}
        disabled={!product.available || (Boolean(blockReason) && !selected)}
        onClick={() => {
          if (!selected) add();
          else if (!stepper) onRemove(product.id);
        }}
        className={faceClass}
      >
        <StickerFace product={product} selected={selected} badge={selected ? (stepper && qty > 1 ? String(qty) : "✓") : null} />
      </button>

      {stepper && selected ? (
        <div className="mt-1 flex items-center justify-center gap-1" role="group" aria-label={`${product.name} quantity`}>
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            aria-label={`Remove one ${product.name}`}
            className="grid size-11 place-items-center rounded-control border border-line text-lg lg:size-9 font-semibold text-brand hover:bg-paper focus-visible:ring-2 focus-visible:ring-brand"
          >
            −
          </button>
          <output className="w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite">
            {qty}
          </output>
          <button
            type="button"
            // aria-disabled (not disabled): the button keeps keyboard focus when the limit is reached.
            onClick={() => {
              if (!blockReason) add();
            }}
            aria-disabled={Boolean(blockReason)}
            aria-label={`Add one more ${product.name}`}
            aria-describedby={blockReason ? hintId : undefined}
            className="grid size-11 place-items-center rounded-control border border-line text-lg lg:size-9 font-semibold text-brand hover:bg-paper focus-visible:ring-2 focus-visible:ring-brand aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-disabled:hover:bg-transparent"
          >
            +
          </button>
        </div>
      ) : null}

      {!groupHintId && blockReason && product.available && (stepper || !selected) ? (
        <p id={hintId} className="mt-1 px-1 text-center text-[11px] leading-snug text-ink-muted">
          {blockReason}
        </p>
      ) : null}
    </div>
  );
}
