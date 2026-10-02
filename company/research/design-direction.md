# Design direction: three art directions and a recommendation

**Date:** 2026-09-25 · **Author:** creative-direction research agent · **Status:** proposal for the build team and the operating agent team
**Scope:** visual identity for the rebuilt garage-climate brand (working name **BayHeat**, domain bayheatguide.com). It covers heating, cooling, insulation and sealing, plus the flagship interactive **Garage Climate Planner**.
**Hard constraints we designed against:** no photography at all · Google Fonts only, via `next/font/google` (each family below was checked against `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` in this repo) · Next.js 16.3 App Router + React 19.2 + Tailwind v4 · no heavy 3D libraries · mobile LCP < 2.5 s · `prefers-reduced-motion` respected · affiliate pages must still convert.

---

## 0. TL;DR

1. **Recommended direction: A, "IRONBOW" (the thermal-camera brand).** The whole brand is shown through an infrared camera. Heat is the only saturated color, and every colored pixel means a temperature. Nobody in the niche uses this visual language (see `competitors.md` §3.3). It ships without photos, because the imagery is computed from our own heat-loss model. It is also the most shareable result format ("my garage through a thermal camera").
2. It has **two surfaces**: a dark **"Camera"** surface for the home page, the planner and the hubs, and a light **"Inspection Report"** surface for long-form guides, comparison tables and print. The report surface borrows the spec-sheet rigor of Direction B. Real FLIR inspection reports look exactly like this: white pages with thermal frames embedded.
3. **The signature hero is a live 160×120 thermal field.** That is the true sensor resolution of a FLIR Lepton 3.5 or FLIR ONE Pro. It is computed with a small JavaScript diffusion loop on a 2D canvas (no WebGL, about 6 KB gzipped), upscaled with CSS and overlaid with SVG line art of a garage section. A pre-baked 160×120 PNG frame (about 10 KB) paints at once, so LCP stays on the H1 text.
4. **Type (2 variable families):** **Archivo** with the `wdth` 62–125 and `wght` 100–900 axes, for display, UI and body. **Martian Mono** with `wdth` 75–112.5 and `wght` 100–800, for readouts, specs and numbers.
5. **Color:** a warm-black "sensor" background `#08090C`, bone text `#F3EFE6` (17.35:1), and a **Forge** heat ramp (`#3A0D0B → #8E1B0E → #D9480F → #F77F00 → #FCBF49 → #FFF1C9`) with a **Frost** cold ramp (`#BCE9F5 → #3FA7C9 → #16607F → #0E2A3D`). The single action color is **Ember `#FF8A1F`**, which gives 8.45:1 on black.
6. **Deliberate deviation from real ironbow:** true FLIR ironbow runs through indigo and violet in its lower 30% (`#220085`, `#6D009C`, `#AF0198`). That is also the most recognizable **AI-slop** hue. Our brand ramp is therefore "iron without the violet": a blackbody-style Forge ramp for heat and an Arctic-style Frost ramp for cold. Blue↔orange is also the most color-vision-deficiency-safe diverging pair.

---

## 1. What the research says (inputs to the directions)

### 1.1 What wins in 2025–2026 (Awwwards / Godly / SiteInspire patterns)
| Reference | What to steal | What not to copy |
|---|---|---|
| **Linear** (2026 refresh) | Warm near-black (`#08090a`, `#0f1011`) rather than cold blue-black. Text `#f7f8f8`. Color is **rare** and reserved for state. Dense, confident hierarchy. Themes derived from 3 inputs: base, accent, contrast. | Its violet accents (`#5e6ad2`, `#8b5cf6`) are the exact AI-slop hue. |
| **Vercel / Geist** | An exposed grid: 1px hairlines that draw the layout, mono labels, and product UI used *as* the illustration. | Geist itself; it now reads as "a Vercel template". |
| **Teenage Engineering** | Ruthless reduction and one idea per viewport. A **catalog split by 1px grey dividers instead of cards and shadows**, so it reads like a spec sheet. Tiny, precise type. Palette of `#ffffff / #d8d8d8 / #a8a8a8 / #484848 / #181818`. The product is shown as an object. | Photography-led product shots (we have none). |
| **Nothing** | **Dot-matrix readouts** (Ndot) as brand voice; strict monochrome plus one signal color. | Ndot is proprietary. **Doto** on Google Fonts is the dot-matrix equivalent. |
| **Rivian** | Monochrome plus **one warm accent** (`#ffac00`). Type so large it becomes architecture. Negative tracking that scales with size: −0.020 em at 24 px to −0.045 em at 120 px. | Full-bleed cinematic photography. |
| **Aesop / Oura** | Editorial pacing, warm restraint, generous negative space, and copy that sounds like a person. | Soft beige luxury, which is too close to the current cream/serif site. |
| **Fauna Robotics** (Awwwards SOTD 17 Jun 2026, Developer Award + Product Honors, 7.39/10, by O0) | Proof that an **illustration-led, 2-color** product site (`#EFEFEF` / `#D1E3FF`) with interactive gestures wins SOTD without photography. | Its Webflow template feel. |
| **Awwwards SOTD, Sep 2026** (The Tie-break 25 Sep, Moto Finance 24 Sep, Sobha 23 Sep, …) | Every recent winner also carries the **Developer Award**. Judges reward *working, performant interaction*, not only visuals. | Portfolio-style scroll-jacking. |
| **Tactile/editorial brutalism, the 2026 trend** (Fireart, Setproduct, Studio 2am) | Containers separated by **1px solid borders**, **0px corners or pills** (no 8px radius), raw geometry, and industrial type projecting authority. | Ugly-on-purpose brutalism that hurts conversion. |

### 1.2 Thermal-imaging aesthetics (FLIR)
- FLIR palettes include **Ironbow** (general purpose; black → blue/violet → magenta → orange → yellow → white, modeled on heated metal), **Rainbow / Rainbow HC** (maximum contrast, but not perceptually uniform, so avoid it for data), **Arctic** (blues for cold, golds for hot, good for spotting cold leaks), **White-hot / Black-hot** (greyscale) and **Lava**.
- **Real ironbow values**, sampled from a 433-step FLIR-style LUT (github.com/MickTheMechanic/FLIR-style-thermal-color-palettes, `IRONBOW.c`):

| t | 0.0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| hex | `#00000A` | `#220085` | `#6D009C` | `#AF0198` | `#CF197B` | `#E64616` | `#F26E01` | `#FB9A00` | `#FECA01` | `#FFEE57` | `#FFFFF6` |

  From t = 0.1 to 0.35 the real ironbow is **indigo and violet**, the hue range that marks a site as AI-generated. Our brand ramps (§3.A) keep ironbow's upper half, which is heated metal, and replace the violet low end with FLIR-Arctic cyans for cold.
- **Sensor authenticity:** consumer thermal cameras are low resolution. The FLIR Lepton 3.5 and FLIR ONE Pro are **160×120**, and older FLIR ONE units are 80×60. Rendering our heat field at 160×120 and upscaling is **both more authentic and roughly 50× cheaper** than full-resolution rendering: 19,200 cells per frame.
- The **camera HUD** vocabulary is brand-ownable and free to draw: corner brackets, a center crosshair with spot-meter readout ("SP1 38.4 °F"), a vertical scale bar with min/max, an emissivity tag ("ε 0.95"), a frame counter and a timestamp.

