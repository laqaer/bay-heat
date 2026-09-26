import { usd } from "@/lib/format";

// The only component allowed to print a "$" inside a commerce subtree (BLUEPRINT.md §4.5) -- never an Amazon
// list price (Operating Agreement §5.5), always our own computed run-cost or price CLASS.
export function Cost({ amount, per }: { amount: number; per?: string }) {
  return (
    <span className="font-mono tabular-nums">
      {usd(amount)}
      {per ? `/${per}` : ""}
    </span>
  );
}
