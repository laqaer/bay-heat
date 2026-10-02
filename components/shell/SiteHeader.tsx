import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { MobileMenu } from "@/components/shell/MobileMenu";
import { pagesByNavGroup } from "@/lib/pages";

function NavDropdown({ label, group }: { label: string; group: "heaters" | "seal" }) {
  const items = pagesByNavGroup(group);
  return (
    <div className="group relative">
      <button className="wdth-75 flex items-center gap-1 px-2.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-(--color-fg-2) hover:text-(--color-fg)">
        {label}
        <span aria-hidden className="text-[10px]">
          &#9662;
        </span>
      </button>
      <div className="invisible absolute left-0 top-full z-50 w-64 border border-(--color-line) bg-(--color-surface) py-2 opacity-0 shadow-[0_12px_40px_rgba(0,0,0,0.12)] transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 text-sm text-(--color-fg) hover:bg-(--color-surface-2)"
          >
            {item.nav?.label ?? item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--color-line) bg-(--color-bg)/96">
      <div className="mx-auto flex h-14 max-w-[1392px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Wordmark />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          <Link
            href="/garage-heater-calculator"
            className="wdth-75 px-2.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-(--color-fg-2) hover:text-(--color-fg)"
          >
            Planner
          </Link>
          <NavDropdown label="Heaters" group="heaters" />
          <NavDropdown label="Seal &amp; insulate" group="seal" />
          <Link
            href="/can-i-run-it"
            className="wdth-75 px-2.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-(--color-fg-2) hover:text-(--color-fg)"
          >
            Can I Run It?
          </Link>
          <Link
            href="/lab"
            className="wdth-75 px-2.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-(--color-fg-2) hover:text-(--color-fg)"
          >
            The Lab
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/garage-heater-calculator"
            className="hidden h-10 items-center bg-(--color-ember) px-4 text-sm font-medium text-black hover:bg-[var(--ember-hover)] lg:inline-flex"
          >
            Size my garage
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