### 1.3 Industrial / workshop design language
- **ANSI Z535.1 safety colors:** safety orange is about `#FF7900` in digital approximations (`#FF6700` and `#FF6600` are also used). Orange = WARNING, yellow = CAUTION. Using orange as a *warning semantic* is honest in our niche (CO, clearances, circuits), and using it as brand decoration dilutes it.
- **Niche palette collisions to avoid** (from `competitors.md`): VEVOR orange `#FF5023`, ToolGrit `#FB8500`, corporate blues `#1C5F8B`, `#2271B1`, `#046BD2`, WordPress `#00D084` / `#0693E3`, thegarage.guide beige `#F5F0EB` / `#C8875F`, and Tailwind indigo `#4F46E5`. **A flat safety-orange brand would look like VEVOR.** A thermal *ramp* brand is unclaimed.
- Spec-sheet, blueprint and stencil vocabulary: dimension lines with arrowheads, leader callouts, part numbers, a drawing "title block" (DRAWN, REV, DATE, SHEET 1/3), hatch patterns, rating nameplates (the UL label on a heater), dotted-leader spec rows, and hazard stripes.

### 1.4 What makes calculator/tool UIs delightful (and what competitors lack)
- **Direct manipulation over forms.** Tap a garage illustration, not a dropdown. Competitors (howmanybtus 2/10, ToolGrit 5/10, PickHVAC 4/10) are plain forms.
- **Instant, continuous feedback.** Every input change updates the result within one frame. No "Calculate" button, except as a progressive-enhancement fallback.
- **Show the physics.** FIRGELLI's calculator shows "heat flow through layers in real time", and MyHEAT's award-winning *heat-loss maps* use thermal mapping *as the product*. Showing the mechanism builds trust, and in our niche trust is the conversion.
- **A shareable artifact at the end.** A permalink plus an OG card that looks like a thermal snapshot. No competitor offers one.
- **Ranges, not false precision.** Show "34,100 BTU/h ±20%" as a band. Tabular numerals prevent jitter.
- **Tactile controls with keyboard parity.** Steppers, segmented controls and sliders that snap to real-world values (ceiling 8/9/10/12 ft, doors 9×7 or 16×7).

### 1.5 Platform facts that shape the motion spec
- **CSS scroll-driven animations** (`animation-timeline: scroll()/view()`): supported in Chrome/Edge 115+ and Safari 26 (Sep 2025; threaded in 26.4). Firefox 152 (Jun 2026) still ships them behind `layout.css.scroll-driven-animations.enabled`, and they are an Interop 2026 focus. Global support is about 84%. **Use as progressive enhancement inside `@supports (animation-timeline: view())`**, with the final state as the default.
- **View Transitions:** same-document transitions are Baseline (Firefox 144+). Cross-document transitions are not yet in every browser. In **Next 16.3 App Router, `import { ViewTransition } from 'react'` works with no config.** Navigations are transitions, and `<ViewTransition name=…>` morphs shared elements (see `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`). Without support, the app works normally.
- **`next/font/google` `axes` option:** by default only `wght` is included. Extra axes (`wdth`, `opsz`, `ROND`, …) must be requested explicitly, and each one adds bytes.
- **Tiny shaders exist** if we ever want WebGL: `@paper-design/shaders-react` (Apache-2.0, zero-dependency, per-shader tree-shaking) includes a **Heatmap** shader. We do **not** need it for Direction A, because a 160×120 canvas-2D field is cheaper and more authentic. Keep it as an option for a later OG or hero experiment.

---

## 2. Scoring summary

| Criterion (weight) | A · IRONBOW | B · SHOP DRAWING | C · INSTRUMENT |
|---|---|---|---|
| Differentiation in SERP, social and Pinterest (25%) | **10**: no one in the niche uses it | 7: blueprint is familiar | 8: novel in the niche, a known look in tech |
| Conversion fit, trust and affiliate (20%) | 8 | **9**: spec tables sell | 7 |
| Planner "wow" and shareability (20%) | **10**: result = thermal snapshot | 7: receipt/work order | 9: device readout |
| Build cost and risk, no photos (15%) | 7: needs a heat-field component | **9**: SVG + CSS only | 6: custom controls are a11y-heavy |
| Performance risk (10%) | 8 | **10** | 8 |
| Seasonal flex, heating to cooling (10%) | **10**: Frost ramp = cooling mode | 8 | 8 |
| **Weighted** | **8.95** | 8.20 | 7.65 |

---

## 3. The three directions

### A · IRONBOW: "See your garage the way heat does."

**Concept.** The site is a thermal camera pointed at your garage. Every colored pixel is a temperature and every number is traceable. The planner doesn't *tell* you where heat goes; it *shows* you, in the visual language of the tool a pro would use.

**Mood.** Night-shift workshop. A sensor-black screen, warm bone type and one glowing object. Calm, forensic and confident: equal parts FLIR inspection report and Teenage Engineering restraint. The brand is not "cozy" or "HVAC blue".

#### A.1 Color tokens

**Camera surface (dark, default for home, planner, hubs, OG images)**
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--ir-bg` | `#08090C` | Page background ("sensor black", warm-neutral like Linear's `#08090a`) | — |
| `--ir-surface` | `#12151B` | Panels, planner steps, table heads | — |
| `--ir-surface-2` | `#1A1E26` | Hover/raised, input wells | — |
| `--ir-line` | `#2A2F38` | 1px hairlines, grid rules (decorative) | 1.48:1 (decorative only, never the sole affordance) |
| `--ir-text` | `#F3EFE6` | Primary text ("bone") | **17.35:1** on bg · 15.93:1 on surface (AAA) |
| `--ir-text-2` | `#A3A7B0` | Secondary text | **8.26:1** on bg (AAA) |
| `--ir-text-3` | `#80858F` | Captions, units, metadata | **5.38:1** on bg · 4.94:1 on surface (AA) |
| `--ir-ember` | `#FF8A1F` | **The one action color.** Primary buttons, focus ring, active state, links on hover | 8.45:1 on bg · 7.75:1 on surface. **Button text `#08090C` on ember = 8.45:1** |
| `--ir-glow` | `#FFB547` | Result numbers, highlights | 11.33:1 on bg |
| `--ir-frost` | `#5CC8E6` | Cold/heat-loss annotations, cooling mode accent | 10.30:1 on bg |
| `--ir-alarm` | `#FF4F3A` | Safety warnings only (CO, clearances, overloaded circuit) | 6.10:1 on bg |

**Brand ramps (data and illustration only, never decorative backgrounds)**
```css
/* Forge: heat. Blackbody / upper-ironbow, no violet. Interpolate in OKLab. */
--ramp-forge: linear-gradient(in oklab 90deg,
  #3A0D0B 0%, #8E1B0E 18%, #D9480F 40%, #F77F00 58%, #FCBF49 78%, #FFF1C9 100%);
/* Frost: cold / loss. FLIR-Arctic style. */
--ramp-frost: linear-gradient(in oklab 90deg,
  #0E2A3D 0%, #16607F 35%, #3FA7C9 70%, #BCE9F5 100%);
/* Arctic-Iron diverging: cold ← neutral → hot, for heat-loss maps with a set-point. */
--ramp-diverge: linear-gradient(in oklab 90deg,
  #BCE9F5 0%, #3FA7C9 18%, #16607F 36%, #1A1C22 50%, #8E1B0E 64%, #F77F00 82%, #FFF1C9 100%);
```
Non-text contrast of ramp stops on `#08090C`: `#D9480F` 4.63, `#F77F00` 7.58, `#FCBF49` 12.03, `#3FA7C9` 7.19, `#BCE9F5` 15.28. These pass 3:1 for chart marks. Dark stops (`#3A0D0B` 1.18, `#8E1B0E` 2.19, `#0E2A3D` 1.34, `#16607F` 2.86) **may only appear inside a filled heat field with a labeled scale bar, never as a line, bar or text.** The canvas LUT uses 256 entries interpolated from the same stops.

