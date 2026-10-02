// Minimal classnames joiner -- avoids adding the `clsx` runtime dependency (BLUEPRINT.md §9.2: "No new
// runtime dependencies").
export type ClassValue = string | number | null | undefined | false | ClassValue[];

export function clsx(...args: ClassValue[]): string {
  const out: string[] = [];
  for (const a of args) {
    if (!a) continue;
    if (Array.isArray(a)) {
      const nested = clsx(...a);
      if (nested) out.push(nested);
    } else {
      out.push(String(a));
    }
  }
  return out.join(" ");
}
