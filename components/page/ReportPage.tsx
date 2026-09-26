import type { ReportPageProps } from "@/components/contracts";
import { Breadcrumbs } from "./Breadcrumbs";
import { LabLabel } from "@/components/evidence/LabLabel";
import { SourceList } from "@/components/evidence/SourceList";
import { relatedPages } from "@/lib/pages";
import Link from "next/link";

// The shared page shell (BLUEPRINT.md §3.2): breadcrumbs, the Lab stamp, H1, then the page's own body (which
// composes the answer block, disclosure, verdict rail / figures, etc. in the order its layout variant
// requires), then related pages and sources. `surface` defaults to "report" (paper); home, the planner and
// hub pages pass surface="camera" on their own outer wrapper instead of here (see app/globals.css).
export function ReportPage({ entry, sources, children }: ReportPageProps) {
  const related = relatedPages(entry.href);
  return (
    <article className="mx-auto w-full max-w-[1392px] px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumbs label={entry.nav?.label ?? entry.title} href={entry.href} />
      <LabLabel entry={entry} />
      <h1 className="wdth-112 max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-(--color-fg) sm:text-5xl">
        {entry.h1}
      </h1>
      <div className="prose-report mt-6 max-w-3xl">{children}</div>
      {related.length > 0 ? (
        <section className="mt-14 border-t border-(--color-line) pt-8">
          <h2 className="wdth-100 text-2xl font-bold text-(--color-fg)">Related</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block border border-(--color-line) bg-(--color-surface) p-4 transition-colors hover:border-(--color-fg)/30"
                >
                  <p className="font-medium text-(--color-fg)">{item.nav?.label ?? item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-(--color-fg-2)">{item.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <SourceList sources={sources} />
    </article>
  );
}
