# Code conventions

How code is written in this repo. Every rule below is already followed by the current code; the examples point to real files. When you add code, follow the same rules. When a rule must be broken, write the reason in a comment next to the code.

Related documents: [PRD](PRD.md) (what we build), [DESIGN.md](../DESIGN.md) (how it looks), [CONTEXT.md](../CONTEXT.md) (domain words), [adr/](adr/) (why the architecture is like this).

Rules marked **must** are blockers in review. Rules marked **prefer** are suggestions: mention them, do not block on them.

---

## 1. Folder structure and layers

| Folder | Holds | May import from |
| --- | --- | --- |
| `src/domain/` | Business rules: catalog, setup reducer, prices, share links, storage format, form schema, Bali time. Pure TypeScript. | `zod` and other `src/domain/` files only |
| `src/server/` | Server-only code: validated env, rent request delivery | `src/domain/` |
| `src/app/` | Routes, layouts, the Server Action, metadata files | everything |
| `src/components/` | React components, grouped by feature (`builder/`, `preview/`, `summary/`, `ui/`) | `src/domain/`, other components |

- **Must:** no React, Next.js or browser API inside `src/domain/`. Example: `src/domain/bali-time.ts` takes a `Date` as a parameter instead of calling `new Date()` itself.
- **Must:** every file in `src/server/` starts with `import "server-only";`.
- **Must:** no barrel files (`index.ts` that re-exports). Import from the real file with a literal path: `@/domain/setup`, not `@/domain`.
- **Prefer:** the `@/` alias over long relative paths (`../../`).

## 2. TypeScript

- **Must:** no `any`, no `!` (non-null assertion), and no `as` cast without a comment that says why it is safe. The one cast today is in `src/components/summary/postcard-image.ts` (`cloneNode` returns `Node`).
- **Must:** values from outside are `unknown` until a Zod schema has parsed them (see section 3).
- **Must:** no `enum`. Use a union of string literals, or a list with `as const satisfies`. Example: `TABS` in `src/components/builder/sticker-tray.tsx`, `PRESETS` in `src/domain/catalog.ts`.
- **Must:** a `switch` over a union ends with a `never` check, so a new case is a compile error. Example: `setupReducer` in `src/domain/setup.ts`.
- **Must:** derive types from schemas and constants, do not write them twice: `z.infer<typeof setupInputSchema>`, `(typeof DELIVERY_AREAS)[number]`.
- **Prefer:** `interface` for object shapes and component props; `type` for unions and computed types.
- **Prefer:** `.at(i)` for array reads that may be out of range; it returns `T | undefined`.

## 3. Trust boundaries and validation

Data we do not control: URL (`?s=` share code), browser storage, `FormData`, environment variables, webhook responses.

- **Must:** parse each one with a Zod schema at the point where it enters:
    - share code: `shareCodeSchema` in `src/domain/share-link.ts`
    - browser storage: `parseStoredSetup` in `src/domain/storage.ts`
    - rent form: `makeRentRequestSchema` in `src/domain/rent-request.ts`
    - env: `envSchema` in `src/server/env.ts`, loaded at server start by `src/instrumentation.ts`
- **Must:** after the shape check, business rules run through the same reducer: `normalizeSetup()` replays any untrusted setup through `setupReducer`. Never trust a setup only because it has the right shape.
- **Must:** saved data has a version and a migration for older versions (`STORAGE_VERSION` in `src/domain/storage.ts`).
- **Must:** a bad env value stops the build or the server with a clear message; never fall back silently.
- **Must:** only the values a client component needs cross from server to client (the summary page passes `whatsappNumber`, not the env object).

## 4. Next.js

- **Must:** Server Components by default. Put `"use client"` on the smallest interactive component, never on a page or layout. (`error.tsx` is the exception: Next.js requires it to be a Client Component.)
- **Must:** a `"use server"` file exports only async functions. Shared constants live in `src/domain/` (see `DELIVERY_AREAS`).
- **Must:** a Server Action validates its `FormData` itself and returns a typed state; it never trusts the browser's validation. There is no login, so there is no auth check; if accounts are added, the action must check the session and the owner of the data.
- **Must:** with Cache Components on, nothing reads the time, `Math.random`, the URL or browser storage during render. Read them in an effect or an event handler after mount. Example: `LightProvider` reads the Bali clock in an effect; the server renders a fixed placeholder.
- **Must:** side effects that the user does not wait for (webhooks, logs) run in `after()`. Example: `submitRentRequest` in `src/app/actions.ts`.
- **Must:** in Next.js 15+, `params` and `searchParams` are Promises and must be awaited (no route uses them yet).
- **Must:** use file conventions for special pages and assets: `error.tsx`, `not-found.tsx`, `opengraph-image.tsx`, `icon*.png`, `apple-icon.png`, and `metadata` exports with a title template.
- **Must:** read the docs bundled in `node_modules/next/dist/docs/` before using an API you are not sure about (see `AGENTS.md`).

