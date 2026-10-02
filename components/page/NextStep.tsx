import Link from "next/link";
import type { Route } from "next";

export function NextStep({ href, label, blurb }: { href: Route; label: string; blurb: string }) {
  return (
    <div className="my-10 border border-(--color-line) bg-(--color-surface) p-5">
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-(--color-fg-2)">Next step</p>
      <Link href={href} className="mt-2 block text-lg font-semibold text-(--color-fg) hover:text-(--color-link)">
        {label} &rarr;
      </Link>
      <p className="mt-1 text-sm text-(--color-fg-2)">{blurb}</p>
    </div>
  );
}
