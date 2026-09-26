"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_GROUPS, pagesByNavGroup } from "@/lib/pages";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Closing on Escape is a subscription to an external event, not a setState-in-effect (the React Compiler's
  // set-state-in-effect lint rule only flags a synchronous setState call in the effect body itself; calling
  // it from the keydown callback is the correct pattern). Closing on navigation is handled by onClick on each
  // link below instead of watching the pathname, for the same reason.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open menu"
        className="h-10 border border-(--color-fg)/25 px-3 text-sm text-(--color-fg)"
      >
        Menu
      </button>
      {open ? (
        <div className="fixed inset-0 z-[60] bg-(--color-bg)" role="dialog" aria-modal="true">
          <div className="flex h-14 items-center justify-between border-b border-(--color-line) px-4">
            <span className="wdth-125 text-lg font-extrabold">MENU</span>
            <button onClick={close} aria-label="Close menu" className="h-10 px-3 text-2xl leading-none">
              &times;
            </button>
          </div>
          <nav className="flex flex-col gap-6 p-6">
            <Link href="/garage-heater-calculator" onClick={close} className="text-2xl font-semibold">
              Size my garage
            </Link>
            <Link href="/can-i-run-it" onClick={close} className="text-lg">
              Can I Run It?
            </Link>
            {NAV_GROUPS.filter((g) => g.group === "heaters" || g.group === "seal").map((g) => (
              <div key={g.group}>
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-(--color-fg-2)">{g.label}</p>
                <ul className="mt-2 space-y-2">
                  {pagesByNavGroup(g.group).map((p) => (
                    <li key={p.href}>
                      <Link href={p.href} onClick={close} className="text-base text-(--color-fg)">
                        {p.nav?.label ?? p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link href="/lab" onClick={close} className="text-lg">
              The Lab
            </Link>
            <Link href="/about" onClick={close} className="text-lg">
              About
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
