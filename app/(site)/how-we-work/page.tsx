import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { Callout } from "@/components/ui/Callout";
import { aiLine } from "@/lib/site";

const entry = findPage("/how-we-work")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

export default function Page() {
  const exampleLine = aiLine(null);
  const electricalExampleLine = aiLine("electrical");

  return (
    <ReportPage entry={entry} sources={[]}>
      <p>
        BayHeat sizes heaters with the same model on every page, cites the number behind every claim, and
        says plainly when something isn&apos;t confirmed yet. These seven pledges are how we hold that line.
      </p>

      <h2>Seven pledges</h2>
      <ol>
        <li>
          <strong>Open model.</strong> The heat-loss and circuit-sizing calculations that size your garage run
          live on the page you&apos;re reading, not a table we typed in once and forgot to update.
        </li>
        <li>
          <strong>Cite everything.</strong> A number that isn&apos;t computed live carries a source — a
          manufacturer manual, a code section, or a fuel-cost table. Click a number to see where it came from.
        </li>
        <li>
          <strong>Never fabricate.</strong> If we&apos;re not confident in a figure, we mark it unverified and
          hide any sentence that depends on it, rather than publish a guess dressed up as a fact.
        </li>
        <li>
          <strong>Disclose money clearly.</strong> A page with a paid link says so directly above that link,
          not in a footnote you have to hunt for.
        </li>
        <li>
          <strong>Correct fast.</strong> Every page carries a revision number and a last-checked date in its
          Lab stamp, so you can see when something last changed.
        </li>
        <li>
          <strong>A licensed reviewer checks electrical and gas rules.</strong> Code citations and circuit
          sizing are built from the published code text; a licensed electrician or gas technician signs off
          before a page is marked reviewed. See where that stands today, below.
        </li>
        <li>
          <strong>No invented personas.</strong> We don&apos;t publish a byline for a person who doesn&apos;t
          exist. Until a named editor is posted, the byline reads &quot;BayHeat editorial desk.&quot;
        </li>
      </ol>

      <h2 id="money">How BayHeat makes money</h2>
      <p>
        BayHeat is free to read. We earn a commission when you buy a heater through a link on the site — as an
        Amazon Associate, and through a small number of other retailer and installer-quote partners. The price
        you pay doesn&apos;t change either way.
      </p>
      <p>
        That commission never decides which heater we recommend or what a verdict says. The sizing math runs
        the same way whether or not a class has a paid link attached, and every page names at least one thing
        not to buy alongside what to buy.
      </p>

      <h2>Who checks each page</h2>
      <p>
        Every page opens with a Lab stamp: a small expandable line naming its revision, its last-checked date,
        and the model version behind its numbers. Opening it shows a sentence built the same way on every
        page. Today, on a page that makes no electrical or gas claim, it reads:
      </p>
      <Callout variant="note">
        <p className="font-mono text-xs">{exampleLine}</p>
      </Callout>
      <p>A page that states an electrical or gas code rule shows a second line. Today, most of those read:</p>
      <Callout variant="note">
        <p className="font-mono text-xs">{electricalExampleLine}</p>
      </Callout>
      <p>
        That&apos;s accurate, not a placeholder — no licensed electrician or gas technician has signed off on
        BayHeat&apos;s pages yet. As reviewers come on board, their name, license number, state, and the date
        they verified the page replace that line. You&apos;ll never see a review claimed before it happened.
      </p>

      <p>
        More on who publishes BayHeat is on the <Link href="/about">about page</Link>. What we collect from
        your visit (very little) is on the <Link href="/privacy">privacy page</Link>.
      </p>
    </ReportPage>
  );
}
