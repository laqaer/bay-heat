import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { Callout } from "@/components/ui/Callout";
import { CONTACT_EMAIL } from "@/lib/site";

const entry = findPage("/lab/notebook")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

export default function Page() {
  return (
    <ReportPage entry={entry} sources={[]}>
      <p>
        Every model version, price refresh and correction gets a dated line here, in the order it happened.
        Nothing is added after the fact and nothing is backdated.
      </p>

      <h2>Log</h2>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Date</th>
              <th className="py-2 font-normal">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 pr-3 font-mono whitespace-nowrap">2026-10-02</td>
              <td className="py-3">Model v1.0.0 released.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm text-(--color-fg-2)">This is the first entry. There is no earlier history to show.</p>

      <h2>Our correction policy</h2>
      <p>
        We acknowledge a reported problem within 24 hours. We fix it within 72 hours — or within 24 hours if
        it&apos;s a safety issue. Either way, the fix gets its own dated line above once it ships; a correction
        is never made quietly.
      </p>

      <Callout variant="note">
        Found something wrong on the site — a stale number, a broken link, a claim that doesn&apos;t hold up?
        Use the &quot;Report a problem&quot; link on any page&apos;s Lab stamp, or write to{" "}
        <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>.
      </Callout>
    </ReportPage>
  );
}
