import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateCallout, SafetyCallout } from "@/components/callouts";
import { guides, site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — choose an electric garage heater by circuit and size`,
  description: site.description,
  alternates: { canonical: "/" },
};

const steps = [
  {
    n: "01",
    title: "Name the circuit, not the dream wattage",
    body: "A 15 A / 120 V receptacle is a portable or milkhouse problem. Whole-bay heat is almost always a dedicated 240 V circuit and a hardwired unit.",
    href: "/120v-vs-240v-garage-heater",
    label: "120V vs 240V",
  },
  {
    n: "02",
    title: "Decide whether you are heating air or a person",
    body: "Forced-air can work in a reasonably sealed garage. Infrared is usually the better match for open doors, high ceilings, and one workbench.",
    href: "/forced-air-vs-infrared-garage-heater",
    label: "Forced-air vs infrared",
  },
  {
    n: "03",
    title: "Size from insulation, not the “cars” label",
    body: "A tight one-car bay and a leaky three-car shop are different loads. Wattage ranges only make sense after you admit how drafty the building is.",
    href: "/best-electric-garage-heaters-by-size",
    label: "Size by garage",
  },
  {
    n: "04",
    title: "Seal the envelope before you buy more watts",
    body: "An insulated door and weatherstrip often beat a jump from 5 kW to 7.5 kW. Infiltration and a cold slab fake an undersized heater. Panel capacity is the hard stop.",
    href: "/insulate-garage-before-heater-upgrade",
    label: "Insulate first",
  },
  {
    n: "05",
    title: "Wall versus ceiling is joist load and throw",
    body: "Ceiling units throw across the bay if the joists can take 25–30 lb and you have the headroom. Wall mounts win on low ceilings and one work zone. The manual’s clearance wins.",
    href: "/wall-mount-vs-ceiling-garage-heater",
    label: "Wall vs ceiling",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b border-[var(--line)] bg-[linear-gradient(180deg,var(--paper)_0%,var(--paper-2)_100%)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.9fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--rust)]">
              {site.publisher} · Comparison guides
            </p>
            <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-[1.12] tracking-tight text-[var(--ink)] sm:text-6xl">
              Choose the electric garage heater that matches the circuit you have.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-2)]">
              BayHeat Guide is a boring comparison site for electric garage and
              workshop heat: 120 V vs 240 V, forced-air vs infrared, portable vs
              ceiling-mount, wall vs ceiling, and whether to seal the building
              before buying more watts. No star ratings. No invented coverage
              claims. The breaker and the insulation decide more than the box art.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/120v-vs-240v-garage-heater"
                className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--paper)] hover:bg-[var(--ink-2)]"
              >
                Start with voltage
              </Link>
              <Link
                href="/best-electric-garage-heaters-by-size"
                className="rounded-full border border-[var(--ink)]/20 px-5 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--card)]"
              >
                Size by garage
              </Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              Quick reality check
            </p>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-[var(--ink-2)]">
              <li>
                <strong className="text-[var(--ink)]">15 A / 120 V:</strong> treat
                ~12 A as continuous. That is a portable / milkhouse heater, not a
                two-car garage heater.
              </li>
              <li>
                <strong className="text-[var(--ink)]">5 kW ceiling unit:</strong>{" "}
                typically 240 V, hardwired, 30 A two-pole, 10 AWG copper. Hire an
                electrician if that sentence is not already familiar.
              </li>
              <li>
                <strong className="text-[var(--ink)]">Uninsulated door:</strong>{" "}
                more watts will not fix infiltration.{" "}
                <Link href="/insulate-garage-before-heater-upgrade">
                  Seal and insulate first
                </Link>
                , or heat the person, not the bay.
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          Decision tree
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--ink-2)]">
          Work these in order. Buying a 5,000 W unit for a 15 A outlet — or a
          1,500 W milkhouse heater for a drafty two-car bay — is how people waste
          a Saturday and a circuit.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.n}
              className="rounded-xl border border-[var(--line)] bg-[var(--card)] p-5"
            >
              <p className="font-mono text-xs tracking-[0.16em] text-[var(--muted)]">
                {step.n}
              </p>
              <h3 className="mt-3 text-lg font-semibold leading-snug text-[var(--ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">{step.body}</p>
              <Link
                href={step.href}
                className="mt-4 inline-block text-sm font-medium text-[var(--rust)] underline decoration-[var(--rust)]/30 underline-offset-4"
              >
                {step.label}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--paper-2)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            All guides
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
              <li key={guide.href}>
                <Link
                  href={guide.href}
                  className="block h-full rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 transition-colors hover:border-[var(--ink)]/25"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--rust)]">
                    {guide.decision}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-snug text-[var(--ink)]">
                    {guide.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-2)]">
                    {guide.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            How these pages are written
          </h2>
          <p className="mt-4 leading-7 text-[var(--ink-2)]">
            We compare classes of heaters using nameplate electrical data and
            installation manuals — wattage steps, amps, suggested breaker and
            copper size, mount type — not composite “editor scores.” Street
            prices move; “under $200” is a shopping class, not a promise that a
            given SKU is in stock at that price this week. See{" "}
            <Link href="/about">editorial standards</Link> if you want the full
            list of things we will not invent.
          </p>
        </div>
        <SafetyCallout />
        <AffiliateCallout />
      </section>
    </>
  );
}
