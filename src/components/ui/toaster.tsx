"use client";

import { useToast } from "./toast-context";

export function Toaster() {
  const {
    state: { toast },
    actions: { dismiss, setPaused },
  } = useToast();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4 lg:bottom-6"
    >
      {toast ? (
        <div
          key={toast.id}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
          }}
          className="toast-in pointer-events-auto flex max-w-md items-center gap-3 rounded-control bg-brand py-2.5 pl-4 pr-2 text-sm text-white shadow-lift"
        >
          <span>{toast.message}</span>
          {toast.undo ? (
            <button
              type="button"
              className="shrink-0 rounded-control px-2.5 py-1.5 font-semibold text-sun hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-sun"
              onClick={() => {
                toast.undo?.();
                dismiss();
              }}
            >
              Undo
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Close message"
            onClick={dismiss}
            className="grid size-8 shrink-0 place-items-center rounded-control text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-sun"
          >
            <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
