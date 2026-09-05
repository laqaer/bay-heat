import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--rust)]">
        404
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        That page is not in the shop.
      </h1>
      <p className="mt-4 text-[var(--ink-2)]">
        The URL may have changed, or it never existed. Start from the decision hub.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="text-[var(--rust)] underline decoration-[var(--rust)]/30 underline-offset-4"
        >
          Back to BayHeat Guide
        </Link>
      </p>
    </div>
  );
}
