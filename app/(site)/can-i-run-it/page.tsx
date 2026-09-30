import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { CanIRunItForm } from "@/components/safety/CanIRunItForm";

const entry = findPage("/can-i-run-it")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

export default function Page() {
  return (
    <div data-surface="camera" className="bg-(--color-bg) text-(--color-fg)">
      <article className="mx-auto w-full max-w-[860px] px-4 py-10 sm:px-6 sm:py-14">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-(--color-fg-2)">Safety tool</p>
        <h1 className="wdth-112 mt-3 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          {entry.h1}
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-7 text-(--color-fg-2)">
          Pick your heater and answer a few taps about your garage. You get a GO, ONLY IF or NO-GO verdict with
          the exact condition and its citation — never a bare yes.
        </p>
        <div className="mt-10">
          <CanIRunItForm />
        </div>
      </article>
    </div>
  );
}
