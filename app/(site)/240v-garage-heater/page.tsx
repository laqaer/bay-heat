import type { Metadata } from "next";
import Link from "next/link";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { Callout } from "@/components/ui/Callout";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton } from "@/components/ui/ButtonLink";
import { WhyNot } from "@/components/commerce/WhyNot";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { route } from "@/lib/commerce/route";
import { findProduct } from "@/lib/commerce/products";
import { circuitFor } from "@/lib/planner/electrical";
import { SAFETY_SCOPE } from "@/lib/site";

const entry = findPage("/240v-garage-heater")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["nec-2023", "cz220-manual", "fuh54-manual", "dr975-manual"];

export default function Page() {
  // Every row below is circuitFor() called live, at render time -- not a hand-typed table.
  const c4k = circuitFor(4000, 240, 240);
  const c5k = circuitFor(5000, 240, 240);
  const c7k5 = circuitFor(7500, 240, 240);
  const c10k = circuitFor(10000, 240, 240);

  const cz220 = findProduct("cz220-5kw-ceiling")!;
  const fuh54 = findProduct("fuh54-5kw")!;
  const dr975 = findProduct("dr975-7k5-shop")!;
  const e240_4k = findProduct("e-240-4k-generic")!;
  const e240_10k = findProduct("e-240-10k-generic")!;

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        A 5,000W 240V heater needs a <Num v={c5k.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240)" /> breaker
        and {c5k.wireNM} copper. A 4,000W heater draws less current but still needs a{" "}
        <Num v={c4k.breakerA} unit="A" ev="C" src="circuitFor(4000, 240, 240)" /> circuit — it does not fit the 20A
        circuit already run to most garages. Bigger units scale the same way: 7,500W needs{" "}
        <Num v={c7k5.breakerA} unit="A" ev="C" src="circuitFor(7500, 240, 240)" /> and {c7k5.wireNM}, 10,000W needs{" "}
        <Num v={c10k.breakerA} unit="A" ev="C" src="circuitFor(10000, 240, 240)" /> and 4 AWG NM.
      </AnswerBlock>

      <Disclosure />

      <h2>The breaker and wire, for every common size</h2>
      <p>
        A 240V heater is a fixed appliance, not a plug-in — <Num f="code.nec.424_4_b" /> treats it as a continuous
        load, so the breaker and wire are sized at 125% of the actual running current, not the nameplate amps alone.
        That 25% margin is why the numbers below don&apos;t line up with wattage the way you&apos;d guess.
      </p>
      <div className="not-prose my-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-(--color-line) text-left text-(--color-fg-2)">
              <th className="py-2 pr-3 font-normal">Heater</th>
              <th className="py-2 pr-3 font-normal">Running current</th>
              <th className="py-2 pr-3 font-normal">Breaker</th>
              <th className="py-2 font-normal">Wire (NM/Romex)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-3 pr-3 text-(--color-fg)">4,000W</td>
              <td className="py-3 pr-3 font-mono">
                <Num v={c4k.amps} unit="A" ev="C" src="circuitFor(4000, 240, 240).amps" />
              </td>
              <td className="py-3 pr-3 font-mono">
                <Num v={c4k.breakerA} unit="A" ev="C" src="circuitFor(4000, 240, 240).breakerA" />
              </td>
              <td className="py-3 font-mono">{c4k.wireNM}</td>
            </tr>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-3 pr-3 text-(--color-fg)">5,000W</td>
              <td className="py-3 pr-3 font-mono">
                <Num v={c5k.amps} unit="A" ev="C" src="circuitFor(5000, 240, 240).amps" />
              </td>
              <td className="py-3 pr-3 font-mono">
                <Num v={c5k.breakerA} unit="A" ev="C" src="circuitFor(5000, 240, 240).breakerA" />
              </td>
              <td className="py-3 font-mono">{c5k.wireNM}</td>
            </tr>
            <tr className="border-b border-(--color-line)/50">
              <td className="py-3 pr-3 text-(--color-fg)">7,500W</td>
              <td className="py-3 pr-3 font-mono">
                <Num v={c7k5.amps} unit="A" ev="C" src="circuitFor(7500, 240, 240).amps" />
              </td>
              <td className="py-3 pr-3 font-mono">
                <Num v={c7k5.breakerA} unit="A" ev="C" src="circuitFor(7500, 240, 240).breakerA" />
              </td>
              <td className="py-3 font-mono">{c7k5.wireNM}</td>
            </tr>
            <tr>
              <td className="py-3 pr-3 text-(--color-fg)">10,000W</td>
              <td className="py-3 pr-3 font-mono">
                <Num v={c10k.amps} unit="A" ev="C" src="circuitFor(10000, 240, 240).amps" />
              </td>
              <td className="py-3 pr-3 font-mono">
                <Num v={c10k.breakerA} unit="A" ev="C" src="circuitFor(10000, 240, 240).breakerA" />
              </td>
              <td className="py-3 font-mono">{c10k.wireNM}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout variant="fix">
        The jump from 4,000W to 5,000W looks small on the box. On the panel it isn&apos;t — 4,000W still clears a 20A
        breaker&apos;s continuous rating, so it needs its own <Num v={c4k.breakerA} unit="A" ev="C" src="circuitFor(4000, 240, 240).breakerA" />{" "}
        circuit, same as the 5,000W unit one size up. Neither one runs on the 20A circuit already in most garages.
      </Callout>

      <h2>GFCI: when it applies and when it doesn&apos;t</h2>
      <p>
        <Num f="code.nec.210_8_a" /> covers receptacles — outlets you plug something into. A hardwired 240V heater
        has no plug, so this rule doesn&apos;t attach to the heater itself. It still governs any 125–250V receptacle
        elsewhere in the garage, so an electrician wiring a new circuit for the heater will usually address both in
        the same visit. Your electrician and your local code edition govern.
      </p>
      <p>
        Adding a large 240V circuit to an existing panel can also trigger <Num f="code.nec.220_83" /> — worth asking
        your electrician about before they open the panel, not after.
      </p>

      <h2>Shop for the size your circuit can carry</h2>
      <p>
        Price is a range class here, never a live number — check the actual price on the retailer&apos;s page
        before you buy.
      </p>
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V · 5,000W · 30A</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Comfort Zone CZ220 / Fahrenheat FUH54</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="cz220.btuh.high" /> on a <Num f="circuit.5000w240v.breaker" />.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{cz220.safetyLine?.text}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <BuyButton href={route(cz220, "site")[0].href}>Check CZ220 price on Amazon ↗</BuyButton>
            <a
              href={route(fuh54, "site")[0].href}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="text-sm text-(--color-link) underline underline-offset-4"
            >
              or the FUH54 ↗
            </a>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">
            Price class: {cz220.priceClass} / {fuh54.priceClass}
          </p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V · 7,500W · 40A</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Dr. Infrared DR-975</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="dr975.btuh" /> on a <Num f="circuit.7500w240v.breaker" />.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{dr975.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(dr975, "site")[0].href}>Check price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {dr975.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V · 4,000W · 25A</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">240V 4,000W hardwired heater</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            No verified nameplate on file for a specific model yet — the 25A/10 AWG figures above come from{" "}
            <Num v={c4k.breakerA} unit="A" ev="C" src="circuitFor(4000, 240, 240)" /> at the class&apos;s 4,000W
            rating, not a manual.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{e240_4k.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(e240_4k, "site")[0].href}>Search 240V 4,000W heaters ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {e240_4k.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V · 10,000W · 60A</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">240V 10,000W hardwired unit heater</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            The largest class on this page. <Num v={c10k.breakerA} unit="A" ev="C" src="circuitFor(10000, 240, 240)" />{" "}
            and 4 AWG NM is enough panel capacity to think through before you buy — see{" "}
            <Num f="code.nec.220_83" />.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{e240_10k.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(e240_10k, "site")[0].href}>Search 240V 10,000W heaters ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {e240_10k.priceClass}</p>
        </div>
      </div>

      <WhyNot
        rows={[
          {
            classId: "e_port_1500",
            text: "A 1,500W plug-in heater tops out around 5,100 BTU/h — a real garage on a cold design day usually needs several times that. It's a workbench heater, not a whole-garage one, no matter how many outlets you spread it across.",
          },
        ]}
      />
      <p>
        See the <Link href="/garage-heater-calculator">garage heater calculator</Link> for the exact load your
        garage needs before picking a class.
      </p>

      <h2>Safety</h2>
      <SafetyCallout>
        <p>
          A hardwired 240V heater is a fixed continuous load (<Num f="code.nec.424_4_b" />), sized at 125% of its
          running current — that&apos;s where every breaker and wire figure on this page comes from. It isn&apos;t a
          receptacle, so the GFCI rule (<Num f="code.nec.210_8_a" />) governs the garage&apos;s outlets, not the
          heater. Your electrician and your local code edition govern.
        </p>
        <p className="mt-2">{SAFETY_SCOPE}</p>
      </SafetyCallout>
    </ReportPage>
  );
}
