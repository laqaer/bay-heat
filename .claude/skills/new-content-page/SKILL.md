---
name: new-content-page
description: Step-by-step playbook for adding a brand-new page to BayHeat (not editing an existing stub) — registering it, writing it, and wiring it in. Use whenever the roadmap calls for a page that doesn't exist yet (e.g. /garage-heater-installation-cost, /terms from BLUEPRINT.md's route table).
---

# Adding a new content page

BayHeat's pages are registered before they're written — the route, title, and metadata exist as data (`lib/pages/*.ts`) independent of the page component, so nav, sitemap, and redirects all compile even before the content lands.

## Steps

1. **Register the page.** Add a `PageEntry` to the right lane file under `lib/pages/` (`core.ts`, `electric.ts`, `fuel.ts`, `seal.ts`, `data.ts`, `lab.ts`, `trust.ts`, or `safety.ts` — pick by content type, matching the existing entries' pattern). Fields: `href`, a new sequential `id` (check the highest existing `G-0xx` and increment), `title`, `h1`, `description`, `kind`, `layout` (`"verdict-first"` for a money/buy page, `"report-first"` for everything else), `nav` if it belongs in a nav group, `primaryKeyword`/`volume` if it targets one, `reviewed` (`"electrical"`, `"gas"`, or `null`), `indexable: true`, `published`/`updated` (today's date), `rev: 1`.
2. **Run `npx next typegen`** so the new route's typed-route entry exists before you write the page component (Next 16's `PageProps<'/your-route'>` needs this).
3. **Create `app/(site)/your-route/page.tsx`** following the exact boilerplate pattern already used across every other page: `findPage("/your-route")!`, `pageMetadata({...})` for the exported `metadata`, and the page body wrapped in `<ReportPage entry={entry} sources={sources}>`.
4. **Write the content** — see the `weekly-content-sprint` skill for the drafting/review pipeline this page then goes through.
5. **Check for an OG image need.** Per BLUEPRINT.md §4.9, most routes inherit `app/opengraph-image.tsx` automatically; only give a page its own `opengraph-image.tsx` if it's one of the small set of dedicated-OG routes (home, the planner, `/r/[code]`, `/can-i-run-it`, a Lab report, `/cost-to-heat-a-garage`, `/garage-heaters`) — don't add a bespoke OG image to an ordinary page.
6. **Confirm the build.** `npx next typegen && npx tsc --noEmit -p . && npx eslint . && node --test 'lib/**/*.test.ts' && npx next build` — all clean before opening a PR.
7. **Link it in.** A new page needs ≥3 inlinks from existing pages before its first crawl (see `search-desk.md`) — add the links as part of the same PR, not as a follow-up.

## Don't

- Don't write a page component before it's registered in `lib/pages/*.ts` — `findPage()` will throw at build time.
- Don't invent a new layout pattern — reuse `ReportPage` and the existing figure/commerce components; a genuinely new pattern is a design-system change, not a content-page change.
