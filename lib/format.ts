// Display formatting. Rounding rules per BLUEPRINT.md §5.1: BTU/h to the nearest 100, kW to 0.1, dollars
// whole or cents under $10. Units are always paired in prose ("31,700 BTU/h (9.3 kW)"), never bare.

export function btuh(n: number): string {
  return `${Math.round(n / 100) * 100}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function kw(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1);
}

export function usd(n: number): string {
  if (n < 10) return `$${n.toFixed(2)}`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function cents(n: number): string {
  return `${Math.round(n * 100)}¢`;
}

export function pct(n: number): string {
  return `${Math.round(n)}%`;
}

export function degF(n: number): string {
  return `${Math.round(n * 10) / 10}°F`;
}

export function amps(n: number): string {
  return `${Math.round(n * 10) / 10} A`;
}

export function awg(gauge: string): string {
  return gauge; // already formatted, e.g. '10 AWG' -- passthrough kept for a single call-site convention
}

export function commas(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}
