---
name: BayHeat
description: Every number shows its work.
colors:
  sodium-paper: "#f4e0b8"
  lamp-cream: "#fff6e4"
  dust-board: "#edd3a0"
  brass-line: "#c9a56a"
  ink: "#1a1008"
  walnut: "#4a2f18"
  ember: "#e8890c"
  ember-hot: "#ffb020"
  night-bay: "#1a1008"
  night-panel: "#2a1a0e"
  night-text: "#fff6e4"
  night-sub: "#f0d7a4"
  alarm: "#9d1c1c"
  alarm-night: "#ff5a45"
  go: "#1f6b3a"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 800
    lineHeight: 0.98
    fontVariation: "wdth 118"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 700
    lineHeight: 1.1
    fontVariation: "wdth 112"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: 12px
    letterSpacing: 0.16em
rounded: {}
spacing:
  page: 16px
  section: 64px
  container: 1392px
components:
  button-primary:
    backgroundColor: "{colors.ember}"
    textColor: "{colors.ink}"
    rounded: 0px
    padding: 16px
    height: 40px
  button-primary-hover:
    backgroundColor: "#c86e00"
    textColor: "{colors.ink}"
---

# Design System: BayHeat

## Overview

**Creative North Star: "A sodium-lit garage at dusk"**

One amber frequency, two exposures. Long reads sit on lamp-lit paper. The home page, the planner, and the hubs sit in the bay at night, with the same sodium light coming from one source. Temperature ramps stay a separate cold-to-hot encoding. Safety stays red.

The system is editorial and warm. Type is Archivo with a width axis and Martian Mono for labels. No new display face. The first paint is the headline. Motion drifts the hero heat with opacity, scale, and a softer core. The hero section lines draw once. A home section or an article heading rises a short distance as it enters. A product plate warms its border on hover. The footer drawings change opacity slowly. Reduced motion snaps each of these to the resting frame. None of them changes layout size.

The previous Inspection Grade world (cool paper, blue thermal camera) is the anti-reference. This file records the replacement that shipped in the visual overhaul. Assumptions, because the run had no question tool. The north star is the assigned concept-seed direction. The names of the colors are descriptive labels for the hex values already in `app/globals.css`.

**Key Characteristics:**

- One ember accent. It marks the action, the focus ring, and the hot stroke in a drawing.
- Paper for articles. Night for the camera surface and the footer.
- Square corners. Depth comes from a tone change and a hairline, not a lifted card.
- Original line drawings of a garage, a heater, radiant arcs, and a wiring run. Cream stroke, ember only on the hot mark.
- Numbers stay tabular. Decoration never covers a figure.

## Colors

Sodium light on two surfaces. Paper is the long read. Night is the bay.

### Primary

