import Link from "next/link";
import { affiliateDisclosure, electricalDisclaimer, guides, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--paper-2)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            {site.name}
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--ink-2)]">
            {site.tagline} Published by {site.publisher}. Domain: {site.domain}.
          </p>
          <p className="mt-4 text-sm">
            <a
              className="text-[var(--rust)] underline decoration-[var(--rust)]/30 underline-offset-4 hover:decoration-[var(--rust)]"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Guides
          </p>
          <ul className="mt-3 space-y-2">
            {guides.map((guide) => (
              <li key={guide.href}>
                <Link
                  href={guide.href}
                  className="text-sm text-[var(--ink-2)] hover:text-[var(--ink)]"
                >
                  {guide.navLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Site
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-[var(--ink-2)] hover:text-[var(--ink)]">
                About &amp; editorial standards
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-[var(--ink-2)] hover:text-[var(--ink)]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/" className="text-[var(--ink-2)] hover:text-[var(--ink)]">
                Decision hub
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-6 text-xs leading-5 text-[var(--muted)] sm:px-6">
          <p>
            <strong className="font-semibold text-[var(--ink-2)]">Affiliate disclosure. </strong>
            {affiliateDisclosure}
          </p>
          <p>
            <strong className="font-semibold text-[var(--ink-2)]">Safety. </strong>
            {electricalDisclaimer}
          </p>
          <p>© {new Date().getFullYear()} {site.publisher}. {site.name}.</p>
        </div>
      </div>
    </footer>
  );
}
