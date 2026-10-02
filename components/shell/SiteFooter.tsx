import Link from "next/link";
import { BRAND, CONTACT_EMAIL, DISCLOSURE_FOOTER, MODEL_VERSION, PRICES_AS_OF, PUBLISHER } from "@/lib/site";
import { POSTAL_ADDRESS } from "@/lib/env.public";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-(--color-line) bg-(--color-surface)">
      <div className="mx-auto grid max-w-[1392px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">The spine</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/garage-heater-calculator" className="text-(--color-fg) hover:text-(--color-link)">
                Size it
              </Link>
            </li>
            <li>
              <Link href="/240v-garage-heater" className="text-(--color-fg) hover:text-(--color-link)">
                Power it
              </Link>
            </li>
            <li>
              <Link href="/cost-to-heat-a-garage" className="text-(--color-fg) hover:text-(--color-link)">
                Price it
              </Link>
            </li>
            <li>
              <Link href="/how-to-insulate-a-garage" className="text-(--color-fg) hover:text-(--color-link)">
                Fix it
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">Tools</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/garage-heater-calculator" className="text-(--color-fg) hover:text-(--color-link)">
                Planner
              </Link>
            </li>
            <li>
              <Link href="/can-i-run-it" className="text-(--color-fg) hover:text-(--color-link)">
                Can I Run It?
              </Link>
            </li>
            <li>
              <Link href="/cost-to-heat-a-garage" className="text-(--color-fg) hover:text-(--color-link)">
                Garage Heat Index
              </Link>
            </li>
            <li>
              <Link href="/garage-heater-calculator/methodology" className="text-(--color-fg) hover:text-(--color-link)">
                Methodology
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">The Lab</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/lab" className="text-(--color-fg) hover:text-(--color-link)">
                Lab
              </Link>
            </li>
            <li>
              <Link href="/lab/reports/bh-001-the-4x-problem" className="text-(--color-fg) hover:text-(--color-link)">
                BH-001
              </Link>
            </li>
            <li>
              <Link href="/lab/notebook" className="text-(--color-fg) hover:text-(--color-link)">
                Notebook &amp; corrections
              </Link>
            </li>
            <li>
              <Link href="/how-we-work" className="text-(--color-fg) hover:text-(--color-link)">
                How we work
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--color-fg-2)">Company</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="text-(--color-fg) hover:text-(--color-link)">
                About
              </Link>
            </li>
            <li>
              <Link href="/how-we-work#money" className="text-(--color-fg) hover:text-(--color-link)">
                How we make money
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-(--color-fg) hover:text-(--color-link)">
                Privacy
              </Link>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--color-fg) hover:text-(--color-link)">
                {CONTACT_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-(--color-line)">
        <div className="mx-auto max-w-[1392px] space-y-2 px-4 py-6 text-xs leading-5 text-(--color-fg-2) sm:px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em]">
            Model v{MODEL_VERSION} · Prices as of {PRICES_AS_OF} · Last correction —
          </p>
          <p>{DISCLOSURE_FOOTER}</p>
          <p>
            {BRAND} is published by {PUBLISHER}
            {POSTAL_ADDRESS ? `, ${POSTAL_ADDRESS}` : ""}.
          </p>
        </div>
      </div>
    </footer>
  );
}
