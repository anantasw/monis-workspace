"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

export interface Toast {
  id: number;
  message: string;
  /** When given, the toast shows an Undo button that runs it. */
  undo?: () => void;
}

interface ToastContextValue {
  state: { toast: Toast | null };
  actions: {
    show: (message: string, undo?: () => void) => void;
    dismiss: () => void;
    /** Stop the auto-hide timer while the pointer or keyboard focus is on the toast. */
    setPaused: (paused: boolean) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Long enough to read and reach Undo; the timer also pauses on hover and focus (WCAG 2.2.1).
const TOAST_MS = 8000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [paused, setPaused] = useState(false);

  const show = useCallback((message: string, undo?: () => void) => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, undo }));
  }, []);
  const dismiss = useCallback(() => {
    setToast(null);
    setPaused(false);
  }, []);

  useEffect(() => {
    if (!toast || paused) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast, paused]);

  const value = useMemo<ToastContextValue>(
    () => ({ state: { toast }, actions: { show, dismiss, setPaused } }),
    [toast, show, dismiss],
  );
  return <ToastContext value={value}>{children}</ToastContext>;
}

export function useToast(): ToastContextValue {
  const ctx = use(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
