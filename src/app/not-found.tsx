import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16">
      <p className="font-note text-3xl text-brand">This desk is not in Bali.</p>
      <h1 className="font-display text-3xl font-bold tracking-tight text-brand">Page not found</h1>
      <p className="text-ink-muted">The link may be old or mistyped. Your setup is still saved in the builder.</p>
      <Link
        href="/"
        className="rounded-control bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Open the builder
      </Link>
    </main>
  );
}
