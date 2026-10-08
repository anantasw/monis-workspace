# PRD: Monis Workspace Builder

Last updated: 2026-10-09 · Owner: Abhisena · Status: all features built and tested locally; not yet deployed

## Human-friendly overview

Monis Workspace Builder is a small web app for [monis.rent](https://www.monis.rent/), a company in Bali that rents office equipment to digital nomads and startups. Instead of scrolling a product list, the user builds a desk setup inside a picture of a Bali room. They pick a desk, pick a chair, and add screens, a lamp, a plant and other items. Each choice appears in the room right away, and the weekly price updates at the same time. The light in the room follows the real time in Bali: morning sun, a pink sunset, or night with the desk lamp on. When the user is happy, they open a summary that looks like a postcard and send a rent request.

Why it matters: a freelancer who just arrived in Bali wants a working office by next week. Seeing "my desk, in Bali" makes the decision faster and more fun than reading specs. It also sells more items per order, because adding a second screen or a lamp is one tap.

Stack: Next.js (App Router) + Tailwind CSS, deployed on Vercel. **No other library is added without the owner's approval.** The code lives on GitHub with desent-bot as a collaborator.

---

## 1. Background, goals and success metrics

The goal is a deployed, visual workspace builder that meets all 7 acceptance criteria of the brief and feels fun, not like a catalog.

**Problem today.** monis.rent is a classic store: 9 categories, more than 100 products, prices per week, and fixed bundles such as "The Essentials" and "The Founders Setup" (checked on 8 Oct 2026). A new customer must open many pages, compare specs, and imagine how the parts fit together.

**Goals**

1. A user can build a full desk setup in under 2 minutes, without reading a spec sheet.
2. Every change shows in the room within 300 ms, with a short animation.
3. The weekly total and the rental length are always visible.
4. The flow ends with a clear summary and a "Rent this setup" action.
5. The tool looks like part of monis.rent, but with its own memorable face.

**Non-goals (this version)**

- Real payment, real stock check, user accounts, or a real order API.
- A 3D room editor. The room is 2D SVG, so it stays fast on phones.
- Every monis.rent product. We use a curated set of 20 items.

**Success metrics**

| Metric | Target |
| --- | --- |
| Acceptance criteria met | 7 of 7 |
| Time to a complete setup (desk + chair + 2 accessories) | under 60 seconds for a first-time user |
| Lighthouse Performance / Accessibility (mobile) | 90 or higher / 95 or higher |
| Works on | latest Chrome, Safari, Firefox; 360 px phone width and up |

## 2. Users and user stories

The main user is a remote worker who just arrived in Bali and needs a working desk within a week.

| Persona | Situation | What they need from the tool |
| --- | --- | --- |
| Rina, freelance developer (main) | Arrived in Canggu, stays 3 months, works on a laptop | A fast, good-looking setup with 2 screens, a good chair, a clear weekly price |
| Tom, startup founder | Team of 3 in a villa, starts next Monday | Build one setup and share the link with the team |
| Maya, content creator | Records video and podcasts | Add a 5K display, webcam, lamp; see the full look before renting |
| Monis staff (secondary) | Receives the rent request | A complete list of items, quantity, duration, delivery date and contact |

**User stories**

1. As a user, I can choose a desk from at least 2 options and see it in the room at once.
2. As a user, I can choose a chair from at least 2 options (or no chair) and see it in the room at once.
3. As a user, I can add, remove and change the number of accessories.
4. As a user, I can start from a ready-made setup and then change it.
5. As a user, I always see the weekly total and the total for my rental length.
6. As a user, I can open a summary that lists every item, its price and the total, and then send a rent request.
7. As a user, I can copy a link that opens my exact setup on another device.
8. As a user on a phone, I can do all of the above with my thumb.
9. As a keyboard or screen reader user, I can do all of the above without a mouse.

## 3. Scope: acceptance criteria mapped to features

| # | Acceptance criterion (from brief) | Covered by | Status |
| --- | --- | --- | --- |
| AC-1 | A user can select a desk from at least 2 options | FR-2 (3 desks) | Done |
| AC-2 | A user can select a chair from at least 2 options | FR-3 (3 chairs) | Done |
| AC-3 | A user can add accessories (monitors, lamps, plants, etc.) | FR-4, FR-5 | Done |
| AC-4 | The workspace preview updates visually as items are added or changed | FR-6, FR-11 | Done |
| AC-5 | There is a summary or "checkout" view showing the selected setup | FR-8, FR-9 | Done |
| AC-6 | The app is deployed and accessible via a public URL | NFR-7, Vercel | **Not done** |
| AC-7 | The code is on GitHub with desent-bot added as a collaborator | Delivery checklist | **Not done** |

**Stretch ("surprise us")**

| Idea | Status |
| --- | --- |
| Starter setups based on monis.rent bundles (FR-1) | Done |
| Shareable setup link (FR-10) | Done |
| Lifestyle zones from the sketch: coffee corner, clean air, big plant (FR-5) | Done |
| Room light follows Bali time, with manual Morning / Sunset / Night (FR-11) | Done |
| Postcard-style summary (FR-8) | Done |
| "Surprise me": a random valid setup within a weekly budget (FR-12) | Done |
| Download the postcard as a PNG (browser canvas, no library) (FR-8) | Done |
| WhatsApp: ask about a setup, or send a copy of a request (FR-8, FR-9) | Done; needs the client's number in `MONIS_WHATSAPP_NUMBER` |
| Undo for every change that removes something (FR-13) | Done |

**Out of scope:** payment, login, stock sync with monis.rent, admin panel, multi-language, currencies other than USD.

## 4. Functional requirements

### FR-1 Starter setups

- A row of 4 starter buttons above the tabs: The Essentials, The Founders Setup, The Trading Setup, The Creator Setup. Names follow monis.rent bundles.
- Picking one fills the builder at once and keeps the chosen rental length. The user can then change anything.
- If the user already had items, a toast says "Loaded The Founders Setup." with **Undo** (FR-13). Undo is faster than a "are you sure?" step and still protects the user's work.

### FR-2 Choose a desk (AC-1)

- 3 desk options: Standing Desk 120 (2 screens), Standing Desk 140 (3 screens), Teak Writing Desk (2 screens).
- Exactly one desk is selected at any time. Default: Standing Desk 120, so the room is never empty.
- Desks are a radio group of stickers (see FR-7 for the sticker card).
- Desk width in the room follows the real width (120 cm vs 140 cm is visibly different).

### FR-3 Choose a chair (AC-2)

- 3 chair options: Ergonomic Chair, Task Chair, Rattan Chair.
- Exactly one chair, or "no chair" through the link "I stand all day, no chair". Default: Ergonomic Chair.

### FR-4 Add desk gear (AC-3)

- The **Gear** tab has two groups: **Screens** (4 monitors) and **On the desk** (keyboard, mouse, laptop stand, webcam, desk lamp, monitor riser, desk plant).
- Screens use a quantity stepper (− 1 +). Other gear is a toggle (tap to add, tap again to remove).
- **Placement rules** (enforced in the reducer, so the UI cannot reach an invalid state):
    - Screens: the desk sets the limit (2 or 3). The group shows "1 of 2 fit on this desk". When full, one shared hint says "This desk is full. Pick Standing Desk 140 to fit 3 screens." and every + is disabled.
    - Apple Studio Display 5K: max 1. Other gear: max 1 each.
    - Changing to a smaller desk removes the last-added extra screens and shows a toast with an **Undo** button (5 seconds).
- Out-of-stock items are shown but disabled, with the label "Out of stock".

### FR-5 Room zones (from the sketch)

- The **Zones** tab: Nespresso Essenza (adds a rattan coffee table in the right corner), Air Purifier Elite (stands on the floor), Monstera (big floor plant).
- Only items that monis.rent really rents carry a real price. Items not on monis.rent carry a "sample price" label (see section 7).
- Surfboard, motorcycle, bean bag and tool shelf from the sketch are left out: monis.rent does not rent them, and we do not show fake products.

### FR-6 Live room preview (AC-4)

- A 2D SVG room: wall, louvred window with a Bali view (palm, rice terraces), rattan pendant lamp, floor, desk, chair and every selected item in a fixed place.
- Desk top layout from left to right: desk plant, laptop stand, screens (on the riser when added), lamp. Keyboard and mouse sit in front. The webcam sits on the middle screen (or on the laptop). If the row is too wide, it scales down to fit the desk.
- Any change updates the room in the same frame. New items drop in with a small bounce (420 ms, CSS only). Moved items slide to their new place (260 ms).
- With no screens, a dashed slot "+ add a screen" sits on the desk and opens the Gear tab.
- Tapping an item in the room opens its tab and focuses its sticker.
- The room fills any frame shape (wall and floor run past the edges), so it works from a 375 px phone to a wide desktop.
- Small handwritten notes (max 3): "hello from Canggu", "your coffee", "5K!".
- A stamp in the corner: "Your desk · Canggu · 14:05 WITA" (live Bali time).
- Text alternative: a visually hidden list "Your setup: …" with `aria-live="polite"`, and the same text in the SVG `aria-label`.
- `prefers-reduced-motion`: all animation is turned off.

### FR-7 Stickers, price and rental length

- Items are shown as **die-cut stickers**: the item's own drawing with a white outline, its name, and price per week. There is no grid of photo cards.
- Sticker states: default, hover (small lift), focus (navy ring), selected (sun-yellow disc and a check or the quantity), limit reached (disabled), out of stock, sample price.
- Tapping a sticker plays a short "peel" animation (Web Animations API, no library).
- Prices are per week in USD, from monis.rent (sale price when there is a sale, with the old price struck through).
- **Rental length: 1 to 12 weeks**, picked with 12 week blocks (one row on desktop, 6 × 2 with 44 px blocks on phones). Default: 4 weeks.
- **Price ticket** (desktop: bottom of the side rail, with a perforated top edge): weekly total, item count, total for N weeks, the week blocks, "Review my setup" and "Copy link".
- **Phone and tablet:** a compact bar fixed at the bottom (weekly total, item count, weeks, total, "Review setup"). The week blocks sit at the end of the item list.
- Delivery, setup and pick-up are free (monis.rent includes them). There is no long-rental discount until the client confirms one.
- All money math uses integer cents.

### FR-8 Summary page (AC-5)

- Route `/summary`. It reads the same setup (shared state, saved in the browser).
- **Postcard:** the room on the left (same light as the builder), and on the right "Greetings from my desk!", a short sentence about the setup, a Canggu postmark with the Bali time, and a stamp with the weekly price.
- **Item table:** item, highlight, qty stepper (desk and chair fixed at 1), price per week; footer with weekly total and the total for N weeks.
- Each item row (not desk or chair) has a remove button; removing shows a toast with **Undo**.
- The week picker is repeated here.
- Actions at the top:
    - **Download postcard**: a 1600 × 900 PNG made in the browser (room on the left, handwriting, item list, stamp and total on the right). File name `my-bali-desk.png`. If the browser cannot make it, a toast suggests a screenshot.
    - **Copy link** (FR-10).
    - **Ask on WhatsApp** (only when `MONIS_WHATSAPP_NUMBER` is set): opens wa.me with a prefilled message: every item with its weekly price, the totals and the share link.
- "Back to the builder" link.

### FR-9 Rent request

- Form next to the table: name, email, WhatsApp (optional), delivery area (Canggu, Seminyak, Ubud, Uluwatu, Sanur, Other), delivery date, note (optional). The setup travels as a hidden share code.
- Every input has a visible label, the right `type`, `inputMode` and `autocomplete`; the date input has `min` = today in Bali.
- The Server Action `submitRentRequest` validates `FormData` with one Zod schema (`src/domain/rent-request.ts`):

| Field | Rule | Message |
| --- | --- | --- |
| name | 2–80 characters after trimming | "Please enter your name." |
| email | valid email, max 120 | "Please enter an email address like rina@example.com." |
| whatsapp | optional; 8–20 digits, spaces, dashes, optional "+" | "Use digits only, for example +62 812 3456 7890." |
| area | one of the 6 areas | "Please choose a delivery area." |
| date | `YYYY-MM-DD`, today or later in Bali time | "Please choose today or a later date." |
| note | optional, max 500 | "Please keep the note under 500 characters." |
| setup | a valid share code | "Your setup could not be read. Please go back to the builder." |

- On error: a summary message plus the message under each wrong field (`role="alert"`, linked with `aria-describedby`, field marked `aria-invalid`). **What the user typed stays in the form.**
- On success: "Terima kasih!" with a reference such as `MON-3F9A1C`, item count, weekly price and weeks, and (when the number is set) "Send a copy on WhatsApp".
- Delivery runs after the response with `after()`:
    - when `RENT_REQUEST_WEBHOOK_URL` is set, a JSON payload (reference, contact, delivery, items, totals, share code) is POSTed to it, with an 8 s timeout;
    - one log line is always written with the reference and totals only (no personal data).
- Spam: a hidden honeypot field. A request that fills it gets a fake success and is not delivered.
- No payment is taken. The button says the weekly price: "Rent this setup for $38/week".

### FR-10 Shareable setup link

- Format: `/?s=desk-140.chair-ergo.mon-27-4kx2.lamp-1s.w8` (desk, chair or `nochair`, items with `xN` for quantity, `wN` for weeks).
- Opening the link restores the setup. Unknown ids are dropped, quantities are clamped, invalid states are fixed by the same reducer rules.
- After loading, `?s=` is removed from the address bar, so a refresh keeps the user's own changes.
- "Copy link" uses the Clipboard API and shows "Link copied". If that fails, the link is shown in a prompt.
- Share codes are checked first (lowercase letters, digits, dots and dashes, max 500 characters); anything else is ignored.
- The last setup is also saved in `localStorage` as `{ "version": 2, "setup": … }`. The older unversioned format (v1) is migrated on read; unknown versions are ignored. Blocked storage (private mode) is handled silently.

### FR-11 Bali light (new)

- The room light follows the real time in Bali (Asia/Makassar, UTC+8), read on the client and refreshed every minute:

| Bali time | Phase | What changes |
| --- | --- | --- |
| 06:00–10:59 | Morning | Teal sky, sun high, yellow light shaft from the window |
| 11:00–15:59 | Noon | Brighter sky, weaker light shaft |
| 16:00–18:59 | Sunset | Pink sky, low orange sun, soft lamp glow |
| 19:00–05:59 | Night | Navy sky with moon, room dimmed, desk lamp casts a warm cone |

- A control in the room ("Bali time", "Morning", "Sunset", "Night") lets the user pick a phase. Phase changes fade in 600 ms.
- The time is read only in the browser, after hydration. The server HTML never contains a time.

### FR-12 Surprise me

- A **Surprise me** button with a weekly budget select ($25, $40, $60, $100; default $40).
- It builds a random setup that follows every rule: one desk and one chair that fit the budget, then one screen if it fits, then random gear, zones and more screens while the weekly price stays within the budget. If even the cheapest desk and chair are over budget, it uses those two.
- It keeps the chosen rental length. A toast says the new weekly price and offers Undo.

### FR-13 Undo and start over

- Changes that remove something show a toast for 8 seconds (the timer pauses while the pointer or keyboard focus is on it) with **Undo** and a close button: a smaller desk that removes screens, removing an item on the summary page, loading a preset over existing items, "Surprise me", and **Start over** (a link under the tray that returns to the default setup).
- Toasts are announced politely to screen readers.

## 5. UX flow, layout and states

**Main flow**

1. Land on `/`: the room fills most of the screen; the side rail shows the title, starter setups, the tabs and the price ticket.
2. Pick a starter or keep the default desk and chair.
3. Change desk, chair, gear and zones. The room and the price update after every step.
4. "Review my setup" opens `/summary`.
5. Fill in the form and press "Rent this setup". The confirmation replaces the form on the same page.

**Layout**

| Screen width | Layout |
| --- | --- |
| Desktop (1024 px and up) | Room on the left, full height. Side rail 420–460 px on the right; its list scrolls, the ticket stays at the bottom. |
| Phone and tablet (under 1024 px) | Room at the top (aspect 1200:760), sticky under the header. Rail content below. Compact price bar fixed at the bottom with safe-area padding. |

**Empty and error states**

- No screens: dashed "+ add a screen" slot in the room.
- Bad share link: valid parts load, the rest is dropped.
- Storage blocked (private mode): the builder still works without saving.
- Form errors: see FR-9.

**Accessibility**

- Target WCAG 2.2 AA. Desk and chair pickers are radio groups; gear uses `aria-pressed` toggles and labelled steppers ("Add one more 27" 4K Monitor").
- Tabs use `tablist` / `tab` / `tabpanel`. Items in the room are focusable buttons.
- Radio groups (desks, chairs, light, weeks) and the tab list use **roving focus**: one Tab stop per group, arrow keys move and select, Home and End jump to the ends.
- A "Skip to content" link is the first Tab stop.
- Visible focus rings; the screens-full hint is linked with `aria-describedby`.
- Every form field has a label; errors use `role="alert"`; no field blocks paste.
- No `transition: all`; `prefers-reduced-motion` turns animation off.

## 6. Visual direction: "Riso Villa"

The full design system is in [`DESIGN.md`](../DESIGN.md); this section is a short summary.

- **North star:** "That's my desk, in Bali."
- **Look:** the room is a two-ink risograph print: navy line art, colour fills printed slightly off-register with `mix-blend-mode: multiply`, and a light paper grain. The UI around the room stays white and quiet, like monis.rent.
- **Colours:** navy `#15252E` (brand, buttons, line art), paper `#F9F2EA`, lagoon teal `#1F8A8A`, sun yellow `#F2C230` (selected state, light), frangipani pink `#E8708F` (rare), leaf green `#2F6B4A` (success), line `#E5E7EB`, muted text `#5B6770`, error `#B42318`.
- **Fonts** (Google Fonts via `next/font`): Bricolage Grotesque for headings and big prices, Inter for UI and body (monis.rent brand font), Gochi Hand for handwritten notes only.
- **Shapes:** 6 px radius on buttons and inputs (no pill buttons), 12 px on the ticket and cards.
- **Motion:** drop-in with a small bounce, sticker peel, 600 ms light fade. All off with reduced motion.
- Tokens live once in `src/app/globals.css` (`@theme`), so classes like `bg-brand`, `text-ink-muted`, `bg-paper`, `bg-sun` work everywhere. Components use no raw hex colours.

## 7. Data model and catalog

The catalog is a typed file in the repo: `src/data/catalog.ts`. There is no database.

```ts
type Product = {
  id: string;                    // stable slug, used in share links
  name: string;
  category: "desk" | "chair" | "monitor" | "gear" | "zone";
  pricePerWeekCents: number;     // current price (sale price if on sale)
  originalPerWeekCents?: number; // shown struck through
  highlight: string;
  art: ArtKey;                   // which SVG drawing is used in the room and on the sticker
  maxQty: number;
  available: boolean;
  samplePrice?: boolean;         // not on monis.rent yet; price must be confirmed
  sourceUrl?: string;
  meta?: { widthCm?: number; monitorSlots?: number; screenWidth?: number; screenLabel?: string };
};

type Setup = {
  deskId: string;
  chairId: string | null;
  items: Record<string, number>; // productId -> quantity
  weeks: number;                 // 1..12
};
```

The reducer `setupReducer` (`src/domain/setup.ts`) is the only place with business rules. Actions: `SELECT_DESK`, `SELECT_CHAIR`, `ADD_ITEM`, `REMOVE_ITEM`, `DELETE_ITEM`, `SET_WEEKS`, `LOAD_PRESET`, `REPLACE`, `RESET`; a `never` check makes a missing case a compile error. `normalizeSetup()` replays any untrusted setup through the same reducer. `priceSetup()` returns lines, weekly total, total and item count in integer cents. Totals are derived, never stored.

In the browser, the setup lives in a small external store shared by `/` and `/summary` (see section 8 and `docs/adr/0001`). Domain words are defined in `CONTEXT.md`.

**Catalog** (prices per week from [monis.rent](https://www.monis.rent/), 8 Oct 2026)

| Item | Tab | Price / week | Source |
| --- | --- | --- | --- |
| Standing Desk 120 | Desk | $6 (was $9) | monis.rent ("Electrical Adjustable Desk") |
| Standing Desk 140 | Desk | $7.50 | **sample price** |
| Teak Writing Desk | Desk | $5 | **sample price** |
| Ergonomic Chair | Chair | $6 (was $9) | monis.rent |
| Task Chair | Chair | $3.50 | **sample price** |
| Rattan Chair | Chair | $4 | **sample price** |
| 24" Full HD Monitor | Gear › Screens | $6.50 | monis.rent |
| 27" Full HD Monitor | Gear › Screens | $8 | monis.rent |
| 27" 4K Monitor | Gear › Screens | $12 (was $16) | monis.rent |
| Apple Studio Display 5K | Gear › Screens | $79 | monis.rent |
| Logitech MX Keyboard | Gear | $6 (was $8) | monis.rent |
| MX Master Mouse | Gear | $3 (was $4) | monis.rent |
| Laptop Stand | Gear | $2 (was $3) | monis.rent |
| Logitech 4K Webcam | Gear | $6 | monis.rent |
| Smart LED Desk Lamp | Gear | $3 (was $4) | monis.rent |
| Monitor Riser | Gear | $2 | monis.rent ("Adjustable Monitor Stand") |
| Desk Plant | Gear | $1.50 | **sample price** |
| Nespresso Essenza | Zones | $7 (was $9) | monis.rent |
| Air Purifier Elite | Zones | $14 | monis.rent |
| Monstera | Zones | $3 | **sample price** |

**Starter setups**

| Preset | Desk | Chair | Items |
| --- | --- | --- | --- |
| The Essentials | Standing Desk 120 | Ergonomic | none |
| The Founders Setup | Standing Desk 120 | Ergonomic | 27" 4K, keyboard, mouse, laptop stand, lamp |
| The Trading Setup | Standing Desk 140 | Ergonomic | 3 × 27" FHD, keyboard, mouse, riser |
| The Creator Setup | Teak Writing Desk | Rattan | Studio Display 5K, webcam, lamp, desk plant, Nespresso, Monstera |

## 8. Technical architecture

The app is a static Next.js 16 App Router site: client-side builder state, one Server Action, and an optional webhook. It runs on Vercel with no database. Decisions are recorded in `docs/adr/`.

| Part | Version | Note |
| --- | --- | --- |
| Next.js (App Router, Turbopack, Cache Components on) | 16.4.0 | `/`, `/summary` and `/opengraph-image` prerender as static |
| React / React DOM | 19.3.0 | `use()` for context, `ref` as a prop, `useActionState` |
| Tailwind CSS | 4.x | Tokens in `@theme` |
| TypeScript | 5.9 | strict; no `any`; `as const satisfies` for config lists |
| Zod | 4.x | **Approved 2026-10-09.** Every trust boundary (ADR 0002) |
| Vitest | 5.x (dev only) | **Approved 2026-10-09.** Domain tests (ADR 0004) |
| ESLint + eslint-config-next | 9 / 16.4.0 | Includes the React Compiler hook rules |
| Package manager | pnpm 10 | |

**Built-in tools used instead of more libraries:** `next/font` (3 fonts), `next/og` (Open Graph image), Server Actions + `useActionState` + `after()` (rent request), `useSyncExternalStore` (state), `URLSearchParams` (share link), CSS keyframes and the Web Animations API (motion), `XMLSerializer` + canvas (postcard PNG), `navigator.clipboard`, `Intl.NumberFormat` / `Intl.DateTimeFormat` (USD, Bali time), inline SVG (all art).

**Not installed (would need approval):** `@vercel/analytics` (funnel data), `@testing-library/react` + a browser test runner (component tests), `motion` (physics animations).

**Environment variables** (validated at server start in `src/server/env.ts`; see `.env.example`)

| Name | Required | Use |
| --- | --- | --- |
| `RENT_REQUEST_WEBHOOK_URL` | no | HTTPS endpoint that receives each rent request as JSON |
| `MONIS_WHATSAPP_NUMBER` | no | Digits only, country code first; shows the WhatsApp buttons |

A wrong value stops the build or the server with a clear Zod message.

**Folder structure**

```
CONTEXT.md                   # domain glossary
DESIGN.md                    # design system ("Riso Villa")
docs/PRD.md                  # this document
docs/adr/                    # architecture decision records
src/
  instrumentation.ts         # loads env validation at server start
  app/
    layout.tsx               # fonts, metadata, providers, header, toaster, skip link
    page.tsx                 # builder
    summary/page.tsx         # postcard, table, rent form (passes the WhatsApp number)
    actions.ts               # "use server" submitRentRequest()
    error.tsx, not-found.tsx # error and 404 pages
    opengraph-image.tsx      # social preview image
    icon.png, icon1.png, apple-icon.png # official monis.rent icons (48, 192, 180 px)
    globals.css              # Tailwind import, @theme tokens, animations
  domain/                    # pure TypeScript, no React; each module has a *.test.ts
    catalog.ts               # products, presets, findProduct()
    setup.ts                 # reducer rules, normalizeSetup(), priceSetup()
    share-link.ts            # encode/decode share codes
    storage.ts               # versioned browser storage + migration
    rent-request.ts          # form schema and delivery areas
    surprise.ts              # "Surprise me"
    bali-time.ts             # Bali clock, date and light phase
    messages.ts              # WhatsApp text and link
    format.ts                # USD and plurals
  server/                    # import "server-only"
    env.ts                   # validated environment
    rent-requests.ts         # reference, webhook sink (seam)
  components/
    builder/                 # setup-store, setup-context, light-context, builder, sticker-tray, sticker, price-ticket
    preview/                 # scene (the room), art (all item drawings)
    summary/                 # summary-view, rent-form, postcard-image
    ui/                      # site-header, toast-context, toaster, roving-focus
```

**Rendering notes**

- With Cache Components on, nothing reads the time or the URL during render. The Bali clock, `localStorage` and `?s=` are read after mount; the page fades in after that, so there is no flash of the default setup and no hydration mismatch.
- A "use server" file may only export async functions, so shared constants live in `src/domain/`.
- Only the WhatsApp number crosses from server to client, not the env object.

## 9. Quality, delivery and open questions

**Non-functional requirements**

| ID | Requirement | Status |
| --- | --- | --- |
| NFR-1 | LCP under 2.5 s, CLS under 0.1 on a mid-range phone (Vercel production) | To measure after deploy |
| NFR-2 | WCAG 2.2 AA, Lighthouse Accessibility 95+ | Built for it; audit not run |
| NFR-3 | 360 px to 1920 px, no horizontal scroll; touch targets 44 px on phones | Checked at 375 px and 1440 px (E2E run) |
| NFR-4 | Last 2 versions of Chrome, Safari (incl. iOS), Firefox, Edge | Chrome checked (production build); others not yet |
| NFR-5 | `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass with zero errors | Passing (60 tests) |
| NFR-6 | Title template, description, Open Graph image | Done |
| NFR-7 | Vercel, auto-deploy from `main`, preview deploys for pull requests | Not done |
| NFR-8 | Rent form data is not stored and not logged; no third-party trackers | Done |
| NFR-9 | Environment variables validated at start | Done |

**Automated tests** (`pnpm test`, 8 files, 60 tests): setup rules and prices, share link, storage migration, rent form schema, Bali time, Surprise me, WhatsApp message, and the client store.

**Manual end-to-end run** (9 Oct 2026, production build with `pnpm build && pnpm start`, Chrome, real clicks and key presses; 1440 × 900 and 375 × 812)

| # | Scenario | Result |
| --- | --- | --- |
| S1 | First visit: default setup, no console errors, title, description, OG tags | Pass |
| S2 | Keyboard only: skip link first; one Tab stop per radio group and tab list; arrows move and select; Enter and Space add items | Pass after fix E2E-1 |
| S3 | Mouse: click an item in the room opens its tab and focuses its sticker; chair and desk change; 3 screens on 140 cm; switch to 120 cm removes one, toast, Undo restores | Pass after fix E2E-2 |
| S4 | Weeks: 8 weeks gives $31 × 8 = $248; reload keeps the setup; presets, Surprise me and Start over each offer Undo | Pass |
| S5 | Copy link, open it fresh: same setup ($39.50 × 8 = $316), `?s=` removed; refresh keeps it | Pass after fix E2E-8 |
| S6 | Summary: table and totals match; remove + Undo; week change ($33.50 × 2 = $67); postcard PNG downloads; WhatsApp hidden without a number | Pass after fixes E2E-3, E2E-4 |
| S7 | Rent form: empty submit shows 4 field messages; typed values stay; submit with Enter shows a reference; server log has no personal data | Pass after fix E2E-5 |
| S8 | `/does-not-exist` returns 404 with the custom page; `/opengraph-image` returns a 1200 × 630 PNG | Pass (see E2E-9) |
| S9 | Phone 375 px: no horizontal scroll on both pages; taps add items; bottom bar totals; summary layout | Pass after fixes E2E-6, E2E-7, E2E-10 |

**Findings from the run**

| ID | Finding | Fix | Status |
| --- | --- | --- | --- |
| E2E-1 | At the screen limit the "+" button became `disabled`, so keyboard focus fell to the page body | `aria-disabled` instead of `disabled`; the button keeps focus and its hint | Fixed, retested |
| E2E-2 | Undo toast closed after 6 s even while the pointer or focus was on it (WCAG 2.2.1) | 8 s, and the timer pauses on hover and focus | Fixed, retested (stays > 10 s while hovered) |
| E2E-3 | Summary "+" did nothing when the desk was full, with no message | `aria-disabled` + a toast that explains the limit | Fixed, retested |
| E2E-4 | Removing a summary row dropped focus to the page body | Focus moves to the next remove button, or to the "What we deliver" heading | Fixed, retested |
| E2E-5 | After a failed or successful form submit, focus fell to the page body | Focus moves to the first invalid field, or to the "Terima kasih!" heading | Fixed, retested |
| E2E-6 | Phone touch targets were under 44 px (week blocks 25 × 28, light buttons 28 high, "Start over" 20 high, steppers 32–36) | 44 px on phones, compact again on desktop; week picker is 6 × 2 on phones | Fixed, retested (no control under 44 px except one text link) |
| E2E-7 | On phones, the postcard postmark covered "from my desk!" | Stamps sit above the text on small screens | Fixed, retested |
| E2E-8 | A setup opened from a share link was not saved until the first change, so a refresh lost it (`?s=` was already removed) | Save right after restoring | Fixed, retested |
| E2E-9 | Open Graph image text is not bold (no font file is loaded by `ImageResponse`) | Not fixed: cosmetic; needs a font file in the repo | Open |
| E2E-10 | After E2E-6, the summary table made the page 11 px too wide on phones | `min-w-0` on the grid column and tighter cell padding on phones | Fixed, retested |

**Not covered yet**

- [ ] Screen reader pass (VoiceOver on macOS and iOS).
- [ ] Safari, iOS Safari and Firefox (watch `mix-blend-mode` and the postcard PNG).
- [ ] `prefers-reduced-motion` on a real device.
- [ ] Lighthouse on the production URL.
- [ ] A real webhook endpoint receives a request; WhatsApp links with the client's number.

**Delivery checklist**

- [ ] Commit the work and create the GitHub repository
- [ ] Add desent-bot as a collaborator (GitHub › Settings › Collaborators)
- [ ] Connect the repo to Vercel; set the two environment variables if the client gives them
- [ ] README: live URL
- [ ] All 7 acceptance criteria checked on the production URL

**Risks**

| Risk | Effect | Plan |
| --- | --- | --- |
| Sample prices are wrong | Client sees prices it does not offer | Labelled "sample price" in the UI; confirm with the client; one file to update |
| Prices change on monis.rent | Totals are out of date | Single catalog file; note the check date |
| Keyboard and mouse sit partly behind the chair in the room | Small items are hard to see | Acceptable for v1; could move the chair aside |
| Spam on the public form | Noise in the webhook | Honeypot now; add a rate limit or Vercel firewall rule if needed |
| Postcard text in the PNG uses fallback fonts inside the room drawing | Notes look plainer in the image | Acceptable; the card text uses the real fonts |
| Room art in Safari (`mix-blend-mode` in SVG) | Colours may look flatter | Test on Safari before submitting |

**Open questions for the client**

1. Which extra desk and chair models should be shown, and at what price? (Today 6 items use sample prices.)
2. Can plants be rented, and at what price?
3. Is there a long-rental discount (for example 10% for 8+ weeks)?
4. Which WhatsApp number and which webhook (Slack, email tool, CRM) should receive rent requests?
5. Should the sketch's fun items (surfboard, scooter, bean bag) appear as "Coming soon", or stay out?

## 10. Change log

| Date | Change |
| --- | --- |
| 2026-10-08 | First PRD (written as a Claude Doc) |
| 2026-10-09 | PRD moved into the repo at `docs/PRD.md`. Updated to match the built UI: "Riso Villa" design and new tokens; sticker tray with tabs Desk / Chair / Gear / Zones; 3 chairs and 3 desks with sample prices; rental length 1–12 weeks (was 1/2/4/8/12); postcard summary with inline confirmation (no separate confirmation route); new FR-11 Bali light; share link format and URL clean-up; form keeps values on error; catalog trimmed to 20 items (hub and power strip removed); implementation status added. |
| 2026-10-09 | All functionality built, following the team's Next.js best-practice checklist: domain layer in `src/domain/` written test-first (Vitest, 60 tests); Zod at every trust boundary (share link, versioned storage with v1 migration, form, env); external store with selectors instead of Context state; Server Action with field messages, honeypot and `after()` webhook delivery; new FR-12 Surprise me and FR-13 Undo / Start over; postcard PNG download; WhatsApp links; roving focus and skip link; error, 404 and Open Graph pages; `CONTEXT.md` and 4 ADRs. Presets no longer ask "tap again"; they load at once with Undo. |
| 2026-10-09 | Manual end-to-end run on the production build (9 scenarios). 10 findings, 9 fixed and retested: focus loss (E2E-1, 4, 5), toast timing (E2E-2), silent summary "+" (E2E-3), phone touch targets and layout (E2E-6, 7, 10), share link lost on refresh (E2E-8). |
| 2026-10-09 | Default Next.js favicon replaced with the official monis.rent icons; the official monis wordmark (`src/components/ui/monis-logo.tsx`) is used in the header, the Open Graph image and the postcard PNG. |
