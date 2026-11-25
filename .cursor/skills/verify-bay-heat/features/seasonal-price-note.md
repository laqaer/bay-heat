# Seasonal price note

Three winter money pages tell the reader that Black Friday and holiday prices change daily. The legacy path `/best-infrared-garage-heaters` redirects to `/infrared-garage-heater` on the deployed host. Local `next dev` does not apply that redirect.

## Sub-features

- `note-infrared` shows the price note and `Check today's price` on `/infrared-garage-heater`.
- `note-seal` shows the same note and button text on `/garage-door-bottom-seal`.
- `note-fuels` shows the same note and button text on `/garage-heaters`.
- `note-date` shows `Updated 2026-11-24.` and Article `dateModified` `2026-11-24`.
- `note-affiliate` keeps `tag=laqaer-20` and the paid-link disclosure. Do not open the Amazon links.

## How to get to it (user POV)

- Choose `Infrared` in the Heaters menu.
- Choose `Bottom seal` in the Seal & insulate menu.
- Choose `All fuels` in the Heaters menu.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.
- Home HTML lists `Infrared`, `Bottom seal`, and `All fuels`.

- **Infrared.** From `/`, choose `Infrared`. Run `bay-heat follow --from / --name "Infrared" --expect "Infrared garage heaters" --expect "Black Friday and holiday prices change daily, so check today's price on Amazon." --expect "Updated 2026-11-24." --expect "Check today's price" --expect "tag=laqaer-20"`. Status is `200`. The path is `/infrared-garage-heater`. Printed `json-ld` includes `Article`.
- **Bottom seal.** From `/`, choose `Bottom seal`. Run `bay-heat follow --from / --name "Bottom seal" --expect "Garage door bottom seals" --expect "Updated 2026-11-24." --expect "Check today's price"`. Status is `200`.
- **All fuels.** From `/`, choose `All fuels`. Run `bay-heat follow --from / --name "All fuels" --expect "Garage heaters by fuel" --expect "Updated 2026-11-24." --expect "Check today's price"`. Status is `200`. The path is `/garage-heaters`.
- **Proof.** Snapshot each page. Run `bay-heat snapshot /infrared-garage-heater --dir .cursor/skills/verify-bay-heat/evidence/seasonal-price-note --screenshot` and the same for `/garage-door-bottom-seal` and `/garage-heaters`. Write `PROOF.txt` with feature id `seasonal-price-note` and entry `Infrared, Bottom seal, and All fuels from /`.

## Gotchas

- Amazon Associates hrefs are live. Do not `follow` them. Prove the tag with `get --expect "tag=laqaer-20"`.
- The expect string is `Updated 2026-11-24.` with the period. A split between the word and the date fails that check.
- `/best-infrared-garage-heaters` returns 404 from `next dev`. `vercel.json` sends that path to `/infrared-garage-heater`.