**Inspection Report surface (light, for guides, comparison tables, methodology, print, and `prefers-color-scheme: light`)**
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--rp-bg` | `#F6F4EF` | Page ("report paper", cooler than today's cream `#F3EEE4`) | — |
| `--rp-card` | `#FFFFFF` | Tables, spec plates | — |
| `--rp-line` | `#DAD6CC` | Hairlines | decorative |
| `--rp-text` | `#15171C` | Body | **16.31:1** (AAA) |
| `--rp-text-2` | `#565B66` | Secondary | **6.19:1** |
| `--rp-ember-ink` | `#B8430B` | Links and emphasis (Ember darkened for paper) | **4.97:1** (AA) · on white `#C2410C` 5.18:1 |
| `--rp-frost-ink` | `#16607F` | Cold annotations on paper | **6.34:1** |
| `--rp-heat-ink` | `#8E1B0E` | "Hot" data labels on paper | 8.26:1 |
| Rule | — | **Never put `#F77F00` or `#FF8A1F` text on paper (2.39:1).** Orange on paper is a fill only, with `#15171C` text on top. | — |

Tailwind v4 wiring (in `app/globals.css`):
```css
@theme inline {
  --color-bg: var(--bg); --color-surface: var(--surface); --color-line: var(--line);
  --color-fg: var(--text); --color-fg-2: var(--text-2); --color-fg-3: var(--text-3);
  --color-ember: var(--ember); --color-frost: var(--frost); --color-alarm: var(--alarm);
  --font-sans: var(--font-archivo); --font-mono: var(--font-martian);
}
:root, [data-surface="camera"] { --bg:#08090C; --surface:#12151B; --line:#2A2F38; --text:#F3EFE6; --text-2:#A3A7B0; --text-3:#80858F; --ember:#FF8A1F; --frost:#5CC8E6; --alarm:#FF4F3A; color-scheme: dark; }
[data-surface="report"] { --bg:#F6F4EF; --surface:#FFFFFF; --line:#DAD6CC; --text:#15171C; --text-2:#565B66; --text-3:#565B66; --ember:#B8430B; --frost:#16607F; --alarm:#B3261E; color-scheme: light; }
```

#### A.2 Typography
```ts
import { Archivo, Martian_Mono } from "next/font/google";
export const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
export const martian = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--font-martian", display: "swap" });
```
| Role | Family / axes | Size (fluid) | Line / tracking |
|---|---|---|---|
| Hero display | Archivo `wdth 125, wght 800` (wide, heavy, industrial) | `clamp(2.75rem, 1.4rem + 5.6vw, 7rem)` | 0.9 / −0.045em at ≥96px, −0.03em at mobile |
| H1 (guides) | Archivo `wdth 112, wght 750` | `clamp(2.25rem, 1.5rem + 3vw, 4rem)` | 1.0 / −0.03em |
| H2 | Archivo `wdth 100, wght 700` | `clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)` | 1.1 / −0.02em |
| Eyebrow / labels / nav | Archivo `wdth 75, wght 600`, UPPERCASE | 12–13px | 1.2 / +0.08em |
| Body | Archivo `wdth 100, wght 400` (`500` for bold-ish emphasis) | 17px desktop / 16px mobile | 1.6 / 0 · measure 62–68ch |
| Readouts, specs, numbers | Martian Mono `wdth 87.5, wght 400` (500 for results) | 13–15px; result numbers `clamp(2.5rem, 1.5rem + 4vw, 5rem)` at `wdth 75, wght 500` | 1.0 / −0.02em · monospace, so tabular by nature |
| Units | Martian Mono `wght 300`, `--text-3`, 0.6em, `vertical-align: 0.35em` | — | — |

Why: Archivo's width axis gives a whole "type family" from one file: wide for monuments, condensed for dense labels and table heads. Martian Mono's squared, instrument-like shapes read as a device readout without resorting to a pixel font. Neither is on the AI-default list (Inter, Poppins, Space Grotesk, Geist).

#### A.3 Grid and layout
- **12 columns** at ≥1024px (max 1392px content, 24px gutters, 48px outer margin). **8 columns** at 640–1023px. **4 columns** below 640px with **16px gutters** (Tailwind `px-4`).
- **Exposed grid:** a 1px `--ir-line` vertical rule at column 1 and column 12 edges, plus horizontal section rules. Sections are **numbered in the rail** in Martian Mono: `01 / SIZE IT`, `02 / POWER IT`, `03 / PRICE IT`, `04 / FIX IT`. These are the four brand verbs from `competitors.md` §4.
- **Asymmetry:** text lives in columns 1–5; visuals take 6–12 and may bleed to the right viewport edge. Nothing is centered except the camera crosshair.
- 4px baseline. Section rhythm is 96/128px desktop and 64px mobile.
- Corners are **0px** for panels and tables, **2px** for inputs, and **pill** only for filter chips. Elevation comes from surface steps plus a 1px line. The one shadow token is `0 0 0 1px var(--line), 0 24px 48px -24px #000A`, for the planner result card only.

#### A.4 Iconography
- **One custom inline-SVG sprite of about 28 glyphs**, drawn on a 24px grid with a **2px stroke, square caps and 45° cuts**. They borrow the geometry of IEC 60617 / NEMA electrical symbols. The set covers:
  - Fuels: electric (the resistor zig-zag), propane (cylinder), natural gas (valve), diesel (drop), heat pump (reversing arrows)
  - Mounts: ceiling, wall, portable
  - Envelope: wall, ceiling, door, window, seal
  - Circuits: 120V/15A, 240V/30A, breaker
  - Safety: CO, clearance, vent
- UI chrome (chevron, close, external-link) uses the same stroke. **No icon library dependency.**
- Icons appear only where they speed recognition, for example fuel and mount pickers. Section headers use **numbers, not icons**.
- The **brand mark** is a square "sensor frame": four corner brackets with a hot dot at the center that shifts from `#F77F00` to `#FFF1C9`. The wordmark is `BAYHEAT` in Archivo `wdth 125 wght 800`, with a 2px Forge-ramp underline that doubles as a scale bar. The favicon is the frame plus the hot dot on `#08090C`.

#### A.5 Illustration / "3D" without heavy libraries
1. **Garage section and isometric line art (SVG).** 1-car, 2-car and 3-car presets, attached or detached, with doors, windows and heater positions. Line art is drawn at 1.5px `--ir-text` at 70% opacity and composited over thermal fields. Build it as React components with props (`bays`, `ceilingFt`, `doorType`), not as static files, so the planner reuses them. Isometric projection: `x' = (x − y)·cos30°`, `y' = (x + y)·sin30° − z`.
2. **Thermal field (canvas 2D, 160×120).** See A.7. It is the "photography" of the brand.
3. **Product-class silhouettes (SVG).** Ceiling unit heater, wall heater, milkhouse, radiant panel, diesel parking heater, mini-split head, vented gas unit heater, garage-door kit panel. Draw generic class shapes, not brand likenesses, rendered as "thermal snapshots" with the unit's hot face in Forge.
4. **Data illustrations.** The "where your heat goes" stacked bar or Sankey, cost-per-hour bars by fuel, and a warm-up curve (temperature vs minutes). These are SVG, server-rendered, and zero-JS until interactive.
5. **Pseudo-3D:** CSS `perspective: 1200px` and `rotateX(55deg) rotateZ(−45deg)` on flat SVG layers produce an exploded isometric (walls, ceiling, door and slab lifting apart by `translateZ`) for the "where heat goes" moment. No three.js.

#### A.6 Photography policy
**No photographs.** That means no stock, no AI-photoreal images and no scraped retailer images.
- Product imagery comes from our class silhouettes. If a real product image is ever needed, use only Amazon SiteStripe / PA-API-compliant image embeds (PA-API needs qualifying sales first). **Never** hotlink or rehost `m.media-amazon.com` images.
- **Never show a static Amazon price.** Associates rules forbid displaying prices that aren't PA-API-fresh. Use "Check price" CTAs with price *bands* we state as ours ("typically $150–$250, checked 2026-09"), only where we can source them.
- If real thermal photos are ever taken with the owner's camera, they are **labeled with camera model, date, outside temperature and emissivity**. They supplement the computed frames and never replace the model.

