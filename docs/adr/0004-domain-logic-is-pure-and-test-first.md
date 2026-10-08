# 0004: Domain logic is pure TypeScript and is written test-first

- Status: accepted (Vitest approved by the owner on 2026-10-09)
- Date: 2026-10-09

## Context

The rules that can cost money or trust are small but easy to break: screen slots per desk, trimming screens on a smaller desk, price totals in cents, share links, storage migration, form validation, the "Surprise me" budget.

## Decision

- All of it lives in `src/domain/` with no React and no Next.js imports.
- Each module has a `*.test.ts` next to it, run with `pnpm test` (Vitest, Node environment).
- Tests check behaviour through the public function of each module (the seam), with expected numbers worked out by hand, not copied from the code.
- Randomness and time are injected (`surpriseSetup({ random })`, `baliClock(date)`), so tests are repeatable.

## Consequences

- UI components stay thin: they read state and call actions.
- UI behaviour (focus, animation, layout) is checked manually in the browser; see the test checklist in `docs/PRD.md`.
