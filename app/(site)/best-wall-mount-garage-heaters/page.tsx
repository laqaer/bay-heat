import type { Metadata } from "next";
import { ReportPage } from "@/components/page/ReportPage";
import { AnswerBlock } from "@/components/evidence/AnswerBlock";
import { Num } from "@/components/evidence/Num";
import { SafetyCallout } from "@/components/safety/SafetyCallout";
import { Disclosure } from "@/components/commerce/Disclosure";
import { BuyButton } from "@/components/ui/ButtonLink";
import { WhyNot } from "@/components/commerce/WhyNot";
import { pageMetadata } from "@/lib/seo";
import { findPage } from "@/lib/pages";
import { getSource } from "@/lib/facts";
import { route } from "@/lib/commerce/route";
import { findProduct } from "@/lib/commerce/products";

const entry = findPage("/best-wall-mount-garage-heaters")!;

export const metadata: Metadata = pageMetadata({
  path: entry.href,
  title: entry.title,
  description: entry.description,
});

const SOURCE_IDS = ["hs1500tt-manual", "fuh54-manual", "dr975-manual", "nec-2023"];

export default function Page() {
  const hs1500tt = findProduct("hs1500tt-wall-infrared")!;
  const fuh54 = findProduct("fuh54-5kw")!;
  const dr975 = findProduct("dr975-7k5-shop")!;

  const sources = SOURCE_IDS.map((id) => getSource(id)).filter((s): s is NonNullable<typeof s> => s !== null);

  return (
    <ReportPage entry={entry} sources={sources}>
      <AnswerBlock>
        Three wall-listed electric classes cover most garages: a <Num f="hs1500tt.watts" /> infrared panel mounted
        at <Num f="hs1500tt.mount_height_in_us" /> with <Num f="hs1500tt.clearance_side_in" /> side clearance, a{" "}
        <Num f="fuh54.watts.high" /> wall/ceiling fan-forced unit on a <Num f="circuit.5000w240v.breaker" />, and a{" "}
        <Num f="dr975.watts" /> shop heater on a <Num f="circuit.7500w240v.breaker" />. Pick by output and clearance the manual actually
        publishes — not by which one looks biggest in a photo.
      </AnswerBlock>

      <h2>Spec-based picks, not a ranking</h2>
      <p>
        Nobody on this page has run these heaters side by side in the same garage over a winter, so nothing here is
        called &quot;best.&quot; Each pick below is the smallest class whose manual figures actually cover a given
        job: a workbench panel, a 1–2 car garage, or a 2–3 car shop. Match your garage to the job, then check the
        clearance row against your actual wall.
      </p>
      <Disclosure />
      <div className="not-prose my-6 grid gap-4 sm:grid-cols-3">
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">120V WALL INFRARED · 1.5 KW</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Heat Storm HS-1500-TT</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="hs1500tt.watts" /> plugged into an existing outlet. Mount at{" "}
            <Num f="hs1500tt.mount_height_in_us" /> or higher, with <Num f="hs1500tt.clearance_side_in" /> to
            either side and <Num f="hs1500tt.clearance_top_in" /> above. Best for a workbench or a single bay, not
            a whole garage.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{hs1500tt.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(hs1500tt, "site")[0].href}>Check price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {hs1500tt.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V WALL/CEILING · 5 KW</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Fahrenheat FUH54</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="fuh54.watts.high" /> (<Num f="fuh54.btuh.high" />) on a <Num f="circuit.5000w240v.breaker" />,{" "}
            <Num f="fuh54.wire" />. The manual gives a <Num f="fuh54.clearance_floor_ft" /> floor clearance for a
            ceiling mount; it doesn&apos;t publish a separate side-wall clearance figure for a wall install, so
            follow the mounting bracket instructions in the box, not a guess.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{fuh54.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(fuh54, "site")[0].href}>Check price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {fuh54.priceClass}</p>
        </div>
        <div className="border border-(--color-line) p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-(--color-fg-2)">240V WALL/CEILING SHOP · 7.5 KW</p>
          <p className="mt-1 text-lg font-bold text-(--color-fg)">Dr. Infrared DR-975</p>
          <p className="mt-2 text-sm text-(--color-fg-2)">
            <Num f="dr975.btuh" /> at <Num f="dr975.watts" /> on a <Num f="circuit.7500w240v.breaker" />,{" "}
            <Num f="dr975.wire" />. The manual calls for <Num f="dr975.clearance_side_ft" /> clearance on each side
            and <Num f="dr975.clearance_back_in" /> off the back wall — check that gap before you pick a stud.
          </p>
          <p className="mt-2 text-xs text-(--color-alarm)">{dr975.safetyLine?.text}</p>
          <div className="mt-3">
            <BuyButton href={route(dr975, "site")[0].href}>Check price on Amazon ↗</BuyButton>
          </div>
          <p className="mt-2 font-mono text-xs text-(--color-fg-2)">Price class: {dr975.priceClass}</p>
        </div>
      </div>

      <h2>Clearances, side by side</h2>
      <p>
        Every figure below is the manual&apos;s own number for that model, not a rule of thumb applied across
        brands — two heaters at nearly the same wattage can still call for different clearances.
      </p>
      <table>
        <thead>
          <tr>
            <th>Spec</th>
            <th>HS-1500-TT (1.5 kW)</th>
            <th>FUH54 (5 kW)</th>
            <th>DR-975 (7.5 kW)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Output</td>
            <td>
              <Num f="hs1500tt.watts" />
            </td>
            <td>
              <Num f="fuh54.btuh.high" />
            </td>
            <td>
              <Num f="dr975.btuh" />
            </td>
          </tr>
          <tr>
            <td>Circuit</td>
            <td>120V, existing outlet</td>
            <td>
              <Num f="circuit.5000w240v.breaker" />
            </td>
            <td>
              <Num f="circuit.7500w240v.breaker" />
            </td>
          </tr>
          <tr>
            <td>Mount height</td>
            <td>
              <Num f="hs1500tt.mount_height_in_us" /> minimum
            </td>
            <td>—</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Side clearance</td>
            <td>
              <Num f="hs1500tt.clearance_side_in" />
            </td>
            <td>—</td>
            <td>
              <Num f="dr975.clearance_side_ft" />
            </td>
          </tr>
          <tr>
            <td>Top / back clearance</td>
            <td>
              <Num f="hs1500tt.clearance_top_in" /> above
            </td>
            <td>—</td>
            <td>
              <Num f="dr975.clearance_back_in" /> back
            </td>
          </tr>
        </tbody>
      </table>
      <p>A dash means that model&apos;s manual doesn&apos;t publish that figure — don&apos;t carry a number over from a different unit.</p>

      <h2>What not to bolt to a wall</h2>
      <WhyNot
        rows={[
          {
            classId: "e_port_1500",
            text: "A plug-in portable heater is built as a floor or bench unit with its own tip-over shutoff — it isn't listed for a fixed wall mount. Use the wall-listed HS-1500-TT instead if you want the heater off the floor.",
          },
          {
            classId: "g_unvented_buddy",
            text: "A propane radiant heater is a floor-standing, attended-use tool by its own manual, never a fixed wall or ceiling installation.",
          },
        ]}
      />

      <h2>Safety at the point of installation</h2>
      <SafetyCallout>
        <p>
          A wall-mounted 120V unit still needs GFCI protection on the outlet it plugs into (<Num f="code.nec.210_8_a" />).
          A hardwired 240V unit is sized as a continuous load — breaker and wire at 125% of the nameplate draw, not
          the running amps alone (<Num f="code.nec.424_4_b" />). Your electrician and your local code edition
          govern.
        </p>
      </SafetyCallout>
      <p>
        For a heavier ceiling-only install, see <a href="/ceiling-mount-garage-heater">ceiling-mount garage heaters →</a>.
        For a garage sized from your own dimensions instead of these three classes, run the{" "}
        <a href="/garage-heater-calculator">garage heater calculator →</a>.
      </p>
    </ReportPage>
  );
}
