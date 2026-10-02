import { getFact, getSource } from "@/lib/facts";
import type { Ev } from "@/lib/types/evidence";
import { EvidencePopover } from "./EvidencePopover";

type NumProps =
  | { f: string; chip?: boolean; format?: (v: number | string) => string }
  | { v: number | string; unit?: string; ev: Ev; src: string; round?: number; chip?: boolean; format?: (v: number | string) => string };

function formatValue(v: number | string, unit: string | undefined, round: number | undefined, format?: (v: number | string) => string): string {
  if (format) return format(v);
  if (typeof v === "number") {
    const rounded = round ? Math.round(v / round) * round : v;
    const text = rounded.toLocaleString("en-US");
    return unit ? `${text} ${unit}` : text;
  }
  return unit ? `${v} ${unit}` : v;
}

// <Num> renders a decision-driving number with its evidence chip (BLUEPRINT.md §4.5). It is a server
// component -- no client JS -- and the popover is a native <details> disclosure. Pass either a fact id
// (`f="cz220.watts.high"`) or a computed value with its own evidence (`v`, `unit`, `ev`, `src`).
export function Num(props: NumProps) {
  if ("f" in props) {
    const fact = getFact(props.f);
    if (!fact) {
      if (process.env.NODE_ENV !== "production") {
        return <span className="bg-(--color-alarm)/20 px-1 font-mono text-xs text-(--color-alarm)">[VERIFY:{props.f}]</span>;
      }
      return null;
    }
    const source = getSource(fact.sourceId);
    const text = formatValue(fact.value, fact.unit, undefined, props.format);
    return (
      <EvidencePopover ev={fact.ev} source={source} checked={fact.checked} factId={fact.id} chip={props.chip}>
        {text}
      </EvidencePopover>
    );
  }
  const text = formatValue(props.v, props.unit, props.round, props.format);
  return (
    <EvidencePopover ev={props.ev} computedFrom={props.src} chip={props.chip}>
      {text}
    </EvidencePopover>
  );
}