## 5. React

**State**

- **Must:** one owner per piece of state. The setup lives in the external store (`src/components/builder/setup-store.ts`); components read it, they do not copy it into `useState`.
- **Must:** compute derived values during render (`priceSetup(setup)`), not in an effect.
- **Must:** a `useSyncExternalStore` selector returns a value from the snapshot, never a new object or array, or React loops.
- **Must:** use lazy initial state for values that are expensive or must be created once: `useState(createSetupStore)`.
- **Must:** use the functional form when the new state depends on the old: `setToast((prev) => …)`.

**Effects and refs**

- **Must:** every effect that starts a timer, listener or subscription returns a cleanup.
- **Must:** no objects or arrays in effect dependencies.
- **Must:** no synchronous `setState` in an effect body and no writes to `ref.current` during render (the lint rules `react-hooks/set-state-in-effect` and `react-hooks/refs` enforce this). For a one-time flag, use `useReducer(() => true, false)`.
- **Must:** effects that must run only once, also under Strict Mode in development, check a guard first. Example: `SetupProvider` restores the saved setup only while the store is not `ready`.

**Context and composition**

- **Must:** a context value has the shape `{ state, actions, meta? }`, and its hook throws a clear error outside the provider. Examples: `useToast`, `useLight`.
- **Must:** React 19 style: `use(Context)` instead of `useContext`, `<Context value={…}>` instead of `.Provider`, `ref` as a normal prop instead of `forwardRef` (see `Scene`).
- **Must:** do not define a component inside another component; move it to module level.
- **Must:** handler props receive values, not events: `onSelect(id)`, `onAdd(id)`.
- **Must:** no new boolean props that change a component's structure. Make explicit variants instead: `RadioSticker` and `ItemSticker` instead of one `Sticker` with `isRadio`.
- **Must:** conditions on numbers use a ternary, not `&&` (`{count > 0 ? … : null}`), so `0` is never rendered.
- **Prefer:** `children` over render props, except when the parent must pass data (the `Field` render function in `rent-form.tsx` passes ids for a11y).
- **Prefer:** no `useMemo`/`useCallback` without a reason (stable context values and action objects are good reasons).

## 6. Forms

- **Must:** one schema for browser and server (`src/domain/rent-request.ts`); types come from it (`RentField`).
- **Must:** use `useActionState` with the Server Action; send the typed values back on error and remount the form with them, because React resets a form after its action.
- **Must:** every input has a visible `<label>`, the right `type`, `inputMode` and `autoComplete`, and never blocks paste.
- **Must:** errors use `role="alert"`, the field gets `aria-invalid` and `aria-describedby` that points to its message. The message says how to fix the problem ("Please choose today or a later date.").
- **Must:** after a failed submit, focus the first invalid field; after success, focus the confirmation heading.
- **Must:** the submit button shows a pending state and names the outcome ("Rent this setup for $38/week", not "Submit").

## 7. Accessibility and interaction

- **Must:** clickable things are `<button>` or `<a>`, never `<div onClick>`. Clickable SVG groups get `role="button"`, `tabIndex={0}`, an `aria-label` and Enter/Space handling (see `Placed` in `scene.tsx`).
- **Must:** radio groups and tab lists use roving focus: one Tab stop per group, arrow keys move and select, Home/End jump (`onRovingKeyDown` in `src/components/ui/roving-focus.ts`).
- **Must:** when a control can become unavailable while it has focus, use `aria-disabled` and ignore the click, instead of `disabled`, so focus is not lost. Example: the "+" stepper at the screen limit.
- **Must:** when an element with focus disappears (a deleted row), move focus to a sensible neighbour or heading.
- **Must:** visible focus everywhere (`focus-visible:` styles); never `outline: none` without a replacement.
- **Must:** touch targets are at least 44 × 44 px on phones (`min-h-11`, `size-11`), and may be compact from `lg:` up.
- **Must:** icon-only buttons have an `aria-label`; decorative SVG has `aria-hidden="true"`.
- **Must:** actions that remove something can be undone (toast with Undo). The toast pauses its timer on hover and focus.
- **Must:** no `transition: all` (`transition-all`); list the properties. Respect `prefers-reduced-motion` (handled globally in `globals.css`).
- **Must:** numbers, money and dates use `Intl` (`formatUsd`, `baliClock`); never format by hand.
- **Must:** live changes that a screen reader user would miss are announced with `aria-live="polite"` (setup summary, toasts, "Link copied").

