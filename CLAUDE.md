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

## Definition of done

When you finish writing or changing code, do these steps in order before you say the work is done or commit:

1. **Checks.** Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. All must pass. (A Stop hook in `.claude/settings.json` also runs lint, typecheck and tests when code changed and blocks the stop if they fail. It is a safety net, not a replacement for this step.)
2. **Review.** Review your own diff (`git diff` plus new files) with `/code-review`, and go through the review checklist at the end of `docs/CONVENTIONS.md` rule by rule.
3. **Fix.** Fix every finding that breaks a **Must** rule. List **Prefer** findings without blocking on them.
4. **Docs.** Update `docs/PRD.md` (and its change log), `docs/adr/` or `CONTEXT.md` when behaviour, a decision or a domain word changed.
5. **Report.** Tell the user, in short: what changed, the check results, the review findings and what you fixed, and anything left open. Commit only after that, and only when the user asks.

## Design System
Read DESIGN.md before visual or UI work: it defines the fonts, colors, spacing, and
aesthetic direction. Ask the user before departing from it. When reviewing or QA-ing
UI, flag code that doesn't match DESIGN.md.
