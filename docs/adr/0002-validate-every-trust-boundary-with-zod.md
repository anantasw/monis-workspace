# 0002: Validate every trust boundary with one set of Zod schemas

- Status: accepted (Zod approved by the owner on 2026-10-09)
- Date: 2026-10-09

## Context

Data enters the app from four places we do not control: the share link (`?s=`), browser storage, the rent form (`FormData`) and environment variables. Hand-written checks drift apart between client and server.

## Decision

- `setupInputSchema` (`src/domain/setup.ts`) checks the shape of any setup; `normalizeSetup()` then replays it through the reducer so business rules (screen slots, max quantities, weeks 1–12) apply in exactly one place.
- Share codes: `shareCodeSchema` in `src/domain/share-link.ts` (charset and length) before parsing.
- Storage: versioned format `{ version: 2, setup }` with a migration from v1 in `src/domain/storage.ts`.
- Rent form: `makeRentRequestSchema(today)` in `src/domain/rent-request.ts` is used by the Server Action; the browser uses the same delivery-area list and the same Bali date for the date input's `min`.
- Environment: `src/server/env.ts` (`server-only`) parses `process.env` once; `src/instrumentation.ts` loads it at server start so a bad value fails fast.

## Consequences

- One message per rule, in plain English, shown next to the field.
- Types come from the schemas (`z.infer`), so the form state and the server cannot disagree.
- Zod adds about 13 kB gzip, mostly on the server.