- **Ember** (#e8890c): The paper-surface action color. Header rule, focus ring, primary button, selection.
- **Ember hot** (#ffb020): The same hue on the night surface, where the paper ember would be too dim. Also the one hot stroke in the drawings.

### Secondary

- **Alarm** (#9d1c1c on paper, #ff5a45 on night): Safety and NO-GO only. Ink on the fill flips so both pairs clear 4.5:1. Do not use alarm as a marketing accent.
- **Go** (#1f6b3a): A passing verdict. It is not a second brand color.

### Neutral

- **Sodium paper** (#f4e0b8): Article and report background.
- **Lamp cream** (#fff6e4): Header, cards, and the night headline.
- **Dust board** (#edd3a0): Callout fill and zebra mix.
- **Brass line** (#c9a56a): Hairlines on paper.
- **Ink** (#1a1008): Paper text and night background.
- **Walnut** (#4a2f18): Secondary paper text.
- **Night bay** (#1a1008): Camera surface and footer.
- **Night panel** (#2a1a0e): Cards on the camera surface.
- **Night text** (#fff6e4) and **Night sub** (#f0d7a4): Copy on the bay.

### Named Rules

**The One Frequency Rule.** Ember is the only decorative hue. Forge and frost ramps encode temperature data. They are not chrome.

**The Two Exposure Rule.** `[data-surface="camera"]` redeclares the color aliases. A descendant that sets `--bg` alone does not recolor Tailwind `--color-*` utilities.

## Typography

**Display Font:** Archivo (with ui-sans-serif)
**Body Font:** Archivo (with ui-sans-serif)
**Label/Mono Font:** Martian Mono (with ui-monospace)

**Character:** A compressed editorial grotesque for the headline, the same family at a normal width for body, and a mono for section indices and sources. Width is the `wdth` axis via `wdth-*` utilities. The name `w-*` is Tailwind's width scale.

### Hierarchy

- **Display** (800, about 2.25rem to 3.75rem, line-height 0.98, wdth 118): Home `h1` only.
- **Headline** (700, clamp about 1.5rem to 2.25rem, line-height 1.1, wdth 112): Section `h2` and article `h1`.
- **Title** (650 to 700, 1.25rem): `h3` and card titles.
- **Body** (400, line-height 1.6, max 66ch): Report prose.
- **Label** (mono, 12px, tracking 0.16em, uppercase): Section indices and footer column titles.

### Named Rules

**The Width Axis Rule.** Set `font-variation-settings: "wdth"`. Do not add a class named `w-75` or similar for that axis.

## Layout

The page column is `max-w-[1392px]` with 16px padding, 24px from the `sm` breakpoint. Home sections stack full width with a top border. Report articles use the same column, then a 3xl prose measure. The sticky header is 56px, 64px from `sm`. The footer reserves about 640px of intrinsic size so `content-visibility: auto` does not shift layout when it paints.

## Elevation & Depth

Flat by default. A surface changes tone. A hairline separates it. The product pick is the one lifted surface, and the shadow is a short dark falloff that does not change the box height.

### Shadow Vocabulary

- **Pick** (`box-shadow: 0 22px 40px -30px rgb(26 16 8 / 0.55)`): `[data-buy-group]` only.
- **Result** (`0 0 0 1px var(--line), 0 24px 48px -28px rgb(26 16 8 / 0.35)`): Token `--shadow-result`. Use it on a result plate, not on every card.

### Named Rules

**The No Shift Rule.** Hover and focus change color and outline. They do not change height, margin, or border width around a paid link.

## Shapes

Corners are square. Borders are 1px. The header rule is 2px ember. Drawings are one stroke weight (1.6), cream on night, ember only on the hot object. Four drawings sit in a 92px footer band. Below 720px the band keeps the garage and the heater.

## Components

### Buttons

- **Shape:** Square (0 radius). Height 40px in the header, 48px for a page CTA.
- **Primary:** Ember fill, ink text, 16px horizontal padding.
- **Hover / Focus:** Ember hover `#c86e00` on paper and `#ffc14d` on night. Focus is a 2px ember outline, 2px offset.
- **Secondary:** Night or paper outline, no fill, ember border on hover.

### Cards / Containers

- **Corner Style:** Square.
- **Background:** Lamp cream on paper, night panel on the camera surface.
- **Shadow Strategy:** None, except the product pick.
- **Border:** 1px brass line, or night line `#6b4a28` on the bay.
- **Internal Padding:** 16px to 20px.

### Callouts

A full 1px plate. Paper callouts use dust board. Alarm callouts use the alarm border and a 12% alarm wash. They are not a thick left bar.

### Tables

1px line, ember-mix header, zebra rows from the dust board. Horizontal scroll on small screens. The table box does not grow on hover.

### Inputs / Fields

Stroke is the brass line. Focus is the ember outline. The caret is ember.

### Navigation

Sticky paper header, 2px ember rule, uppercase labels with 0.04em tracking. The wordmark is Archivo extra bold. Desktop links sit in `Primary`. Below `lg` they collapse into the menu button. The footer is night, with cream links and the drawing band above the columns.

### Drawings

`public/drawings/garage.svg`, `heater.svg`, `radiant.svg`, `wiring.svg`. They are CSS backgrounds on `footer::before`, so they do not inherit page CSS and they do not sit in the LCP viewport.

## Do's and Don'ts

### Do:

- **Do** keep the LCP element as the headline or a static image already on the page.
- **Do** honor `prefers-reduced-motion` by leaving the heat glow and the reveal inside the no-preference block.
- **Do** keep affiliate hrefs, including `tag=laqaer-20`, and the disclosure next to the first paid link.
- **Do** use tabular numbers for measurements.

### Don't:

- **Don't** add a second display typeface or a viewport image behind the home `h1`. A CSS background SVG in that viewport added about 165ms of simulated mobile LCP.
- **Don't** animate the height of a product pick or a table.
- **Don't** invent a statistic, a testimonial, or a lab result in a drawing caption.
- **Don't** restyle the alarm color into a brand accent.
