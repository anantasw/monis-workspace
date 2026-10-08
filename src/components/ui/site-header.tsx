import Link from "next/link";
import { MonisLogo } from "./monis-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2.5 rounded-control focus-visible:outline-2 focus-visible:outline-brand">
        <MonisLogo className="h-6 w-auto text-black" />
        <span className="text-sm font-medium text-ink-muted">Workspace Builder</span>
      </Link>
      <a
        href="https://www.monis.rent/"
        className="text-sm font-medium text-ink-muted underline-offset-4 hover:text-brand hover:underline"
      >
        monis.rent shop
      </a>
    </header>
  );
}
