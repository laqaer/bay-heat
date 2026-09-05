import type { Metadata } from "next";
import Link from "next/link";
import { findGuide, site } from "@/lib/site";

const page = findGuide("/privacy")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.href },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        Legal
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
        {page.h1}
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">Last updated {page.updated}</p>

      <div className="guide-prose">
        <p>
          This policy describes how {site.name} ({site.domain}), published by{" "}
          {site.publisher}, handles information on a content and affiliate
          comparison site. We do not run user accounts or a shop checkout on
          this property today.
        </p>

        <h2>Information we may collect</h2>
        <ul>
          <li>
            <strong>Server and hosting logs.</strong> Our host (Vercel) and any
            CDN may receive IP address, user agent, referrer,
            and request path as part of delivering pages. We use that to operate
            and debug the site, not to build a marketing profile.
          </li>
          <li>
            <strong>Email you send us.</strong> If you write{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>, we keep what you
            send long enough to reply and, if needed, to correct a page.
          </li>
          <li>
            <strong>Analytics (if enabled later).</strong> If we add a
            privacy-respecting analytics tool, this policy will name it. Until
            then, treat analytics as not present.
          </li>
          <li>
            <strong>Advertising (if enabled later).</strong>{" "}
            <code className="font-mono text-[0.9em]">/ads.txt</code> is a
            placeholder. If we serve ads, ad partners may use cookies or
            similar identifiers. We will update this policy before that happens.
          </li>
          <li>
            <strong>Affiliate partners.</strong> When retailer links go live,
            clicking them may set cookies on the retailer or affiliate-network
            domain so a commission can be attributed. We do not see your
            payment card. Those companies have their own policies.
          </li>
        </ul>

        <h2>Cookies</h2>
        <p>
          This launch site is static editorial content. We do not set a first-party
          account cookie. Third-party cookies may appear only after analytics,
          ads, or affiliate programs are wired. You can block cookies in your
          browser; the guides will still read.
        </p>

        <h2>What we do not do</h2>
        <ul>
          <li>We do not sell your email address.</li>
          <li>We do not require an account to read guides.</li>
          <li>We do not knowingly collect information from children under 13.</li>
        </ul>

        <h2>Retention and security</h2>
        <p>
          Hosting logs follow the host’s retention defaults unless we have a
          support reason to keep a specific request. Email is kept as long as
          the conversation is active or a correction is outstanding. No method
          of transmission over the internet is perfectly secure.
        </p>

        <h2>Your requests</h2>
        <p>
          For access or deletion questions about email you sent us, write{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>. We will need enough
          detail to find the message.
        </p>

        <h2>Changes</h2>
        <p>
          If we add accounts, newsletters, ads, or live affiliate tracking, we
          will update this page and the “last updated” date. The{" "}
          <Link href="/about">about page</Link> states who publishes the site.
        </p>
      </div>
    </article>
  );
}
