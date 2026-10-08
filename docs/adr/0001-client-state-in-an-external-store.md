# 0001: Builder state lives in a small external store, not in Context state

- Status: accepted
- Date: 2026-10-09

## Context

The setup changes on almost every tap (add a screen, change weeks). It is used by the room, the sticker tray, the price ticket and the summary page. React Context re-renders every consumer when its value changes, so putting the setup itself in Context re-renders the whole page on each tap. Redux Toolkit or Zustand would solve this, but every new library needs the owner's approval, and the state is small.

## Decision

- `src/components/builder/setup-store.ts` is a ~70 line store (`getSnapshot`, `subscribe`, `dispatch`) around the pure reducer in `src/domain/setup.ts`.
- The React Context carries only the store object, which never changes.
- Components read slices with `useSyncExternalStore` through `useSetupSelector`, `useSetup` and `useSetupReady`.
- Actions come from `useSetupActions()`. Actions that remove something (desk downsizing, delete, preset, reset, surprise) show a toast with Undo.
- The light (Bali clock) and toasts are separate small contexts, because they change on their own schedule.

## Consequences

- Business rules stay in one pure reducer that is unit-tested without React.
- Selectors must return values from the snapshot, never new objects, or React re-renders in a loop.
- If the app grows (accounts, server-side carts), moving to Redux Toolkit is straightforward: the reducer and the action names already exist.
