import { formatUsd, pluralize } from "./format";
import { priceSetup, type Setup } from "./setup";

/** Plain-text summary of a setup, used for WhatsApp and for copying. */
export function setupMessage(setup: Setup, shareUrl: string, reference?: string): string {
  const price = priceSetup(setup);
  const lines = price.lines.map((l) => `• ${l.qty > 1 ? `${l.qty} × ` : ""}${l.product.name} (${formatUsd(l.lineCents)}/wk)`);
  return [
    reference ? `Hi monis! I sent rent request ${reference}.` : "Hi monis! I would like to rent this setup:",
    "",
    ...lines,
    "",
    `${formatUsd(price.weeklyCents)} per week × ${pluralize(setup.weeks, "week")} = ${formatUsd(price.totalCents)}`,
    `Setup: ${shareUrl}`,
  ].join("\n");
}

/** wa.me link. `phone` is digits only, country code first. */
export function whatsappUrl(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
