"use client";

import type { ReactNode } from "react";
import type { Category, Product } from "@/domain/catalog";
import { addBlockReason, monitorCount, monitorSlots, productsIn } from "@/domain/setup";
import { onRovingKeyDown } from "@/components/ui/roving-focus";
import { useSetup, useSetupActions } from "./setup-context";
import { ItemSticker, RadioSticker } from "./sticker";

export type TrayTab = "desk" | "chair" | "gear" | "zones";

const TABS = [
  { id: "desk", label: "Desk" },
  { id: "chair", label: "Chair" },
  { id: "gear", label: "Gear" },
  { id: "zones", label: "Zones" },
] as const satisfies readonly { id: TrayTab; label: string }[];

export function tabForCategory(category: Category): TrayTab {
  switch (category) {
    case "desk":
      return "desk";
    case "chair":
      return "chair";
    case "zone":
      return "zones";
    case "monitor":
    case "gear":
      return "gear";
  }
}

const DESKS = productsIn("desk");
const CHAIRS = productsIn("chair");
const SCREENS = productsIn("monitor");
const GEAR = productsIn("gear");
const ZONES = productsIn("zone");

const gridClass = "grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3";

function RadioGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="radiogroup" aria-label={label} className={gridClass} onKeyDown={(e) => onRovingKeyDown(e, '[role="radio"]')}>
      {children}
    </div>
  );
}

function ItemGrid({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className={gridClass}>
      {children}
    </div>
  );
}

function ChoiceGroup({
  label,
  products,
  selectedId,
  onSelect,
}: {
  label: string;
  products: Product[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const anySelected = products.some((p) => p.id === selectedId);
  return (
    <RadioGrid label={label}>
      {products.map((p, i) => (
        <RadioSticker
          key={p.id}
          product={p}
          checked={p.id === selectedId}
          tabbable={anySelected ? p.id === selectedId : i === 0}
          onSelect={onSelect}
        />
      ))}
    </RadioGrid>
  );
}

interface StickerTrayProps {
  tab: TrayTab;
  onTabChange: (tab: TrayTab) => void;
}

export function StickerTray({ tab, onTabChange }: StickerTrayProps) {
  const setup = useSetup();
  const actions = useSetupActions();
  const slots = monitorSlots(setup);
  const used = monitorCount(setup.items);
  const desksFull = used >= slots;

  const item = (p: Product, groupHintId?: string) => (
    <ItemSticker
      key={p.id}
      product={p}
      qty={setup.items[p.id] ?? 0}
      blockReason={addBlockReason(setup, p)}
      groupHintId={groupHintId}
      onAdd={actions.addItem}
      onRemove={actions.removeItem}
    />
  );

  return (
    <section aria-label="Choose your items">
      <div
        role="tablist"
        aria-label="Item groups"
        className="flex gap-1 border-b border-line"
        onKeyDown={(e) => onRovingKeyDown(e, '[role="tab"]')}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => onTabChange(t.id)}
            className={`-mb-px min-h-11 border-b-2 px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
              tab === t.id ? "border-brand text-brand" : "border-transparent text-ink-muted hover:text-brand"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="pt-4">
        {tab === "desk" ? (
          <ChoiceGroup label="Desks" products={DESKS} selectedId={setup.deskId} onSelect={actions.selectDesk} />
        ) : null}

        {tab === "chair" ? (
          <>
            <ChoiceGroup label="Chairs" products={CHAIRS} selectedId={setup.chairId} onSelect={actions.selectChair} />
            <button
              type="button"
              onClick={() => actions.selectChair(setup.chairId ? null : "chair-ergo")}
              className="mt-2 inline-flex min-h-11 items-center rounded-control text-sm font-medium text-ink-muted underline underline-offset-4 hover:text-brand focus-visible:outline-2 focus-visible:outline-brand"
            >
              {setup.chairId ? "I stand all day, no chair" : "Add the ergonomic chair again"}
            </button>
          </>
        ) : null}

        {tab === "gear" ? (
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-ink">Screens</h3>
                <p className="text-xs tabular-nums text-ink-muted">
                  {used} of {slots} fit on this desk
                </p>
              </div>
              {desksFull ? (
                <p id="screens-hint" className="mb-3 rounded-control bg-sun/30 px-3 py-2 text-xs text-ink">
                  {slots < 3 ? "This desk is full. Pick Standing Desk 140 to fit 3 screens." : "This desk is full."}
                </p>
              ) : null}
              <ItemGrid label="Screens">{SCREENS.map((p) => item(p, desksFull ? "screens-hint" : undefined))}</ItemGrid>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-ink">On the desk</h3>
              <ItemGrid label="Desk gear">{GEAR.map((p) => item(p))}</ItemGrid>
            </div>
          </div>
        ) : null}

        {tab === "zones" ? (
          <div>
            <p className="mb-3 text-sm text-ink-muted">Make the rest of the room yours: a coffee corner, clean air, a big plant.</p>
            <ItemGrid label="Room zones">{ZONES.map((p) => item(p))}</ItemGrid>
          </div>
        ) : null}
      </div>
    </section>
  );
}
