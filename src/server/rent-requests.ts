import "server-only";
import { priceSetup } from "@/domain/setup";
import type { RentRequest } from "@/domain/rent-request";
import { encodeSetup } from "@/domain/share-link";
import { env } from "./env";

export interface RentRequestRecord {
  reference: string;
  createdAt: string;
  request: RentRequest;
}

/** Seam for delivering a request. The real one posts to a webhook; tests can pass a fake. */
export interface RentRequestSink {
  deliver(record: RentRequestRecord): Promise<void>;
}

export function createReference(): string {
  return `MON-${crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase()}`;
}

function toPayload({ reference, createdAt, request }: RentRequestRecord) {
  const price = priceSetup(request.setup);
  return {
    reference,
    createdAt,
    contact: { name: request.name, email: request.email, whatsapp: request.whatsapp ?? null },
    delivery: { area: request.area, date: request.date, note: request.note ?? null },
    rental: {
      weeks: request.setup.weeks,
      weeklyCents: price.weeklyCents,
      totalCents: price.totalCents,
      shareCode: encodeSetup(request.setup),
      items: price.lines.map((l) => ({ id: l.product.id, name: l.product.name, qty: l.qty, weeklyCents: l.lineCents })),
    },
  };
}

export const webhookSink: RentRequestSink = {
  async deliver(record) {
    const price = priceSetup(record.request.setup);
    // No contact details in logs: they are personal data.
    console.info(
      `[rent-request] ${record.reference} · ${price.itemCount} items · ${record.request.setup.weeks} wk · ${price.weeklyCents / 100} USD/wk`,
    );
    if (!env.RENT_REQUEST_WEBHOOK_URL) return;

    try {
      const res = await fetch(env.RENT_REQUEST_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toPayload(record)),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) console.error(`[rent-request] ${record.reference} webhook failed with HTTP ${res.status}`);
    } catch (error) {
      // Network error or the 8 s timeout. Log the reference so the request can be found and sent again.
      const reason = error instanceof Error ? error.name : "unknown error";
      console.error(`[rent-request] ${record.reference} webhook not reached (${reason})`);
    }
  },
};