#### A.7 Signature motion moments (with implementation)

**Motion tokens:** `--ease-settle: cubic-bezier(.2,.8,.2,1)`, `--ease-shutter: steps(3, end)`, durations 120/240/480/900 ms. Every animation must encode a state change such as heat, time or load (see anti-slop rule 10).

**(1) Hero: the live thermal field** (`components/thermal/ThermalField.tsx`, client component)
- **Grid:** `Float32Array(160*120)` of temperatures in °F. There are three cell types: *outside* (fixed at `T_out`, e.g. 0 °F), *envelope* (conductance `k = 1/R` scaled; R-0 steel door ≈ 1.0, R-13 wall ≈ 0.08, leak cells at the door perimeter, head and sill ≈ 2.5) and *inside air* (k = 1).
- **Heater cells** add `q` per tick. They sit at the ceiling corner for a unit heater, or on the floor for a portable.
- **Update:** 4 Jacobi relaxation iterations per frame, `T[i] += α·Σ k_ij·(T[j] − T[i]) + q_i` with `α = 0.2`. Colorize through a **256-entry `Uint32Array` LUT** built once from the Forge/Frost stops, write into `ImageData(160,120)`, then `putImageData` to a 160×120 canvas. The canvas is sized by CSS to the viewport (4:3) with `image-rendering: auto`; bilinear upscaling looks exactly like a real camera's interpolated output.
- **Pointer / touch:** a crosshair follows the pointer and reads `SP1 38.4 °F`, interpolated from the grid. Its position is a pure CSS transform. A **keyboard mode** moves it on arrow keys, and it is announced via `aria-live="polite"` only on keyup.
- **Toggle chips under the frame:** `As-is` / `Door kit + seal` / `+ R-13 walls`. Each re-parameterizes the conductances. The field *visibly cools at the leaks* over about 1.5 s of simulation, and the H1-adjacent readout interpolates **"Heat loss 34,100 → 22,700 BTU/h"**. These numbers are example outputs from the real planner model with stated inputs; never hard-code marketing numbers.
- **Budget and lifecycle:** under 6 KB gzipped. Run at 30 fps on `pointer: coarse`, 60 fps otherwise. **Pause** via `IntersectionObserver` when off-screen and on `visibilitychange`. **Skip entirely** when `navigator.connection.saveData` is on or `prefers-reduced-motion: reduce` matches; show the static frame instead.
- **LCP-safe boot:** the frame's first paint is a **pre-baked 160×120 PNG** (steady-state solution, about 8–12 KB) set as the CSS background of the same box. It has a fixed `aspect-ratio: 4/3`, so there is zero CLS. The canvas mounts on `requestIdleCallback` (fallback `setTimeout(…, 200)`) and cross-fades in over 240ms. **The LCP element is the H1 text**, never the canvas.

**(2) Scroll: "Where your heat goes"** (sticky section)
- The garage isometric sits `position: sticky`. As the section scrolls, the envelope layers separate (exploded view, `translateZ` 0 → 40/80/120px). Each layer's leader line draws in (`stroke-dashoffset` from path length → 0), and its share of the load fills a stacked bar (e.g. door 31% · air leaks 24% · ceiling 22% · walls 15% · slab 8%, computed for the example garage).
- **Implementation:**
  ```css
  @supports (animation-timeline: view()) {
    .layer-door  { animation: lift-door linear both; animation-timeline: view(); animation-range: entry 20% cover 40%; }
    .bar-seg     { transform-origin: left; animation: fill-x linear both; animation-timeline: view(); animation-range: entry 30% cover 55%; }
    @keyframes fill-x { from { scale: 0 1 } to { scale: 1 1 } }
  }
  @media (prefers-reduced-motion: reduce) { .layer-door, .bar-seg { animation: none; } }
  ```
  **The default (unsupported) state is the final state**, so Firefox users and reduced-motion users see the finished diagram. An optional `IntersectionObserver` fallback can add `.is-in` for a one-shot CSS transition.

**(3) Planner result reveal: "capture"** (total ≤ 1.2 s)
1. **Shutter (0–180ms):** the planner's garage thumbnail flashes white-hot noise for 3 frames (`steps(3)`), like an IR camera's flat-field calibration click. It is canvas random noise at 80×60.
2. **Develop (180–700ms):** the thumbnail repaints from greyscale to thermal as a **radial wipe from the heater position**: `clip-path: circle(0% at var(--hx) var(--hy))` → `circle(150%)`.
3. **Settle (180–900ms):** the BTU/h number counts up with a **critically damped spring** (1.5% overshoot, then settle). This reads as a sensor settling, not a slot machine. It uses Martian Mono, so there is no width jitter. **Only the final value** goes to `aria-live`.
4. **Explain (500–1100ms):** "where heat goes" bar segments fill in descending order of size. Then the scale bar's min/max labels tick in.
5. **Match (800–1200ms):** at most 3 equipment "spec plates" slide up 12px with a 60ms stagger.
6. **Share:** the result card is wrapped in `<ViewTransition name="result-card" share="morph" default="none">` and **morphs** into the share sheet / permalink page. Its OG image (`next/og` `ImageResponse`, 1200×630) is the same composition: thermal frame on the left; "18,400 BTU/h · $0.61/h on propane · 2-car · Minneapolis ZIP 554xx" on the right in Martian Mono; the Forge scale bar along the bottom.

**(4) Micro-interactions.** Input focus = a 2px Ember ring offset by 2px. Segmented controls slide a 1px-bordered indicator (`transition: translate 240ms var(--ease-settle)`). Steppers repeat on hold (400ms, then 60ms). Route changes crossfade 180ms (a default `<ViewTransition>`), and the guide hero's thermal thumbnail morphs from the hub card that linked to it.

**Reduced motion:** all of the above collapse to the final state with a 120ms opacity change at most. The hero shows the static PNG. The planner result appears instantly, and the "develop" wipe becomes a cut.

#### A.8 Product cards, comparison tables, spec sheets

