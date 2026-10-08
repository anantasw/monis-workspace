import type { KeyboardEvent } from "react";

const STEP: Partial<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Arrow-key navigation for a radio group or tab list (WAI-ARIA pattern): arrows move focus to the
 * next enabled item and select it; Home and End jump to the ends. Put it on the group's onKeyDown,
 * and give the selected item tabIndex 0 and the others -1.
 */
export function onRovingKeyDown(event: KeyboardEvent<HTMLElement>, itemSelector: string) {
  const step = STEP[event.key];
  if (step === undefined && event.key !== "Home" && event.key !== "End") return;

  const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(itemSelector)).filter(
    (el) => !el.hasAttribute("disabled"),
  );
  if (items.length === 0) return;

  const current = items.findIndex((el) => el === document.activeElement);
  let next: number;
  if (event.key === "Home") next = 0;
  else if (event.key === "End") next = items.length - 1;
  else next = (Math.max(current, 0) + (step ?? 0) + items.length) % items.length;

  event.preventDefault();
  const target = items.at(next);
  target?.focus();
  target?.click();
}
