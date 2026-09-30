import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { CONTACT_EMAIL } from "@/lib/site";
import { PLAUSIBLE_DOMAIN, GA4_ID } from "@/lib/env.public";

const entry = findPage("/privacy")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const analyticsConfigured = Boolean(PLAUSIBLE_DOMAIN || GA4_ID);

export default function Page() {
  return (
    <ReportPage entry={entry} sources={[]}>
      <p>
        BayHeat collects very little, and this page names all of it. Nothing below is filler — it describes
        what the site actually does today, not what a template privacy policy usually says.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your saved garage, in your browser only.</strong> When you finish the garage heater
          calculator, it saves a small summary to your browser&apos;s local storage: your garage&apos;s
          heat-load in BTU/h, its envelope grade, the matching heater size in kW, its breaker size, and a
          compact code that lets the calculator reopen your inputs later. That save is wrapped so a blocked or
          private browser just skips it — nothing breaks. This never leaves your browser and never reaches a
          BayHeat server.
        </li>
        <li>
          <strong>Anonymous usage events, only where analytics is turned on.</strong>{" "}
          {analyticsConfigured
            ? "This deployment has an analytics provider configured. Events carry no name, email, or full ZIP code — at most a three-digit ZIP prefix."
            : "This deployment currently has no analytics provider configured, so no usage events are sent anywhere."}{" "}
          Analytics events never include your garage&apos;s size, address, or the saved-garage summary above.
        </li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>No account creation. There&apos;s no login, no password, and no profile to manage.</li>
        <li>
          No garage data sent to a server. The calculator runs entirely in your browser; the dimensions,
          insulation, and location you type in are never transmitted to BayHeat or anyone else.
        </li>
        <li>
          No cookies set by BayHeat. If you click a paid link to a retailer, that retailer&apos;s own site may
          set its own cookies once you land there — that&apos;s covered by their privacy policy, not this one.
        </li>
      </ul>

      <h2>Clearing your data</h2>
      <p>
        Your saved garage lives in one browser storage key on your device. Clearing your browser&apos;s site
        data for BayHeat, or using a private window, removes it. There&apos;s no account for us to delete it
        from, because there&apos;s no account.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy go to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. More on how
        the site works and makes money is on the <Link href="/how-we-work">how we work page</Link>.
      </p>
    </ReportPage>
  );
}