**Product card = "spec plate"** (modeled on a heater's rating nameplate):
```
┌──────────────────────────────────────────────┐
│ [class silhouette in thermal]   CEILING · 240V│
│ Fahrenheat FUH54                              │  ← Archivo wdth 100 wght 700
│ ─────────────────────────────────────────────│
│ OUTPUT   5,000 W · 17,060 BTU/h               │  ← Martian Mono, dotted leaders
│ CIRCUIT  240 V · 20.8 A → 30 A breaker, 10 AWG│
│ FIT      ████████████░░  92% of your load      │  ← bar: your load marker vs capacity (Forge)
│ RUN COST $0.82/h at your 16.4¢/kWh            │
│ [ Check price on Amazon ↗ ]   Why this fits → │  ← Ember button, text #08090C
└──────────────────────────────────────────────┘
```
- The card is 1px bordered with 0 radius. The "FIT" bar is **computed from the user's planner result** and stored in the URL. With no planner result, the bar shows capacity against 1-, 2- and 3-car reference loads.
- Badges are text only, in Archivo `wdth 75` caps: `BEST FOR 240V`, `NO NEW CIRCUIT`, `VENTED`. There are **no stars and no invented scores**. A computed "Fit Score" is allowed, with its formula linked.
- Safety callouts use `--ir-alarm` with a left 3px bar and the CO or clearance glyph. The copy is imperative ("Combustion heater: install a UL 2034 CO alarm").

**Comparison table ("report" surface):**
- A sticky first column (model) and a sticky header row. Numbers are right-aligned in Martian Mono, with units in `--text-3`.
- **In-cell micro-bars:** each numeric cell has a 2px Forge underline scaled to the column max. The row best gets a `▲` glyph (Unicode geometric shape, not emoji) and bold weight.
- Row hover (desktop) tints `--surface-2`. Zebra striping is off; 1px rules are on.
- **Mobile below 640px:** the table becomes a horizontally scroll-snapping set of model columns (`scroll-snap-type: x mandatory`), with the spec-label column pinned. A "Compare 2" picker is also available.
- Every spec cell carries a footnote superscript linking to the manufacturer PDF. The table footer states "Specs checked 2026-09-xx · N sources".

**Spec sheet / guide page ("Inspection Report"):**
- The header block mimics a **FLIR report**. Left: the thermal thumbnail of the guide's scenario. Right: `REPORT BH-042 · REV 3 · UPDATED 2026-09-14 · SOURCES 11 · SCENARIO 2-car, R-0 door, 0 °F`.
- Body text sits in columns 3–9. The right rail (columns 10–12) holds a sticky "Your garage" mini-result, if the planner state exists, or a CTA to create one.
- Key numbers are pulled into "readout" blocks with a large Martian Mono number, a unit and a one-line meaning.

#### A.9 Hero concept (build spec)

**Desktop (1440×900):**
- **Top bar (64px):** the wordmark sits left. Nav is in Archivo `wdth 75` caps: `PLANNER · HEAT · COOL · INSULATE · METHOD`. The Ember CTA `Size my garage` sits right. A 1px bottom rule runs the full width.
- **Left, columns 1–5, vertically centered:**
  - Eyebrow in Martian Mono 12px `--text-3`: `01 / GARAGE CLIMATE PLANNER · FREE · NO SIGN-UP`
  - **H1** (Archivo wdth 125 wght 800, about 104px, 3 lines, left-aligned): "**See where your garage loses heat.**"
  - Sub (17px `--text-2`, 44ch): "Enter a ZIP and your garage. Get the heat load, the heater that fits, the circuit it needs and what it costs per hour, with every formula shown."
  - Buttons: primary **`Size my garage — 60 s`** (Ember fill, `#08090C` text, 0 radius, 56px tall), then secondary text link `See the math →` in `--text` with an underline offset of 4px.
  - A **live readout row** under the buttons in Martian Mono: `OUT 0 °F  ·  IN 50 °F  ·  LOSS 34,100 BTU/h  ·  ≈ 10.0 kW  ·  $1.64/h ELECTRIC @ 16.4¢/kWh`. It updates when the chips change.
- **Right, columns 6–12, bleeding to the right edge:**
  - The **camera frame** at 4:3 (about 780×585) with corner-bracket HUD. Top-left in Martian Mono 11px `--text-3`: `BAYHEAT IR · 160×120 · ε 0.95`. Top-right: `2-CAR · DETACHED · 24×24×9 FT`.
  - A **vertical scale bar** on the frame's right edge (12px wide, Forge/Frost diverging) with max/min labels (`71 °F` / `2 °F`).
  - A center **crosshair and spot meter** that follows the pointer.
  - Inside: the section line art (roof, ceiling joists, 16×7 door, side window, slab). The door perimeter glows Frost where cold air enters. The heater at the upper-left ceiling glows Forge. A warm plume stratifies near the ceiling (a teaching point: warm air rises, and the planner accounts for ceiling height).
  - Under the frame: 3 **chips** (`As-is` · `Door kit + seal` · `+ R-13 walls`) that re-run the simulation.
- **Below the fold:** a 1px rule, then a 4-cell "proof strip" in Martian Mono: `Sources: ASHRAE design temps · EIA state prices · NEC 210.19 / 424 · UL 2034`. This is **not** a fake logo wall.

**Mobile (390×844):**
- Top bar 56px (wordmark plus a `Plan` pill).
- Eyebrow, then the H1 at 44px / 3–4 lines. It is the **LCP element, painted by the server-rendered font** with `display: swap` and a metric-matched fallback (`adjustFontFallback` is on by default).
- Then the camera frame full-bleed (width 100vw, 4:3 ≈ 390×293) with a simplified HUD (scale bar, spot meter on touch). Chips scroll horizontally.
- The primary CTA is sticky at the bottom (`position: sticky; bottom: 16px`) after the user scrolls past the hero. It hides when the planner is on screen.

#### A.10 Risks and mitigations
- **"Dark sites convert worse on affiliate content."** Guides, tables and money pages use the light **Report** surface. The Camera surface is for brand, planner and hubs.
- **A heat field can look like a random blob.** Always pair it with line art, a scale bar with °F labels and a spot meter. If it can't be read as a temperature map, it's decoration and it goes.
- **Accessibility of color-coded data.** Every heat or cold encoding is also given as a number or label, and bars have text values. Frost↔Forge (blue↔orange) is the CVD-safe diverging pair. The canvas has an `aria-label` summary ("Thermal simulation: door perimeter coldest at 18 °F, ceiling warmest at 71 °F").

---

### B · SHOP DRAWING: "Engineered like a spec sheet. Built for your bay."

**Concept.** Every page is a technical drawing sheet for your garage, the way an engineer or a McMaster-Carr catalog would spec it. The planner outputs a **work order**.

**Mood.** Daylight drafting table: vellum paper, blueprint ink, stencil caps and a single hazard-orange signal. Honest, tool-like and slightly nerdy. Teenage Engineering's reduction meets a Grainger spec sheet.

#### B.1 Color tokens
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--paper` | `#F2F0E8` | Background (vellum) | — |
| `--paper-2` | `#E4E0D3` | Alternating sheets, table heads | ink on it 14.19:1 |
| `--rule` | `#D9D5C7` | Grid lines, hairlines | decorative (1.29:1) |
| `--ink` | `#121212` | Text | **16.42:1** |
| `--ink-2` | `#4A4A46` | Secondary | **7.80:1** |
| `--ink-3` | `#6B6962` | Captions | **4.82:1** |
| `--blueprint` | `#1A3FBF` | Dimension lines, links, blueprint panels | text on paper **7.34:1** · paper on it 7.34:1 |
| `--blueprint-deep` | `#0B2A8C` | Full-bleed blueprint sections (planner, hero) | paper text on it **10.67:1** |
| `--signal` | `#FF5A00` | **Fills only**: primary button, active step, callout flags | **ink text on it 5.99:1** · orange text on paper 2.74 (**forbidden**) |
| `--signal-ink` | `#B83E00` | Orange text on paper when needed | 4.94:1 |
| `--hazard` | `#FFD400` | Hazard stripes (`repeating-linear-gradient(-45deg, #FFD400 0 10px, #121212 10px 20px)`) on **warnings only** | ink on it 13.09:1 |
| Dark mode | bg `#0B2A8C` (blueprint), text `#F2F0E8`, rules `#2355D8` at 40%, signal unchanged | — | — |

Blueprint grid background: `background-image: linear-gradient(#1A3FBF14 1px, transparent 1px), linear-gradient(90deg, #1A3FBF14 1px, transparent 1px), linear-gradient(#1A3FBF0A 1px, transparent 1px), linear-gradient(90deg, #1A3FBF0A 1px, transparent 1px); background-size: 96px 96px, 96px 96px, 24px 24px, 24px 24px;`

#### B.2 Typography
```ts
import { Big_Shoulders_Stencil, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
const stencil = Big_Shoulders_Stencil({ subsets:["latin"], axes:["opsz"], variable:"--font-stencil" }); // opsz 10–72, wght 100–900
const plex = IBM_Plex_Sans({ subsets:["latin"], axes:["wdth"], variable:"--font-plex" });           // wdth 75–100, wght 100–700
const plexMono = IBM_Plex_Mono({ subsets:["latin"], weight:["400","500"], variable:"--font-plex-mono" }); // already in repo
```
- Display: Big Shoulders Stencil `wght 800, opsz 72`, UPPERCASE, `clamp(3rem, 1.5rem + 6vw, 8rem)`, line-height 0.85, tracking −0.01em. **Only for H1s and section numbers.** Stencil gets tiring past 2 lines.
- Headings: IBM Plex Sans `wdth 85, wght 600`.
- Body: IBM Plex Sans `wdth 100, wght 400`, 17/1.6.
- Specs: IBM Plex Mono 400/500 (tabular).
- Labels: Plex Sans `wdth 75` caps at +0.06em.

#### B.3 Grid and layout
- The page is a **drawing sheet**. There is an 8px inset border around the viewport on desktop (`outline` on `body::before`, `position: fixed`, `pointer-events: none`), plus **zone markers** A–F down the side and 1–8 along the top in Plex Mono 10px (tiny, pure delight).
- 12 columns with a 24px gutter. The **title block** is a 4-column bordered table fixed at the bottom-right of each guide's end: `DRAWN BayHeat · CHECKED [editor] · REV 3 · DATE 2026-09-14 · SHEET 1/1 · SOURCES 11`.
- 0px radius everywhere. There are no shadows at all; hierarchy comes only from rules, hatching and blueprint panels.

#### B.4 Iconography
Same 24px sprite approach as A, but drawn as **drafting symbols**: 1.5px stroke, round joins, **hatched fills** (`<pattern>` 45° lines at 3px) for materials. Insulation uses the standard batt-insulation zig-zag hatch, and concrete uses stipple. Electrical symbols follow ANSI Y32.2.

#### B.5 Illustration approach
- **Exploded axonometric garage** (SVG) with **dimension lines** (arrowheads via `<marker>`, values in Plex Mono) and **balloon callouts** (circled numbers ① … as SVG circles, not Unicode) linked to a parts list.
- **Section details:** wall assembly layers (siding / sheathing / R-13 batt / drywall) with hatches. Door panel section with a kit insert. Bottom-seal profile.
- **Installation diagrams:** diesel through-wall exhaust routing and 240V circuit single-line diagrams. These are genuinely useful and linkable.
- Heat is shown as **red-orange arrows with magnitude-scaled stroke width** (a Sankey drawn as a drafting diagram).

#### B.6 Photography policy
None. Product imagery uses **orthographic line drawings** (front, side and plan views of each product class with overall dimensions in inches). This fits the spec-sheet metaphor perfectly and avoids image licensing.

#### B.7 Signature motion
- **Hero:** the axonometric **draws itself**. SVG paths animate `stroke-dashoffset` in drafting order (slab, walls, roof, door, heater, dimension lines), 1.4 s total, `steps()`-free linear. Dimension values type on (text `clip-path` inset from right) for 300ms. It runs once on load after first paint; with reduced motion, show the finished drawing.
- **Scroll:** the exploded view **assembles** as you scroll (`animation-timeline: view()`, parts `translate` in from ±40px to 0), with a counter in the title block showing `ASSEMBLY 3/6`.
- **Planner result, "work order print":** the result card extends downward from a slot like a **receipt or work order**: `clip-path: inset(0 0 100% 0)` → `inset(0)` over 700ms using `steps(14)` for a printer cadence. Then a rubber-stamp SVG **"SIZED"** appears at −6° rotation, `scale 1.3 → 1` in 180ms, with ink texture from `feTurbulence baseFrequency=.9` + `feDisplacementMap scale=2`. Share uses a ViewTransition morph into a printable A4/Letter "work order" page (`@media print` styles for real).

#### B.8 Product cards, tables, spec sheets
- **Card = catalog entry** (McMaster style): orthographic drawing on the left, then a spec grid of `dl` rows with dotted leaders (`background: radial-gradient(circle, #6B6962 0.6px, transparent 0.8px) bottom / 4px 2px repeat-x`). A part-number-like ID sits top-right (`BH-EL-054`). The CTA is an orange fill with ink text: `CHECK PRICE ↗`.
- **Tables:** blueprint-blue header row with paper text (7.34:1) and Plex Mono values. Row groups get hatch-pattern separators. A "meets your load" column shows a filled or hollow square (■ □).
- **Spec sheets:** true two-column sheets with the title block, a revision table ("REV 3 · 2026-09-14 · updated EIA prices") and numbered source notes.

#### B.9 Hero concept
The desktop page is a vellum sheet with the blueprint grid.
- **Left, columns 1–6:** the stencil H1 in 3 lines, **"SIZE IT. / POWER IT. / PRICE IT."**, in ink, with the verb "IT" swapped for a live number on hover ("SIZE IT." becomes "34,100 BTU/H.", as a playful reveal). Below it are a Plex subhead, an orange **`START THE WORK ORDER →`** button and a tiny title block.
- **Right, columns 7–12:** the self-drawing axonometric 2-car garage with dimension lines `24'-0"`, `24'-0"` and `9'-0"`, plus 5 balloon callouts. Callouts are tappable and open a popover with the heat share for that component.
- A single hazard stripe sits at the top edge of the planner teaser: "Propane indoors? Read the CO rules first."
- **Mobile:** stencil H1 at 56px, then the drawing at 100% width, then the CTA.

#### B.10 Why it's not #1
It is excellent and cheap, but **blueprint is a known aesthetic** (many SaaS and dev-tool sites use it). Its heat story is diagrammatic rather than visceral, so it is less screenshot-able. Its best parts (title blocks, dimensioned drawings, spec-plate cards, printable work order) are adopted into A's Report surface.

---

### C · INSTRUMENT: "The garage thermostat you wish existed."

**Concept.** The planner is a **physical instrument** rendered in the browser: aluminum face, rotary knob, toggle switches, a backlit dot-matrix LCD and LED bar graphs. The site is the product manual and catalog around it. It is Teenage Engineering and Nothing, applied to garage climate.

**Mood.** Precise, playful and tactile, like a beautifully made tool you want to touch. Warm aluminum and graphite with one LED-orange signal.

#### C.1 Color tokens
| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--alu` | `#E6E3DC` | Page (warm aluminum) | — |
| `--alu-2` | `#F4F2ED` | Raised panels | graphite on it 15.38:1 |
| `--graphite` | `#1C1B19` | Text, knobs | **13.43:1** on alu |
| `--graphite-2` | `#5A5750` | Secondary | **5.62:1** |
| `--led` | `#FF4B12` | LED fills, primary button fill, active knob tick | **graphite text on it 5.14:1** · white on it 3.35 (large text only) · LED as text on alu 2.61 (**forbidden**) |
| `--led-ink` | `#A8340A` | Orange text on alu | 5.18:1 |
| `--lcd-bg` | `#161513` | LCD windows, dark mode bg | — |
| `--lcd-amber` | `#FFB000` | LCD readouts | **9.96:1** on lcd-bg |
| `--lcd-dim` | `#9C998F` | Unlit segments / secondary LCD | 6.40:1 |
| Dark mode | bg `#161513`, text `#E6E3DC` (14.24:1), accent `#FF6A2B` (6.39:1) | — | — |

Single shadow token for "physical" objects: `0 1px 0 #FFFFFF inset, 0 -1px 0 #0000001F inset, 0 12px 24px -12px #1C1B1966`. **No neumorphism**: shadows define objects (knob, device), never cards.

#### C.2 Typography
```ts
import { Google_Sans_Flex, Doto } from "next/font/google";
const gsf = Google_Sans_Flex({ subsets:["latin"], axes:["wdth","ROND","opsz"], variable:"--font-gsf" }); // wdth 25–151, ROND 0–100, opsz 6–144, wght 1–1000
const doto = Doto({ subsets:["latin"], axes:["ROND"], variable:"--font-doto" });                        // dot-matrix, ROND 0–100, wght 100–900
```
- Display: Google Sans Flex `wdth 125, wght 650, ROND 30, opsz 144`, tracking −0.04em.
- Body: Google Sans Flex `wdth 100, wght 400, ROND 0, opsz 16`, 17/1.55.
- LCD readouts: **Doto** `wght 800, ROND 100` (round dots) in `--lcd-amber`.
- Tiny panel legends (silk-screen labels): GSF `wdth 75, wght 600` caps at 10–11px, +0.1em.
- **Fallback if Google Sans Flex's multi-axis file is too heavy** (measure it; budget ≤ 90 KB): Hubot Sans (`wdth` 75–125, `wght` 200–900).

#### C.3 Grid and layout
A 12-column grid, but pages compose around **"devices"**, rectangular objects with 20px radius (the only big radius, which makes them read as hardware), screws at the corners (4px circles) and silk-screen legends. Everything else is flat on the aluminum with 1px graphite at 15% hairlines. Catalog pages use the Teenage Engineering-style **grid divided by 1px lines**, never cards.

#### C.4 Iconography
Silk-screen style: 1.5px stroke, very small (16px), always paired with a text legend, like panel markings on hardware. LED indicator dots (6px circles) carry state: off `#5A5750` at 30%, on `--led` with a 6px glow.

#### C.5 Illustration approach
- **The device** (SVG and CSS): the planner rendered as a hardware panel with knobs, toggles and an LCD.
- **Exploded "product" views** of heater classes as clean vector objects in aluminum tones (flat shading with 2–3 tonal steps), Teenage Engineering style.
- The garage is shown as a **minimal isometric block** with LED-colored heat zones.

#### C.6 Photography policy
None. Objects are vector renders. No mockup devices, no hands and no lifestyle scenes.

#### C.7 Signature motion
- **Hero:** the device floats center-right. On pointer move it tilts at most 6° (`perspective: 1000px; rotateX/rotateY` from pointer position, rAF-throttled, disabled on touch and reduced motion). The LCD cycles real example readouts in Doto: `2-CAR · R-0 DOOR · 0°F` → `34,100 BTU/H` → `10 KW · 60A · 6AWG` → `$1.64/H ELECTRIC`, with a character-by-character dot fade.
- **Knob:** a rotary input implemented as `role="slider"` with `aria-valuenow/min/max/valuetext`. Drag is angular (atan2 around the center), arrow keys step ±1, Page Up/Down step ±10, and detents snap to real values. Detents may use a 5ms `navigator.vibrate` on Android. Sound is **off by default**.
- **Scroll:** the LED bar graph beside each section fills segment by segment (`animation-timeline: view()`, `steps(10)`).
- **Result reveal:** the LCD "boots" (all dots lit for 120ms, then clear), the result scrolls in as a marquee in Doto, and a 10-segment LED bar lights to the load percentage with `steps(10)` over 500ms. Share = ViewTransition morph of the LCD window into the share card.

#### C.8 Product cards, tables, spec sheets
- **Cards = "modules"**: an aluminum tile with a silk-screen legend, a small vector render, specs in GSF `wdth 75` and a mini LCD strip showing "FITS 92%". The CTA is an LED-orange pill with graphite text.
- **Tables:** Teenage Engineering catalog style. White `#F4F2ED` rows divided by 1px graphite at 15%, hairline-thin type, and values right-aligned in tabular GSF (`font-variant-numeric: tabular-nums`).
- **Spec sheets** read like a product manual page: numbered sections, legends and tiny diagrams.

#### C.9 Hero concept
Desktop: the aluminum page.
- **Left, columns 1–5:** the H1 in GSF, **"A thermostat for decisions."** Sub: "Dial in your garage. Get the heater, circuit and cost." Primary `Start planning` is an LED pill.
- **Right, columns 6–12:** the device (≈ 620×420). The top holds an LCD window (Doto amber on `#161513`). Below it are a large ZIP input styled as a label-maker strip and 3 knobs (SIZE, INSULATION, TARGET °F) with silk-screen legends and LED indicators. **The hero device is the planner's first step**: turning a knob updates the LCD live.
- **Mobile:** the device is a full-width vertical panel. The knobs become segmented toggles, because knobs are poor on small touch screens.

#### C.10 Why it's not #1
It is delightful, but (a) custom knob and slider controls carry real accessibility and QA cost; (b) the look is associated with consumer electronics rather than our topic, *heat*; (c) it is less legible for long-form affiliate content. Worth borrowing: the **LCD readout moment**, which A can use in its HUD, and **catalog grids divided by hairlines instead of cards**.

---

## 4. Recommendation: build **A · IRONBOW**, with B's spec-sheet discipline for the Report surface

**Why A wins**
1. **Category-owning distinctiveness.** Thermal imaging *is* the language of heat loss, and no competitor uses it. Every SERP thumbnail, OG card, Pinterest pin and Reddit screenshot of our planner will be recognizably ours.
2. **No photo dependency, by construction.** The imagery is generated from our own model, so it is truthful, unique per user and free.
3. **The planner result is inherently shareable**: "my garage through a thermal camera" plus the numbers. This drives links (the calculator cluster is 880–2,900/mo with weak SERPs) and email capture.
4. **Seasonal inversion is free.** Cooling season (garage AC 12.1k, peaking at 33k in July) flips the same camera to a Frost-dominant palette with sun-load hot spots on the door. The brand needs no redesign for summer.
5. **Technically cheap for how good it looks.** One ~6 KB canvas component, SVG line art and CSS. There is no WebGL, 3D engine or animation library.

**What A takes from B and C**
- From B: the **Report surface** (title blocks, REV/UPDATED stamps, numbered sources, dimensioned diagrams, dotted-leader spec rows, printable plan page) and the **spec-plate product card**.
- From C: **hairline-divided catalog grids instead of cards**, and an LCD-style readout moment in the HUD, set in Martian Mono rather than adding Doto (keep to 2 font families).

**Build order (recommended)**
1. Tokens + fonts + surfaces (`[data-surface="camera"|"report"]`) in `globals.css`, plus the SVG icon sprite and wordmark. About half a day.
2. `ThermalField` (canvas + LUT + diffusion + static PNG fallback + HUD). This single component powers the hero, planner result, hub headers and OG images. About 1.5 days.
3. Garage line-art components (section + isometric, parametric). 1 day.
4. Planner UI with the result reveal, spec plates and share/OG. This is the core product (separate spec).
5. Report-surface guide template, comparison table, spec sheet. 1 day.
6. Motion polish (scroll-driven "where heat goes", ViewTransition morphs), then a reduced-motion and performance pass.

**Performance budget (enforced in CI via Lighthouse CI, mobile, Moto G Power profile)**
| Metric | Budget |
|---|---|
| LCP (mobile, 4G) | **< 2.0 s target**, 2.5 s hard ceiling. The LCP element is H1 text. |
| CLS | < 0.05. All media boxes use `aspect-ratio`; fonts use `adjustFontFallback`. |
| INP | < 200 ms. Planner recompute is under 4 ms; heavy work goes in `useDeferredValue`. |
| Fonts | 2 variable families, latin subset. Budget ≤ 120 KB total; preload only Archivo; Martian Mono `preload: false` if it is not above the fold. |
| JS | Home first-load ≤ 130 KB gz including the framework. Hero thermal module ≤ 6 KB gz, loaded on idle. Planner route ≤ 60 KB gz of its own code. |
| Images | 0 raster above the fold except the ~10 KB thermal poster PNG. SVG inline and optimized with SVGO. |
| Runtime | The canvas pauses off-screen and when hidden. 30 fps on coarse pointers, DPR irrelevant (fixed 160×120 buffer). |
| Motion | Everything is honored under `prefers-reduced-motion: reduce`. Scroll-driven effects sit behind `@supports`, with the final state as the default. |

---

## 5. Anti-slop rules (non-negotiable; reviewers reject PRs that break them)

1. **No indigo, violet or purple gradients, mesh blobs or "aurora" glows.** Nothing in the `#4F46E5`–`#8B5CF6` family. **Any gradient on the site must encode temperature** and must sit next to a labeled scale. Decorative gradients are banned.
2. **No default AI typefaces:** no Inter, Poppins, Montserrat, Space Grotesk, Geist or system-UI "look". The type system is Archivo (with its width axis *actually used*) plus Martian Mono. No more than 2 families per page.
3. **No generic 3-card feature row** (icon + title + two lines, ×3). Show the feature *working* (a live chip, a real number, a diagram) or list it as a numbered spec row. "Bento grids" are banned unless each cell contains live data.
4. **No emoji anywhere** in UI, bullets, headings, buttons or meta titles (✅🔥❄️⚡💡🚀). Use our SVG glyphs or mono text labels. The only allowed Unicode symbols are typographic: `→ ↗ ▲ ■ □ × ± ° ·`.
5. **No centered-everything layouts.** Content is left-aligned on a visible 12-column grid with asymmetric splits. At most one centered text block per page, and preferably none.
6. **No weightless copy.** Every headline contains a number, a garage noun or a decision ("A 2-car garage at 0 °F loses 34,100 BTU an hour. Here's where."), never "Stay warm. Save more." or "Your garage, reimagined." CTAs name the action: "Size my garage", "Check price on Amazon", "See the math". No "Get started" or "Learn more".
7. **No fake trust.** No stock photos, AI-photoreal images, invented testimonials, star ratings, "trusted by 10,000+" counters, fake "As seen on" logos or invented reviewers or credentials. Every number traces to the planner model or a cited source, with a checked-on date.
8. **No soft-SaaS card chrome.** No `rounded-2xl` + `shadow-lg` cards and no glassmorphism or `backdrop-blur` panels. Radii are 0 / 2px / pill only. Elevation is surface steps plus 1px hairlines. One shadow token in the whole system (the result card).
9. **No gradient "Get started" buttons and no rainbow of accents.** One action color per surface (Ember `#FF8A1F` on Camera, `#B8430B` ink / Ember fill on Report). Red `#FF4F3A` is reserved for safety warnings only.
10. **No decorative motion.** Every animation encodes a change in heat, time, load or state. Banned: fade-up-on-every-section, parallax blobs, marquee logo strips, cursor trails, typewriter headlines, scroll-jacking and auto-playing carousels. Everything has a reduced-motion equivalent, and the default state is the final state.

**Also banned (bonus list the review agent should grep for):** `bg-gradient-to-r from-indigo|from-purple|via-violet`, `rounded-2xl shadow`, `backdrop-blur`, `sparkles` / "AI-powered" badges, lorem or round placeholder numbers (e.g. "10x", "99%"), generic FAQ accordions with questions nobody searched (FAQ must map to real PAA/keyword data), hamburger menus on desktop, and dark-mode-by-default for money pages (use the Report surface).

---

## 6. Hand-off checklist for the build team
- [ ] Replace the Source Serif 4 / Source Sans 3 / IBM Plex Mono imports in `app/layout.tsx` with Archivo (`axes: ["wdth"]`) + Martian Mono (`axes: ["wdth"]`).
- [ ] Put the tokens in §A.1 into `app/globals.css` under `@theme inline` plus `[data-surface]` scopes. Remove the old cream `--paper #f3eee4` system.
- [ ] Build `lib/thermal/ramp.ts` (stops → 256-entry `Uint32Array` LUT, OKLab interpolation) and share it between the canvas, SVG legends and `next/og`.
- [ ] Build `components/thermal/ThermalField.tsx` (client): the diffusion grid, HUD, spot meter, chips, IntersectionObserver pause, reduced-motion/save-data static fallback, and `aria-label` summary.
- [ ] Pre-bake poster PNGs per preset (1/2/3-car × as-is/sealed) with a Node script that reuses the same solver, at build time, into `public/thermal/`.
- [ ] Build the SVG sprite (`components/icons/sprite.tsx`) of about 28 glyphs, plus the wordmark and favicon (sensor frame + hot dot).
- [ ] Guide template on the Report surface with the title block, REV/UPDATED stamp, numbered sources and sticky "Your garage" rail.
- [ ] Spec-plate product card, comparison table (sticky column, in-cell Forge micro-bars, mobile scroll-snap) and printable plan (`@media print`).
- [ ] `next/og` thermal share card (1200×630), fonts loaded as ArrayBuffer.
- [ ] Lighthouse CI budgets (§4) and an anti-slop grep in CI (§5 bonus list).

---

## Sources
- Awwwards Sites of the Day (Sep 2026 list): https://www.awwwards.com/websites/sites_of_the_day/
- Awwwards Fauna Robotics SOTD: https://www.awwwards.com/sites/fauna-robotics
- Awwwards product honors category: https://www.awwwards.com/websites/winner_category_product/
- Linear design refresh: https://linear.app/now/behind-the-latest-design-refresh · tokens: https://designmd.cc/benchmarks/linear
- Teenage Engineering breakdowns: https://norrly.io/inspiration/teenage-engineering · https://www.shadcn.io/design/teenage-engineering
- Nothing / Ndot: https://www.shadcn.io/design/nothing
- Rivian design system: https://www.shadcn.io/design/rivian · https://styles.refero.design/style/a5dc5626-1103-42e3-9edb-a6d52fb9a210
- 2026 brutalist/industrial trends: https://fireart.studio/blog/the-best-web-design-trends/ · https://www.setproduct.com/blog/retro-brutalist-ui-design-2026 · https://studio2am.co/blogs/news/raw-by-design-why-brutalist-and-industrial-type-is-taking-over
- FLIR palettes: https://www.flir.com/discover/industrial/picking-a-thermal-color-palette/ · https://www.flir.com/discover/ots/outdoor/your-perfect-palette/ · https://www.thermascan.co.uk/blog/thermal-palettes
- Ironbow LUT values: https://github.com/MickTheMechanic/FLIR-style-thermal-color-palettes (IRONBOW.c)
- ANSI Z535 safety orange: https://en.wikipedia.org/wiki/Safety_orange · https://www.safetysign.com/what-are-ansi-color-codes
- Scroll-driven animations support: https://caniuse.com/mdn-css_properties_animation-timeline_scroll · https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations · https://cssawwwards.com/blog/css-scroll-driven-animations-guide-2026
- View Transitions: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API · https://css-tricks.com/cross-document-view-transitions-part-1/ · local: `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`
- Paper Shaders (Heatmap): https://shaders.paper.design/heatmap · https://github.com/paper-design/shaders
- AI-slop tells: https://www.925studios.co/blog/ai-slop-design-tells · https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website · https://github.com/Ferousco-dev/anti-slop-design
- Heat-loss visualization precedents: https://myheat.ca/ · https://www.firgelliauto.com/blogs/engineering-calculators/heat-loss-through-wall-calculator-r-value-u-value · https://openenergymonitor.org/heatlossjs/
- Calculator UI patterns: https://www.saasframe.io/patterns/calculator
- Local: `company/research/competitors.md` §3.3 (niche palettes, no thermal language), §4.1 (planner flow)
- Font availability: `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` (Archivo wdth 62–125; Martian Mono wdth 75–112.5; Big Shoulders Stencil opsz 10–72; IBM Plex Sans wdth 75–100; Google Sans Flex wdth 25–151/ROND/opsz/GRAD; Doto ROND 0–100)
