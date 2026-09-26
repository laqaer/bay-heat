import type { ReactNode } from "react";
import { getFact } from "@/lib/facts";

// Wraps a whole sentence or row that depends on one or more facts still marked status:'verify'. Removes the
// entire block in production rather than rendering a gapped sentence ("needs a  breaker") -- feasibility
// red-team finding #22. In dev, renders its children anyway so the [VERIFY:id] markers inside <Num> are visible.
export function IfVerified({ ids, children }: { ids: string[]; children: ReactNode }) {
  if (process.env.NODE_ENV !== "production") return <>{children}</>;
  const allVerified = ids.every((id) => getFact(id) !== null);
  if (!allVerified) return null;
  return <>{children}</>;
}
