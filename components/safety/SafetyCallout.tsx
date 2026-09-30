import { Callout } from "@/components/ui/Callout";
import { SAFETY_SCOPE } from "@/lib/site";

// STUB(W0) -- owned by W6 (safety and lab). Final signature: takes optional children for a page-specific
// point-of-risk message; falls back to the site-wide safety-scope line.
export function SafetyCallout({ children }: { children?: React.ReactNode }) {
  return <Callout variant="safety">{children ?? SAFETY_SCOPE}</Callout>;
}