## 8. Styling

- **Must:** use design tokens from `@theme` in `src/app/globals.css` (`bg-brand`, `text-ink-muted`, `bg-paper`, `bg-sun`, `rounded-control`). No raw hex colours in components; inside SVG use `var(--color-*)`.
- **Allowed exception:** where CSS variables do not exist, use the literal value and say so in a comment: `opengraph-image.tsx` (ImageResponse), the viewport `themeColor`, and the official logo colour (`#000`). The postcard canvas reads the tokens at runtime with `getComputedStyle`.
- **Must:** follow [DESIGN.md](../DESIGN.md) for fonts, colours, radius and motion. The official monis logo and icons are used unchanged.
- **Prefer:** Tailwind utilities in the component; a named class in `globals.css` only for things utilities cannot express (keyframes, the grain texture, the custom select chevron).

## 9. Money, time and randomness

- **Must:** money is integer cents everywhere; format only at the edge with `formatUsd`.
- **Must:** time comes from `src/domain/bali-time.ts` (Bali time, `Asia/Makassar`), with the `Date` passed in.
- **Must:** randomness is injected (`surpriseSetup({ random })`), so tests can use a seeded random.

## 10. Performance

- **Must:** no sequential `await` for work that does not depend on each other; run it in parallel.
- **Must:** no barrel files (section 1), literal import paths.
- **Must:** never call `.sort()`, `.reverse()` or `.splice()` on props or state; copy first (`[...list]`, `toSorted`).
- **Must:** repeated lookups use a `Map` or `Set` (`findProduct` in `src/domain/catalog.ts`).
- **Must:** heavy work runs only on user action (the postcard PNG is built on click).
- **Prefer:** no new runtime dependency when a few lines of platform code do the job (ADR 0001, 0002).

## 11. Testing

- **Must:** business rules are written test-first: write a failing test in `src/domain/*.test.ts`, then the code (`pnpm test`).
- **Must:** test behaviour through the module's public function (the seam), not private helpers.
- **Must:** expected values are worked out by hand in the test, not copied from the code (`// $6 + $6 + 2 × $8 + $3 = $31 per week`).
- **Must:** no tautological tests (a test that recomputes the answer with the same code).
- **Must:** UI flows that tests do not cover are checked by hand with the end-to-end checklist in [PRD section 9](PRD.md).

## 12. Naming, comments and documents

- **Must:** use the domain words from [CONTEXT.md](../CONTEXT.md): setup, item, screen, zone, preset, rent request. Avoid cart, order, checkout in code.
- **Must:** identifiers, comments and docs are in plain English.
- **Must:** comments explain *why*, not *what* (`// aria-disabled (not disabled): the button keeps keyboard focus…`).
- **Must:** a decision that is hard to reverse (state approach, validation, delivery channel, a new dependency) gets a new file in [docs/adr/](adr/).
- **Must:** a change in scope or behaviour updates [docs/PRD.md](PRD.md) and its change log.

## 13. Git

- **Must:** small commits, one topic each, with [Conventional Commits](https://www.conventionalcommits.org/) prefixes: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, with an optional scope (`feat(domain): …`).
- **Must:** every commit passes `pnpm typecheck`.

---

## Review checklist

Run before every merge:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

A Stop hook (`.claude/hooks/check-on-stop.sh`, set up in `.claude/settings.json`) runs lint, typecheck and tests automatically whenever an AI coding session stops with changed code. It blocks the stop when a check fails.

Then check:

- [ ] No `any`, `!`, or unexplained `as`; no `enum`; unions end with a `never` check.
- [ ] Every new outside input is parsed with Zod; untrusted setups go through `normalizeSetup`.
- [ ] No `"use client"` on pages or layouts; `"use server"` files export only async functions; server modules import `server-only`.
- [ ] Nothing reads time, random, URL or storage during render.
- [ ] Effects clean up; no object dependencies; no copied server or store data in `useState`.
- [ ] New interactive elements are buttons or links with labels, keyboard support, visible focus and 44 px targets on phones.
- [ ] Removing things can be undone; focus never falls to the page body.
- [ ] Colours come from tokens; text follows DESIGN.md.
- [ ] Domain changes have tests written first; PRD, ADR and CONTEXT.md are updated when needed.
