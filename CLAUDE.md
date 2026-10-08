@AGENTS.md
@docs/CONVENTIONS.md

# Project rules

- Code conventions: `docs/CONVENTIONS.md` (imported above). Follow every **Must** rule; run its review checklist before you finish.
- PRD: `docs/PRD.md` (read it before building a feature, and update it when scope or behaviour changes).
- Use the design tokens from `src/app/globals.css` (`bg-brand`, `text-ink-muted`, `bg-paper`, `text-lagoon`, ...). No raw hex colours in components; in SVG use `var(--color-*)`.
- Money is stored as integer cents.
- Use the domain words in `CONTEXT.md`. Record big decisions as a new file in `docs/adr/`.
- Business rules live only in `src/domain/` (pure TypeScript, no React). Write the test first (`pnpm test`), then the code.
- Validate every outside input with the Zod schemas in `src/domain/` (URL, storage, FormData) or `src/server/env.ts` (env).
- Before you finish: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

## Design System
Read DESIGN.md before visual or UI work: it defines the fonts, colors, spacing, and
aesthetic direction. Ask the user before departing from it. When reviewing or QA-ing
UI, flag code that doesn't match DESIGN.md.
