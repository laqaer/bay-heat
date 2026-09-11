import Link from "next/link";
import { AffiliateCallout, SafetyCallout } from "@/components/callouts";
import { JsonLd } from "@/components/json-ld";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/json-ld";
import { relatedGuides, type Guide } from "@/lib/site";

type TocItem = { id: string; label: string };

export function GuideChrome({
  guide,
  children,
  toc,
}: {
  guide: Guide;
  children: React.ReactNode;
  toc?: TocItem[];
}) {
  const related = relatedGuides(guide.href);

  return (
    <>
      <JsonLd data={[articleJsonLd(guide), breadcrumbJsonLd(guide)]} />
      <article className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--ink)]">
            Home
          </Link>
          <span aria-hidden className="px-2">
            /
          </span>
          <span className="text-[var(--ink-2)]">{guide.navLabel}</span>
        </nav>
        <header className="mt-5 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--rust)]">
            {guide.decision || "Guide"}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-[1.15] tracking-tight text-[var(--ink)] sm:text-5xl">
            {guide.h1}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--ink-2)]">{guide.description}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">Updated {guide.updated}</p>
        </header>

        <SafetyCallout />
        <AffiliateCallout />

        {toc && toc.length > 0 ? (
          <nav
            aria-label="On this page"
            className="my-8 rounded-lg border border-[var(--line)] bg-[var(--card)] px-5 py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              On this page
            </p>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {toc.map((item, index) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-[var(--ink)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--rust)]"
                  >
                    {index + 1}. {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="guide-prose max-w-3xl">{children}</div>

        <section className="mt-14 border-t border-[var(--line)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Related guides
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg border border-[var(--line)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--ink)]/20"
                >
                  <p className="font-medium text-[var(--ink)]">{item.navLabel}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-2)]">{item.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}

export function SpecTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="not-prose my-8 overflow-x-auto rounded-lg border border-[var(--line)]">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--paper-2)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="border-b border-[var(--line)] px-3 py-2.5 font-semibold text-[var(--ink)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="odd:bg-[var(--card)] even:bg-[var(--paper)]">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${index}-${cellIndex}`}
                  className="border-b border-[var(--line)] px-3 py-2.5 align-top leading-6 text-[var(--ink-2)]"
                >
                  {cellIndex === 0 ? (
                    <span className="font-medium text-[var(--ink)]">{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
