# Monis Workspace Builder

An interactive tool for [monis.rent](https://www.monis.rent/): design your Bali workspace in a picture of a real room (desk, chair, screens, lamp, plants, a coffee corner), see the weekly price change as you go, then send a rent request.

- Live URL: https://monis-workspace-green.vercel.app/
- Product requirements: [docs/PRD.md](docs/PRD.md)
- Design system: [DESIGN.md](DESIGN.md)
- Domain glossary: [CONTEXT.md](CONTEXT.md)
- Code conventions: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- Decisions: [docs/adr/](docs/adr/)

## What you can do

- Pick one of 3 desks and 3 chairs (or no chair), add screens, desk gear and room zones. Desk size limits the number of screens.
- Start from a preset, or press **Surprise me** with a weekly budget.
- Watch the room follow the real time in Bali (morning, sunset, night), or pick the light yourself.
- Share your setup as a link, download it as a postcard PNG, or ask monis.rent on WhatsApp.
- Send a rent request. Every change that removes something can be undone.

## Write-up

**Approach.** The brief asked for something fun, not a catalog, so I made the room itself the product. The question I designed for was "does this feel like *my* desk in Bali?" The room is drawn as a two-ink risograph print. Its light follows the real time in Bali, so morning sun, a pink sunset or a lamp at night show up on their own. You pick items from die-cut stickers, and each one drops into the room. Around the room the UI stays quiet and uses monis.rent's own colours, font and logo, so it feels like part of their shop. I wrote a PRD and a design system first ([docs/PRD.md](docs/PRD.md), [DESIGN.md](DESIGN.md)). Then I built the business rules test-first: screen slots per desk, prices in cents, share links. Last, I ran a manual end-to-end pass on the production build, which found and fixed 9 issues (listed in the PRD).

**Tech choices.**
- **Next.js 16 + React 19 + Tailwind 4**, deployed on Vercel. Both pages are prerendered as static HTML; the only server code is one Server Action for the rent request.
- **Few dependencies.** Only Zod (validation) and Vitest (tests, dev only) are added. All art is hand-written inline SVG. Animation is CSS and the Web Animations API. State is a ~70-line store on `useSyncExternalStore`. The postcard PNG is made with a canvas. This keeps the bundle small and nothing breaks on upgrades.
- **Rules in one place.** `src/domain/` is pure TypeScript with 60 tests. Every outside input (URL, browser storage, form, env) goes through Zod and the same reducer, so a hand-edited link cannot create an impossible setup.
- **No backend to run.** A rent request is validated on the server, then delivered after the response (`after()`) to an optional webhook. WhatsApp is a second channel. Decisions are recorded in [docs/adr/](docs/adr/).

**With more time I would:**
- Connect real stock and prices from monis.rent, and replace the 6 sample-price items with real products.
- Add Playwright end-to-end tests (the manual scenarios are already written in the PRD) and run them in CI on Chrome, Firefox and WebKit.
- Let users drag items to their own spot in the room, and add more room styles (villa, coworking, garden).
- Store rent requests (a small database or the client's CRM), add a rate limit, and send a confirmation email.

## Stack

- Next.js 16 (App Router, Cache Components) + React 19 + TypeScript
- Tailwind CSS 4 (design tokens in `src/app/globals.css`)
- Zod 4 for every trust boundary, Vitest 5 for domain tests
- Deployed on Vercel

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Optional settings go in `.env.local` (see [.env.example](.env.example)):

| Variable | Use |
| --- | --- |
| `RENT_REQUEST_WEBHOOK_URL` | HTTPS endpoint that receives each rent request as JSON |
| `MONIS_WHATSAPP_NUMBER` | Digits only, country code first; turns on the WhatsApp buttons |

A wrong value stops the server or the build with a clear message.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript, no output files |
| `pnpm test` | Domain and store tests (Vitest) |
| `pnpm test:watch` | Tests in watch mode |

## Folder structure

```
CONTEXT.md, DESIGN.md, docs/   # glossary, design system, PRD, ADRs
src/
  app/                         # routes, Server Action, error/404, OG image, globals.css
  domain/                      # pure business logic + *.test.ts (no React)
  server/                      # server-only: env validation, rent request delivery
  components/
    builder/                   # store, contexts, builder UI
    preview/                   # the room (SVG scene and item art)
    summary/                   # postcard, table, rent form, PNG export
    ui/                        # header, toasts, keyboard helpers
```
