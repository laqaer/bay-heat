# Comparison guide

A comparison guide is a single bookmarkable article. The recipe below drives `/240v-garage-heater`. The same report chrome (breadcrumb, h1, disclosure, related links) applies to `/infrared-garage-heater`.

## Sub-features

- `guide-open` reaches the 240V guide from the footer and the Heaters menu.
- `guide-identity` shows the `h1` `240V garage heaters`.
- `guide-table` exposes the breaker and wire table.
- `guide-callouts` shows the paid-link disclosure and the safety scope line.
- `guide-related` lists related heater pages after the article.
- `guide-affiliate` keeps Amazon links tagged `laqaer-20`. Do not open them.

## How to get to it (user POV)

- Choose `Power it` in the footer.
- Choose `240V` in the Heaters menu.
- Open `/240v-garage-heater` directly.
- From a related card, choose `240V`.

## Driving it with bay-heat

Preconditions:

- Doctor is healthy at `http://127.0.0.1:4317/`.
- Home HTML still lists the `240V` and `Power it` links.

- **Footer entry.** From the hub, choose `Power it`. Run `bay-heat follow --from / --name "Power it" --expect "240V garage heaters" --expect "The breaker and wire, for every common size"`. Status is `200`. The path is `/240v-garage-heater`.
- **Menu entry.** From `/`, choose `240V`. Run `bay-heat follow --from / --name "240V" --expect "240V garage heaters"`. Same path.
- **Breadcrumb.** On the guide, choose `Home`. Run `bay-heat follow --from /240v-garage-heater --name "Home" --expect "One garage. Seven answers."`.
- **Table and disclosure.** Run `bay-heat get /240v-garage-heater --expect "The breaker and wire, for every common size" --expect "Paid links:" --expect "General information." --expect "tag=laqaer-20"`.
- **JSON-LD.** Run `bay-heat get /240v-garage-heater`. Printed `json-ld` includes `WebSite`, `Organization`, and `BreadcrumbList`.
- **Related.** Choose `Electric` from the related list. Run `bay-heat follow --from /240v-garage-heater --name "Electric" --expect "Electric garage heaters"`.
- **Money page.** From `/`, choose `Infrared`. Run `bay-heat follow --from / --name "Infrared" --expect "Infrared garage heaters" --expect "tag=laqaer-20" --expect "Questions" --expect "FAQPage"`. The path is `/infrared-garage-heater`. The 240V guide does not have a Questions section.
- **Proof.** Snapshot the 240V guide after the footer follow. Run `bay-heat snapshot /240v-garage-heater --dir .cursor/skills/verify-bay-heat/evidence/comparison-guide --screenshot`. The png and `*.txt` show `240V garage heaters` and `Related`. Write `PROOF.txt` with feature id `comparison-guide` and entry `Power it`.

## Gotchas

- Several links contain the words 240V. `follow` uses an exact name match first, so `240V` hits the menu label.
- Amazon Associates hrefs are live. Do not `follow` them. Prove the tag with `get --expect "tag=laqaer-20"`.
- Related cards use the short nav label (`Electric`), not the long title.
- Proving the 240V guide plus one Infrared follow does not prove every sibling. Say the rest of the family was not driven.
