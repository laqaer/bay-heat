# BayHeat Guide

Boring comparison site for electric garage and workshop heaters: 120V vs 240V, forced-air vs infrared, portable vs ceiling-mount, wall vs ceiling, seal-first vs more watts, operating cost (watts × hours × your rate), and electric vs propane.

**Brand:** BayHeat Guide  
**Domain:** [bayheatguide.com](https://bayheatguide.com) (live on Vercel; production domain wired, www → apex)  
**Contact:** [hello@bayheatguide.com](mailto:hello@bayheatguide.com)  
**Publisher:** Laqaer Products

## Mogul factory

This repo is **Mogul factory Site #1** — the first Laqaer Products comparison property in the Mogul factory line.

Mogul is the factory that ships small, useful buying-guide sites (circuit-honest, no doorway spam, no invented review scores). BayHeat Guide is the garage-heat vertical. Do not mix other Laqaer consumer brands into this codebase.

## Stack

- Next.js App Router (16) + TypeScript
- Tailwind CSS v4
- Static editorial pages, JSON-LD (`WebSite` + `Article` on guides)
- Vercel-ready (`npm run build` / `npm run start`; no env vars required)

## Local setup

Requires Node.js 20+ (22 is fine).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
```

## Deploy on Vercel

1. Import `laqaer/bay-heat`.
2. Framework preset: **Next.js**. Leave build/output commands at defaults (`next build`).
3. No environment variables are required for the editorial site.
4. Production domain `bayheatguide.com` is wired (apex 200, www → apex). The default Vercel hostname `bay-heat.vercel.app` remains available for previews.
5. Replace `public/ads.txt` and affiliate placeholders before serving ads or live retailer links.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Decision-tree hub and links to every guide |
| `/best-electric-garage-heaters-by-size` | 1-car / 2-car / 3-car wattage ranges + insulation caveats |
| `/120v-vs-240v-garage-heater` | Circuit, breaker, and continuous-load reality |
| `/forced-air-vs-infrared-garage-heater` | Drafty shops vs spot heat |
| `/best-ceiling-mount-garage-heaters-under-200` | Comfort Zone / Fahrenheat-class matrix (no fake scores) |
| `/portable-garage-heaters-15a-circuit` | Milkhouse / utility heaters on 15 A circuits |
| `/wall-mount-vs-ceiling-garage-heater` | Joist load, throw, headroom, wall vs ceiling |
| `/insulate-garage-before-heater-upgrade` | Seal/insulate first vs buying more watts |
| `/electric-garage-heater-operating-cost` | Nameplate watts × hours × your $/kWh (example rates only) |
| `/electric-vs-propane-garage-heater` | Electric vs propane: attached air, shop BTU, CO/venting, cost method |
| `/about` | Brand, editorial standards, contact |
| `/privacy` | Privacy policy for a content + affiliate site |
| `/robots.txt` | Generated |
| `/sitemap.xml` | Generated |
| `/ads.txt` | Placeholder seller file |

Affiliate disclosure and electrical / fire-safety language appear in the footer on every page.

## Editorial rules

- Nameplate and manual figures only. No composite scores.
- Wattage-per-square-foot numbers are planning brackets, not load calculations.
- “Under $200” is a shopping class; street prices move.
- This is not electrical, fire-code, or design advice. Hire a licensed electrician for 240 V hardwired work.
