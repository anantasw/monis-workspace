# 0003: Rent requests go to an optional webhook, with WhatsApp as a second channel

- Status: accepted
- Date: 2026-10-09

## Context

monis.rent has no public order API, and the brief does not ask for payments or accounts. The client still needs to receive requests, and customers in Bali mostly talk to shops on WhatsApp.

## Decision

- The Server Action `submitRentRequest` validates the form and returns a reference (`MON-XXXXXX`) at once.
- Delivery runs in `after()`, so the user never waits for it. `webhookSink` (`src/server/rent-requests.ts`) POSTs a JSON payload to `RENT_REQUEST_WEBHOOK_URL` when it is set (Slack, Zapier, Make, a CRM). It always logs one line with the reference and totals, never contact details.
- `RentRequestSink` is an interface (seam), so another channel (email, database) can replace the webhook without touching the form.
- When `MONIS_WHATSAPP_NUMBER` is set, the summary page offers "Ask on WhatsApp", and the confirmation offers "Send a copy on WhatsApp", both with a prefilled message (`src/domain/messages.ts`).
- A hidden honeypot field stops simple bots; they get a fake success and nothing is delivered.

## Consequences

- Works today with zero infrastructure; becomes "real" by setting one environment variable.
- No storage of personal data in this app.
- No rate limiting yet. If spam appears, add Vercel's firewall rules or a rate limit in the action.
