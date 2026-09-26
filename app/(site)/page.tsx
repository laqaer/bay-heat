import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";

const entry = findPage("/")!;

export const metadata: Metadata = pageMetadata({ path: "/", title: entry.title, description: entry.description, type: "website" });

// W0 placeholder home. W3 (thermal/figures/home) replaces this with the full hero, the exploded-garage
// section, the Can I Run It preview, the Index preview and the Lab test board (BLUEPRINT.md §4.9).
export default function HomePage() {
  return (
    <div data-surface="camera" className="bg-(--color-bg) text-(--color-fg)">
      <section className="mx-auto max-w-[1392px] px-4 py-20 sm:px-6 sm:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">Garage Climate Lab</p>
        <h1 className="wdth-118 mt-4 max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-7xl">
          One garage. Seven answers.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-(--color-fg-2)">
          A ZIP code and five taps give you the heat load, the heater that fits, the breaker it needs and the
          cost per hour — with every formula shown.
        </p>
        <Link
          href="/garage-heater-calculator"
          className="mt-8 inline-flex h-14 items-center bg-(--color-ember) px-6 text-base font-medium text-black hover:bg-[var(--ember-hover)]"
        >
          Size my garage — 60 s
        </Link>
      </section>
    </div>
  );
}
