import "server-only";
import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Where rent requests are POSTed as JSON (Slack, Zapier, Make, a CRM). Optional: without it, requests are only logged. */
  RENT_REQUEST_WEBHOOK_URL: z.preprocess(emptyToUndefined, z.url({ protocol: /^https$/ }).optional()),
  /** monis.rent WhatsApp number in international format without "+", for example 6281234567890. Optional. */
  MONIS_WHATSAPP_NUMBER: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^\d{8,15}$/, "Use digits only, country code first, for example 6281234567890")
      .optional(),
  ),
});

// Parsed once when the module loads, so a wrong value fails at start, not in the middle of a request.
export const env = envSchema.parse(process.env);
