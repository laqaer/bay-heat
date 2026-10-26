# Home

The homepage is the lab report for one garage. It states the sizing range, links the planner and the safety check, and keeps the publisher disclosure in the footer.

## Sub-features

- `home-identity` shows BayHeat, the `h1` `One garage. Seven answers.`, and the publisher line.
- `home-cta-planner` follows `Size my garage` into the calculator.
- `home-cta-safety` follows `Check my heater` into Can I Run It.
- `home-chrome` keeps primary nav, footer disclosures, and the About and Privacy escapes.

## How to get to it (user POV)

- Open `/` on the local instance.
- Choose the `BAYHEAT` wordmark in the header from any page.
- Choose `Home` in a report breadcrumb.
- Land on an unknown URL and choose `Size my garage`, which leaves the 404 for the calculator. Return with the wordmark.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.
- The run owns that port (`instance.json` pid is alive).

- **Open hub.** Open `/`. Run `bay-heat get / --expect "One garage. Seven answers." --expect "Check my heater" --expect "As an Amazon Associate"`. Status is `200`, title contains `BayHeat`, JSON-LD includes `WebSite`.
- **Planner CTA.** Choose `Size my garage`. Run `bay-heat follow --from / --name "Size my garage" --expect "Garage heater calculator"`. The destination path is `/garage-heater-calculator`.
- **Safety CTA.** Return to `/` and choose `Check my heater`. Run `bay-heat follow --from / --name "Check my heater" --expect "Can I run it?"`. The destination path is `/can-i-run-it`.
- **Footer chrome.** From `/`, confirm the disclosure and contact. Run `bay-heat get / --expect "As an Amazon Associate" --expect "hello@bayheatguide.com" --expect "Laqaer Products"`.
- **Proof.** Capture the hub, then the page after the planner CTA. Run `bay-heat snapshot / --dir .cursor/skills/verify-bay-heat/evidence/home --screenshot` and `bay-heat snapshot /garage-heater-calculator --dir .cursor/skills/verify-bay-heat/evidence/home --screenshot`. Write `PROOF.txt` with feature id `home` and entry `Size my garage`. Both screenshots show BayHeat. The second `h1` is `Garage heater calculator`.

## Gotchas

- The home `h1` also prints a computed BTU/h range after the sentence. Assert the sentence, not a frozen BTU pair.
- `Size my garage` also appears on the 404 page. From `/` the first match is the header CTA and it goes to `/garage-heater-calculator`.
- Desktop `Primary` nav is not in the layout below the `lg` breakpoint. A 390-wide screenshot that lacks those links is not a nav bug.
- `WebSite` JSON-LD is in the root layout, so it appears on every HTML page. That does not prove the homepage body rendered.
- A 404 still includes the site header. Prove the hub by the home `h1`, not by the word BayHeat alone.
- Do not treat a production curl of `https://bayheatguide.com/` as this feature. Canonicals in local HTML point at that host on purpose.
