import Link from "next/link";
import { AmazonAffiliateLink } from "@/components/amazon-link";
import {
  AMAZON_COMFORT_ZONE_CZ220,
  AMAZON_FAHRENHEAT_FUH54,
  AMAZON_MILKHOUSE_1500W,
} from "@/lib/affiliates";

const cards = [
  {
    circuit: "15 A / 120 V outlet",
    job: "Spot heat at a bench. Not a two-car bay.",
    verify: "Comfort Zone CZ798-class, 1,500 W, 120 V, listed mark, tip-over and overheat cutouts.",
    guideHref: "/portable-garage-heaters-15a-circuit",
    guideLabel: "15 A portable guide",
    links: [
      {
        href: AMAZON_MILKHOUSE_1500W,
        label: "Amazon: Comfort Zone CZ798 1500W milkhouse",
      },
    ],
  },
  {
    circuit: "Dedicated 240 V, hardwired",
    job: "Whole-bay air when the door mostly stays closed. Typically 30 A and 10 AWG copper at 5 kW.",
    verify:
      "Hardwired 240 V, 3,000/4,000/5,000 W taps, 30 A guidance, listing mark. FUH54 can also hang on a wall.",
    guideHref: "/best-ceiling-mount-garage-heaters-under-200",
    guideLabel: "Ceiling-mount guide",
    links: [
      {
        href: AMAZON_COMFORT_ZONE_CZ220,
        label: "Amazon: Comfort Zone 5000W ceiling (CZ220-class)",
      },
      {
        href: AMAZON_FAHRENHEAT_FUH54,
        label: "Amazon: Fahrenheat FUH5-4 5000W (FUH54-class)",
      },
    ],
  },
  {
    circuit: "One wall, not the whole bay",
    job: "5 kW utility, 7.5 kW shop, and 1,500 W wall infrared are different circuits. Do not treat them as one SKU.",
    verify: "Match the nameplate amps to the breaker you actually have before opening a listing.",
    guideHref: "/best-wall-mount-garage-heaters",
    guideLabel: "Wall-mount guide",
    links: [],
  },
] as const;

export function ClassRetailers({ id = "buy-the-class" }: { id?: string }) {
  return (
    <section id={id} className="not-prose my-10">
      <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--ink)]">
        Buy the class the circuit allows
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-2)]">
        Amazon Associates text links (tag{" "}
        <code className="font-mono text-[0.9em]">laqaer-20</code>). We may earn
        a commission if you buy after clicking, at no extra cost to you. These
        are the same listings already specified on the product guides. Confirm
        the nameplate on the page you open. Street prices move. We do not
        invent scores or coverage claims.
      </p>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <li
            key={card.guideHref}
            className="flex h-full flex-col rounded-xl border border-[var(--line)] bg-[var(--card)] p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--rust)]">
              {card.circuit}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{card.job}</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-2)]">{card.verify}</p>
            <p className="mt-4">
              <Link
                href={card.guideHref}
                className="text-sm font-medium text-[var(--rust)] underline decoration-[var(--rust)]/30 underline-offset-4"
              >
                {card.guideLabel}
              </Link>
            </p>
            {card.links.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {card.links.map((link) => (
                  <li key={link.href}>
                    <AmazonAffiliateLink href={link.href}>{link.label}</AmazonAffiliateLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-6 text-[var(--ink-2)]">
                Open the wall-mount guide for the three listings. A 7.5 kW shop
                unit is not a 15 A wall infrared.
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
