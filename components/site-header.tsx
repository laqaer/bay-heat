import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { guides, site } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-md bg-[var(--ink)] text-[var(--paper)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M5 16c2.2-2.6 3.1-5.4 2.6-8.2.9 1.4 2.1 2.4 3.6 2.8-.2-2.8.6-5.4 2.4-7.6 3.4 3.3 5.2 7.1 5.4 11.2.1 2.4-.7 4.6-2.4 6.1-1.8 1.6-4.2 2.2-6.6 1.6C7.4 21.3 5.4 18.9 5 16Z"
                fill="currentColor"
                opacity="0.92"
              />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
              {site.name}
            </span>
            <span className="hidden text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] sm:block">
              Electric garage heat
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="rounded-md px-2.5 py-1.5 text-sm text-[var(--ink-2)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
            >
              {guide.navLabel}
            </Link>
          ))}
          <Link
            href="/about"
            className="rounded-md px-2.5 py-1.5 text-sm text-[var(--ink-2)] transition-colors hover:bg-[var(--paper-2)] hover:text-[var(--ink)]"
          >
            About
          </Link>
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
