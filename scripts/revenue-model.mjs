#!/usr/bin/env node
/**
 * Affiliate revenue arithmetic, so the argument about "how do we make money" is a calculation, not a feeling.
 *
 *   node scripts/revenue-model.mjs                       # the tables in company/REVENUE-ANALYSIS.md
 *   node scripts/revenue-model.mjs --sessions 4800 --ctr 0.06 --epc 0.25
 *
 * The identity it rests on:
 *
 *   monthly revenue = sessions x CTR x EPC
 *   EPC             = P(order | click) x order value x commission rate x (1 + cart halo)
 *
 * NOTHING here is measured. No page on this site has a recorded click yet (analytics is off, Search Console and
 * GA4 are not connected). Every CTR and conversion figure is an assumption to be replaced by the per-tracking-ID
 * Associates report and the affiliate_click events (lib/track.ts). The point of the tables is the shape: which
 * factor limits revenue, and how many sessions a target needs under each assumption.
 */

/** Earnings per click. `halo` is the extra commission from other items the buyer adds within the 24 h cookie. */
export function epc({ orderRate, orderValue, commission, halo = 0 }) {
  return orderRate * orderValue * commission * (1 + halo);
}

export function monthlyRevenue({ sessions, ctr, epc: perClick }) {
  return sessions * ctr * perClick;
}

/** Sessions per month needed to earn `target` a month. */
export function sessionsNeeded({ target, ctr, epc: perClick }) {
  return target / (ctr * perClick);
}

/** BLUEPRINT.md §6.5 base-case session ramp, Oct-2026 to Sep-2027 (sums to 49,500). */
export const BLUEPRINT_SESSIONS = [900, 2200, 3800, 4800, 4200, 3400, 3200, 4000, 5200, 6200, 5600, 6000];

/** Modeled EPC per product class (company/research/monetization.md §2.7, midpoints of the stated ranges). */
export const CLASS_EPC = [
  { cls: "DIY mini-split", lo: 0.4, hi: 0.9, route: "HVACDirect 5%/30d" },
  { cls: "Gas / propane unit heater", lo: 0.4, hi: 0.8, route: "Northern Tool 3%/30d" },
  { cls: "Dehumidifier / portable AC", lo: 0.3, hi: 0.9, route: "Sylvane 6%/30d or Amazon" },
  { cls: "Electric 240 V heater", lo: 0.25, hi: 0.4, route: "Amazon 3%/24h" },
  { cls: "Diesel air heater", lo: 0.2, hi: 0.35, route: "VEVOR 2-10%/30d" },
  { cls: "Garage door insulation kit", lo: 0.15, hi: 0.25, route: "Amazon 3%/24h" },
  { cls: "Bottom seal / weatherstrip", lo: 0.05, hi: 0.12, route: "Amazon 3%/24h" },
];

const money = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n) => `${(n * 100).toFixed(n < 0.1 ? 1 : 0)}%`;

function grid(title, rows, cols, cell, rowLabel, colLabel) {
  process.stdout.write(`\n${title}\n`);
  process.stdout.write(`${rowLabel.padEnd(14)}${cols.map((c) => colLabel(c).padStart(10)).join("")}\n`);
  for (const r of rows) process.stdout.write(`${String(rowLabel === "CTR \\ EPC" ? pct(r) : r).padEnd(14)}${cols.map((c) => cell(r, c).padStart(10)).join("")}\n`);
}

function main() {
  const a = process.argv.slice(2);
  const arg = (k) => {
    const i = a.indexOf(`--${k}`);
    return i === -1 ? null : Number(a[i + 1]);
  };
  if (arg("sessions") && arg("ctr") && arg("epc")) {
    const r = monthlyRevenue({ sessions: arg("sessions"), ctr: arg("ctr"), epc: arg("epc") });
    process.stdout.write(`${money(r)}/mo  (${arg("sessions")} sessions x ${pct(arg("ctr"))} CTR x $${arg("epc")} EPC)\n`);
    return;
  }
  const CTRS = [0.03, 0.06, 0.1, 0.17];
  const EPCS = [0.1, 0.15, 0.25, 0.4, 0.6];
  grid("Sessions per month needed for $300/mo of affiliate revenue", CTRS, EPCS, (c, e) => Math.round(sessionsNeeded({ target: 300, ctr: c, epc: e })).toLocaleString("en-US"), "CTR \\ EPC", (e) => `$${e.toFixed(2)}`);
  const total = BLUEPRINT_SESSIONS.reduce((s, x) => s + x, 0);
  grid(`12-month affiliate revenue on the blueprint base-case traffic (${total.toLocaleString("en-US")} sessions)`, CTRS, EPCS, (c, e) => money(total * c * e), "CTR \\ EPC", (e) => `$${e.toFixed(2)}`);
  const peak = Math.max(...BLUEPRINT_SESSIONS);
  grid(`Peak month (${peak.toLocaleString("en-US")} sessions) revenue`, CTRS, EPCS, (c, e) => money(peak * c * e), "CTR \\ EPC", (e) => `$${e.toFixed(2)}`);
  process.stdout.write("\nRevenue per 1,000 sessions\n");
  for (const c of CTRS) process.stdout.write(`  CTR ${pct(c).padEnd(4)} ${EPCS.map((e) => `$${e.toFixed(2)}: ${money(1000 * c * e).padStart(4)}`).join("   ")}\n`);
  process.stdout.write("\nModeled EPC by class (monetization.md §2.7)\n");
  for (const r of CLASS_EPC) process.stdout.write(`  ${r.cls.padEnd(30)} $${r.lo.toFixed(2)}-$${r.hi.toFixed(2)}  ${r.route}\n`);
  const sample = epc({ orderRate: 0.08, orderValue: 250, commission: 0.03, halo: 0.1 });
  process.stdout.write(`\nWorked EPC: 8% of clicks order x $250 heater x 3% x 1.1 cart halo = $${sample.toFixed(2)} per click\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
