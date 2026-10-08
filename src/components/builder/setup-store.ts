import { INITIAL_SETUP, setupReducer, type Setup, type SetupAction } from "@/domain/setup";

export interface SetupSnapshot {
  setup: Setup;
  /** False until the browser has restored the share link or the saved setup. */
  ready: boolean;
}

export interface DispatchResult {
  before: Setup;
  after: Setup;
  changed: boolean;
}

export interface SetupStore {
  getSnapshot: () => SetupSnapshot;
  subscribe: (listener: () => void) => () => void;
  dispatch: (action: SetupAction) => DispatchResult;
  /** Called once after mount with what the browser restored (or null). */
  markReady: (restored: Setup | null) => void;
}

/** What the server renders: the default setup, not ready yet. */
export const SERVER_SNAPSHOT: SetupSnapshot = { setup: INITIAL_SETUP, ready: false };

/**
 * A tiny external store (no library). Components read it with useSyncExternalStore and a
 * selector, so only the parts that use a changed value re-render. The React context only
 * carries the store object, which never changes.
 */
export function createSetupStore(): SetupStore {
  let snapshot = SERVER_SNAPSHOT;
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch(action) {
      const before = snapshot.setup;
      const after = setupReducer(before, action);
      const changed = after !== before;
      if (changed) {
        snapshot = { ...snapshot, setup: after };
        emit();
      }
      return { before, after, changed };
    },
    markReady(restored) {
      snapshot = {
        setup: restored ? setupReducer(snapshot.setup, { type: "REPLACE", setup: restored }) : snapshot.setup,
        ready: true,
      };
      emit();
    },
  };
}
