import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { BRAND, PUBLISHER, CONTACT_EMAIL } from "@/lib/site";
import { EDITOR_NAME, EDITOR_URL } from "@/lib/env.public";

const entry = findPage("/about")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

export default function Page() {
  return (
    <ReportPage entry={entry} sources={[]}>
      <p>
        {BRAND} is published by {PUBLISHER}. We size garage heaters from your garage&apos;s own dimensions and
        insulation, not a generic chart, and we show the source behind every figure we print.
      </p>

      <h2>What the model is</h2>
      <p>
        Every heat-loss, circuit-size, and fuel-cost number on the site comes from the same sizing engine, run
        live on the page you&apos;re reading — the same math whether you use the free calculator or read a
        guide. A number we don&apos;t compute ourselves carries a source citation you can click open.
      </p>
      <p>
        <Link href="/how-we-work">How we work</Link> lists the seven pledges behind that model, including how
        the site makes money and who checks a page before it&apos;s marked reviewed.
      </p>

      <h2>Who checks it</h2>
      {EDITOR_NAME ? (
        <p>
          {BRAND} is edited by {EDITOR_URL ? <a href={EDITOR_URL}>{EDITOR_NAME}</a> : EDITOR_NAME}. A page
          that states an electrical or gas code rule also carries a licensed reviewer&apos;s name, license
          number, and the date they verified it, once that review has happened.
        </p>
      ) : (
        <p>
          BayHeat doesn&apos;t have a named editor posted yet. Every page is drafted with AI assistance,
          computed against the sizing model, and reviewed by the BayHeat editorial desk — not a named person,
          and not a review that hasn&apos;t actually happened. <Link href="/how-we-work">How we work</Link>{" "}
          shows the exact line that runs on every page.
        </p>
      )}

      <h2>Reach us</h2>
      <p>
        Send corrections, questions, or a heater we should look at to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. What we do and don&apos;t collect from your
        visit is on the <Link href="/privacy">privacy page</Link>.
      </p>
    </ReportPage>
  );
}
