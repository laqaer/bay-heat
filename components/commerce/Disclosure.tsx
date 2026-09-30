import { DISCLOSURE_INLINE } from "@/lib/site";

// Renders immediately above the first paid link on every commercial page (BLUEPRINT.md §5.3).
export function Disclosure() {
  return <p className="not-prose my-4 text-xs leading-5 text-(--color-fg-2)">{DISCLOSURE_INLINE}</p>;
}
