"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { guides } from "@/lib/site";

export function MobileNav() {
  const pathname = usePathname();
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  }, [pathname]);

  return (
    <details ref={detailsRef} className="relative lg:hidden">
      <summary className="cursor-pointer list-none rounded-md border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--ink)]">
        Guides
      </summary>
      <div className="absolute right-0 mt-2 w-64 rounded-lg border border-[var(--line)] bg-[var(--card)] p-2 shadow-[0_12px_40px_rgba(28,25,22,0.12)]">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="block rounded-md px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper-2)]"
          >
            {guide.navLabel}
          </Link>
        ))}
        <Link
          href="/about"
          className="block rounded-md px-3 py-2 text-sm text-[var(--ink)] hover:bg-[var(--paper-2)]"
        >
          About
        </Link>
      </div>
    </details>
  );
}
