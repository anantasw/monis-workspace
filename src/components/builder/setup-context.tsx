"use client";

import { createContext, use, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { findProduct } from "@/domain/catalog";
import { formatUsd } from "@/domain/format";
import { monitorCount, priceSetup, type PresetId, type Setup, type SetupAction } from "@/domain/setup";
import { decodeSetup, encodeSetup } from "@/domain/share-link";
import { STORAGE_KEY, parseStoredSetup, serializeForStorage } from "@/domain/storage";
import { surpriseSetup } from "@/domain/surprise";
import { useToast } from "@/components/ui/toast-context";
import { SERVER_SNAPSHOT, createSetupStore, type SetupSnapshot, type SetupStore } from "./setup-store";

const SetupStoreContext = createContext<SetupStore | null>(null);

function readFromBrowser(): Setup | null {
  try {
    const code = new URLSearchParams(window.location.search).get("s");
    if (code !== null) {
      // Drop ?s= so a refresh shows the user's own edits, not the shared setup again.
      window.history.replaceState(window.history.state, "", window.location.pathname);
      const shared = decodeSetup(code);
      if (shared) return shared;
    }
    return parseStoredSetup(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Storage can be blocked (private mode, browser settings): start fresh.
    return null;
  }
}

export function SetupProvider({ children }: { children: ReactNode }) {
  // Lazy init: one store per provider, created once.
  const [store] = useState(createSetupStore);

  useEffect(() => {
    const save = () => {
      const { setup, ready } = store.getSnapshot();
      if (!ready) return;
      try {
        window.localStorage.setItem(STORAGE_KEY, serializeForStorage(setup));
      } catch {
        // Saving is a convenience; the builder works without it.
      }
    };

    // Strict Mode runs effects twice in development; restore only once.
    if (!store.getSnapshot().ready) {
      store.markReady(readFromBrowser());
      // Save right away: a setup opened from a share link must survive a refresh,
      // because ?s= has already been removed from the address bar.
      save();
    }
    return store.subscribe(save);
  }, [store]);

  return <SetupStoreContext value={store}>{children}</SetupStoreContext>;
}

function useStore(): SetupStore {
  const store = use(SetupStoreContext);
  if (!store) throw new Error("Setup hooks must be used inside <SetupProvider>");
  return store;
}

/**
 * Read one slice of the setup state. The component re-renders only when that slice changes.
 * The selector must return a value from the snapshot (not a new object or array), or React loops.
 */
export function useSetupSelector<T>(selector: (snapshot: SetupSnapshot) => T): T {
  const store = useStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getSnapshot()),
    () => selector(SERVER_SNAPSHOT),
  );
}

export const useSetup = () => useSetupSelector((s) => s.setup);
export const useSetupReady = () => useSetupSelector((s) => s.ready);
export const useLastChangedId = () => useSetupSelector((s) => s.lastChangedId);

export interface SetupActions {
  selectDesk: (id: string) => void;
  selectChair: (id: string | null) => void;
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  /** Remove every unit of an item, with Undo. */
  deleteItem: (id: string) => void;
  setWeeks: (weeks: number) => void;
  loadPreset: (id: PresetId, name: string) => void;
  surprise: (budgetCents: number) => void;
  reset: () => void;
  shareUrl: () => string;
}

/** Stable action functions. Changes that remove something offer Undo through a toast. */
export function useSetupActions(): SetupActions {
  const store = useStore();
  const {
    actions: { show },
  } = useToast();

  return useMemo<SetupActions>(() => {
    const dispatch = (action: SetupAction) => store.dispatch(action);
    const undoTo = (setup: Setup) => () => {
      store.dispatch({ type: "REPLACE", setup });
    };
    const hasExtras = (setup: Setup) => Object.keys(setup.items).length > 0;

    return {
      selectDesk(id) {
        const { before, after, changed } = dispatch({ type: "SELECT_DESK", id });
        const removed = monitorCount(before.items) - monitorCount(after.items);
        if (changed && removed > 0) {
          const desk = findProduct(id);
          show(
            `${desk?.name ?? "This desk"} fits ${desk?.meta?.monitorSlots ?? 2} screens, so ${removed} ${removed === 1 ? "screen was" : "screens were"} removed.`,
            undoTo(before),
          );
        }
      },
      selectChair: (id) => void dispatch({ type: "SELECT_CHAIR", id }),
      addItem: (id) => void dispatch({ type: "ADD_ITEM", id }),
      removeItem: (id) => void dispatch({ type: "REMOVE_ITEM", id }),
      deleteItem(id) {
        const { before, changed } = dispatch({ type: "DELETE_ITEM", id });
        if (changed) show(`${findProduct(id)?.name ?? "Item"} removed.`, undoTo(before));
      },
      setWeeks: (weeks) => void dispatch({ type: "SET_WEEKS", weeks }),
      loadPreset(id, name) {
        const { before, changed } = dispatch({ type: "LOAD_PRESET", id });
        if (changed && hasExtras(before)) show(`Loaded ${name}.`, undoTo(before));
      },
      surprise(budgetCents) {
        const before = store.getSnapshot().setup;
        const next = surpriseSetup({ budgetCents, weeks: before.weeks, random: Math.random });
        store.dispatch({ type: "REPLACE", setup: next });
        show(`Surprise! This setup costs ${formatUsd(priceSetup(next).weeklyCents)} a week.`, undoTo(before));
      },
      reset() {
        const { before, changed } = dispatch({ type: "RESET" });
        if (changed) show("Started over.", undoTo(before));
      },
      shareUrl() {
        const url = new URL(window.location.href);
        url.pathname = "/";
        url.search = `?s=${encodeSetup(store.getSnapshot().setup)}`;
        url.hash = "";
        return url.toString();
      },
    };
  }, [store, show]);
}
