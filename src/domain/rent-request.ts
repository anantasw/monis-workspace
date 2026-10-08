import { z } from "zod";
import { decodeSetup } from "./share-link";

export const DELIVERY_AREAS = ["Canggu", "Seminyak", "Ubud", "Uluwatu", "Sanur", "Other"] as const;
export type DeliveryArea = (typeof DELIVERY_AREAS)[number];

/** Empty text inputs arrive as "": treat them as "not given". */
const optionalText = (schema: z.ZodString) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());

/**
 * One schema for the rent form, used by the browser (for `min` on the date input) and by the
 * Server Action (the real check). `today` is passed in so the rule is testable and uses Bali time.
 */
export function makeRentRequestSchema(today: string) {
  return z.object({
    name: z.string().trim().min(2, "Please enter your name.").max(80, "Please use 80 characters or fewer."),
    email: z.email("Please enter an email address like rina@example.com.").max(120),
    whatsapp: optionalText(
      z
        .string()
        .trim()
        .regex(/^\+?[\d\s-]{8,20}$/, "Use digits only, for example +62 812 3456 7890."),
    ),
    area: z.enum(DELIVERY_AREAS, { error: "Please choose a delivery area." }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a delivery date.")
      .refine((d) => d >= today, "Please choose today or a later date."),
    note: optionalText(z.string().trim().max(500, "Please keep the note under 500 characters.")),
    setup: z.string().transform((code, ctx) => {
      const setup = decodeSetup(code);
      if (!setup) {
        ctx.addIssue({ code: "custom", message: "Your setup could not be read. Please go back to the builder." });
        return z.NEVER;
      }
      return setup;
    }),
    // Hidden field. People never see it; simple bots fill it in.
    website: z.string().max(0, "Spam check failed.").optional(),
  });
}

export type RentRequest = z.infer<ReturnType<typeof makeRentRequestSchema>>;
export type RentField = keyof z.input<ReturnType<typeof makeRentRequestSchema>>;
