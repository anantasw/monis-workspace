"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
      <p className="font-note text-3xl text-brand">Oh no, the room tipped over.</p>
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand">Something went wrong</h1>
      <p className="text-ink-muted">
        Your setup is saved in this browser. Try again, or go back to the builder.
        {error.digest ? <span className="mt-1 block text-xs">Error code: {error.digest}</span> : null}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-control bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-control border border-line px-4 py-3 text-sm font-semibold text-brand hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand"
        >
          Back to the builder
        </Link>
      </div>
    </main>
  );
}
