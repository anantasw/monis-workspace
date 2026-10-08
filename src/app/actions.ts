"use server";

import { after } from "next/server";
import { z } from "zod";
import { todayInBali } from "@/domain/bali-time";
import { makeRentRequestSchema, type RentField } from "@/domain/rent-request";
import { createReference, webhookSink } from "@/server/rent-requests";

export type RentFormState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<RentField, string[]>>;
      /** What the user typed, sent back because React resets a form after its action. */
      values: Partial<Record<RentField, string>>;
    }
  | { status: "ok"; reference: string };

const TEXT_FIELDS = ["name", "email", "whatsapp", "area", "date", "note"] as const satisfies readonly RentField[];

/**
 * Public form: there is no login, so there is nothing to authorise. The trust boundary is the
 * FormData, which is fully validated with the same schema the browser uses.
 */
export async function submitRentRequest(_prev: RentFormState, formData: FormData): Promise<RentFormState> {
  const raw = Object.fromEntries(formData);
  const parsed = makeRentRequestSchema(todayInBali(new Date())).safeParse(raw);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    if (fieldErrors.website) {
      // Bot filled the hidden field: answer like a success so it learns nothing, and deliver nothing.
      return { status: "ok", reference: createReference() };
    }
    const values: Partial<Record<RentField, string>> = {};
    for (const key of TEXT_FIELDS) {
      const value = raw[key];
      if (typeof value === "string") values[key] = value.slice(0, 500);
    }
    return { status: "error", message: "Please fix the fields marked below.", fieldErrors, values };
  }

  const record = { reference: createReference(), createdAt: new Date().toISOString(), request: parsed.data };
  // Deliver after the response, so the user does not wait for the webhook.
  after(() => webhookSink.deliver(record));
  return { status: "ok", reference: record.reference };
}
