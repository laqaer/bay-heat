import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd } from "@/lib/json-ld";
import { findGuide, guides, site } from "@/lib/site";

const page = findGuide("/about")!;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.href },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--rust)]">
          {site.publisher}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
          {page.h1}
        </h1>
        <p className="mt-4 text-lg leading-8 text-[var(--ink-2)]">
          BayHeat Guide is a comparison site for electric garage and workshop
          heaters. It is published by {site.publisher}. The public domain for
          this property is {site.domain}. Contact:{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>

        <div className="guide-prose">
          <h2>What this site is</h2>
          <p>
            A small set of bookmarkable guides: circuit reality, bay sizing,
            forced-air versus infrared, the 5 kW ceiling-mount aisle, 15 A
            portables, wall versus ceiling mount, whether to seal the
            garage before buying more watts, what those watts cost to
            run, and when electric is enough versus propane. The hub at
            the homepage is a decision tree, not a doorway page stuffed
            with synonyms.
          </p>
          <ul>
            {guides.map((guide) => (
              <li key={guide.href}>
                <Link href={guide.href}>{guide.title}</Link>
              </li>
            ))}
          </ul>

          <h2>Editorial standards</h2>
          <ul>
            <li>
              We use nameplate electrical data and installation manuals (watts,
              amps, suggested breaker, copper size, listing marks). We do not
              invent composite review scores or “heats up to X sq ft” claims.
            </li>
            <li>
              Wattage-per-square-foot figures are planning brackets with
              insulation caveats, not engineering stamps.
            </li>
            <li>
              Street prices move. “Under $200” describes a shopping class of
              hardwired 5 kW ceiling units, not a live price.
            </li>
            <li>
              Some retailer links are Amazon Associates (tag laqaer-20). They
              are disclosed in the footer on every page and again on
              product-class pages. We may earn a commission if you buy after
              clicking.
            </li>
            <li>
              Electrical and fire-safety warnings stay on the page. This is not
              a substitute for the NEC, local amendments, or a licensed
              electrician.
            </li>
            <li>
              We do not mix unrelated properties into this site. BayHeat Guide
              is garage heat. It is not an astrology, horoscope, or other
              Laqaer consumer brand.
            </li>
          </ul>

          <h2>Who to contact</h2>
          <p>
            Corrections, circuit questions we should clarify, and press:
            {" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>. We read mail. We
            do not provide personalized electrical design over email.
          </p>
          <p>
            Privacy practices for this content and affiliate site:{" "}
            <Link href="/privacy">privacy policy</Link>.
          </p>
        </div>
      </article>
    </>
  );
}
