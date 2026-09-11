import type { Metadata } from "next";
import Link from "next/link";
import { AmazonAffiliateLink } from "@/components/amazon-link";
import { GuideChrome, SpecTable } from "@/components/guide-chrome";
import { AMAZON_MILKHOUSE_1500W } from "@/lib/affiliates";
import { findGuide } from "@/lib/site";

const guide = findGuide("/portable-garage-heaters-15a-circuit")!;

export const metadata: Metadata = {
  title: guide.title,
  description: guide.description,
  alternates: { canonical: guide.href },
  openGraph: {
    title: guide.h1,
    description: guide.description,
    url: guide.href,
    type: "article",
  },
};

const toc = [
  { id: "twelve-amps", label: "Why ~12 A is the ceiling" },
  { id: "milkhouse", label: "Milkhouse and utility heaters" },
  { id: "other-portables", label: "Other 15 A portables" },
  { id: "garage-gfci", label: "Garage GFCI and shared circuits" },
  { id: "safety", label: "Use rules that prevent fires" },
];

export default function PortableGuidePage() {
  return (
    <GuideChrome guide={guide} toc={toc}>
      <h2 id="twelve-amps">Why ~12 A is the ceiling on a 15 A circuit</h2>
      <p>
        A 15 A / 120 V branch circuit is 1,800 W at 100% and about{" "}
        <strong>1,440 W if you treat the heater as a continuous load</strong>{" "}
        (80% rule; see{" "}
        <Link href="/120v-vs-240v-garage-heater">120 V vs 240 V</Link>). The
        standard milkhouse / utility heater is 1,500 W, which is 12.5 A — just
        over that continuous number.
      </p>
      <p>
        That does not make 1,500 W heaters illegal. It does mean they should be
        the only significant load on that circuit, they should be plugged into
        the wall (not a daisy-chained strip), and a 20 A garage circuit is a
        more comfortable home if you actually have one. If the lights dim, the
        breaker chatters, or a freezer shares the run, drop to a 1,000–1,300 W
        setting or a smaller unit.
      </p>

      <SpecTable
        caption="120 V portable loads versus a 15 A circuit"
        columns={["Nameplate", "Amps at 120 V", "vs 15 A continuous (~12 A)", "Use"]}
        rows={[
          ["750–1,000 W", "6.3–8.3 A", "Comfortable headroom", "Mild chill, shared circuit, long winter days"],
          ["1,250–1,300 W", "~10.4–10.8 A", "Under 12 A", "Better all-day match on 15 A"],
          ["1,500 W", "12.5 A", "Over 12 A continuous", "Only load on the circuit; watch the breaker"],
          ["1,500 W + opener/freezer/charger", ">>12 A", "Trip territory", "Do not do this"],
        ]}
      />

      <h2 id="milkhouse">Milkhouse and utility heaters</h2>
      <p>
        “Milkhouse” means a small, usually metal, fan-forced utility heater with
        a carrying handle: the thing farm-supply stores have sold for decades.
        Typical nameplates are 1,300 / 1,500 W on 120 V, sometimes with a
        lower fan-only or 750 W setting. Comfort Zone, Dura Heat, and a dozen
        private labels all sell this shape. We are not ranking them with fake
        scores. Look at:
      </p>
      <ul>
        <li>listed mark (UL / ETL) and a readable nameplate,</li>
        <li>tip-over and overheat cutouts that actually exist on the sheet,</li>
        <li>a thermostat if you will leave it in a closed 1-car,</li>
        <li>metal vs plastic body (shop durability, not a heat-output upgrade),</li>
        <li>amperage at the setting you will actually use.</li>
      </ul>
      <p>
        A milkhouse heater heats a person and a small radius of air. It will
        not heat a two-car garage. If that is the job, you need{" "}
        <Link href="/best-ceiling-mount-garage-heaters-under-200">
          240 V ceiling-mount
        </Link>{" "}
        and the wattage brackets on the{" "}
        <Link href="/best-electric-garage-heaters-by-size">size guide</Link>.
        It is cheaper per hour than a 5 kW unit only because it is fewer
        watts —{" "}
        <Link href="/electric-garage-heater-operating-cost">
          cost-to-run math
        </Link>
        , not a 120 V discount.
      </p>
      <p>
        One measured Amazon Associates listing for this class is below. Street
        prices move; the page may show a class sibling. Confirm 1,500 W / 120 V
        and the safety cutouts on the nameplate. Do not treat an Amazon title
        that says “heats 1,000 sq ft” as data — that claim is not something we
        will repeat.
      </p>
      <SpecTable
        caption="Amazon Associates listing for a 1500 W milkhouse-class portable"
        columns={["Class", "What to verify on the listing", "Affiliate / retailer link"]}
        rows={[
          [
            "1500 W milkhouse portable",
            "Comfort Zone CZ798-class, 1500 W / 120 V, listed mark, tip-over and overheat cutouts",
            <AmazonAffiliateLink key="cz798" href={AMAZON_MILKHOUSE_1500W}>
              Amazon: Comfort Zone CZ798 1500W milkhouse
            </AmazonAffiliateLink>,
          ],
        ]}
      />

      <h2 id="other-portables">Other 15 A portables, without the mythology</h2>
      <ul>
        <li>
          <strong>Ceramic tower / “oscillating garage heater.”</strong> Still
          fan-forced 120 V, still ~12.5 A at 1,500 W. Useful at a bench. Not a
          new wattage class.
        </li>
        <li>
          <strong>Oil-filled radiator.</strong> Same wattage limit, slower, quieter,
          less blast of dust. Reasonable for a small insulated 1-car you occupy
          for hours. Poor for “I just walked in and the slab is 35 °F.”
        </li>
        <li>
          <strong>Quartz / infrared portable.</strong> Spends the same 1,200–1,500 W
          on a beam. Often the better 15 A choice in a drafty shop. See{" "}
          <Link href="/forced-air-vs-infrared-garage-heater">
            forced-air vs infrared
          </Link>
          .
        </li>
      </ul>
      <p>
        Ceramic, oil-filled, and quartz portables stay on the same 15 A wattage
        ceiling. We do not have measured ASINs for those shapes, so there is no
        invented buy link here.
      </p>

      <h2 id="garage-gfci">Garage GFCI and shared circuits</h2>
      <p>
        Current residential code paths put garage receptacles on GFCI
        protection. A 1,500 W heater is a frequent trip. Causes include a damp
        floor, a cheap cord, a dying element, or simply a sensitive device plus
        a motor start. Reset once, inspect the cord and the area, and stop if it
        trips again. Do not use a “cheater” or move the heater to a non-GFCI
        laundry circuit as a workaround.
      </p>
      <p>
        Shared garage circuits are the other silent limiter. Openers, battery
        chargers, a chest freezer, and LED shop lights add up. The heater does
        not get a private 12 A just because you want it to. If you can, put the
        heater on its own 20 A garage receptacle.
      </p>

      <h2 id="safety">Use rules that prevent fires</h2>
      <ul>
        <li>Plug into the wall receptacle. No extension cords, cubes, or worn strips.</li>
        <li>Keep combustibles (rags, cardboard, solvents, paper, curtains) at least 3 ft away unless the manual says more.</li>
        <li>Do not leave an unattended portable heater running overnight in a shop full of fuel and overspray.</li>
        <li>Tip-over and overheat switches are backups, not permission to block the grille.</li>
        <li>Not for wet locations, outdoor use, or bathrooms unless the listing says so.</li>
        <li>If the cord is hot, the plug is loose, or the smell is electrical, unplug and retire the unit.</li>
      </ul>
      <p>
        If you have already decided the 15 A circuit is the bottleneck, the next
        adult step is a dedicated{" "}
        <Link href="/120v-vs-240v-garage-heater">240 V circuit</Link> — not a
        second milkhouse heater on the same run. That is an install-type
        decision on{" "}
        <Link href="/hardwired-vs-plugin-garage-heater">
          hardwired vs plug-in
        </Link>
        , not a reason to hang the milkhouse from a joist.
      </p>
    </GuideChrome>
  );
}
