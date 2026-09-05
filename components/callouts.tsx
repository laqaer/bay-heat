import { affiliateDisclosure, electricalDisclaimer } from "@/lib/site";

type Tone = "safety" | "note" | "affiliate";

const tones: Record<Tone, string> = {
  safety:
    "border-[var(--rust)]/40 bg-[var(--rust-soft)] text-[var(--ink)]",
  note: "border-[var(--line)] bg-[var(--card)] text-[var(--ink)]",
  affiliate: "border-[var(--line)] bg-[var(--paper-2)] text-[var(--ink)]",
};

export function Callout({
  title,
  children,
  tone = "note",
}: {
  title: string;
  children: React.ReactNode;
  tone?: Tone;
}) {
  return (
    <aside className={`not-prose my-6 rounded-lg border px-4 py-3.5 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {title}
      </p>
      <div className="mt-2 text-sm leading-6 text-[var(--ink)]">{children}</div>
    </aside>
  );
}

export function SafetyCallout() {
  return (
    <Callout title="Electrical and fire safety" tone="safety">
      <p>{electricalDisclaimer}</p>
    </Callout>
  );
}

export function AffiliateCallout() {
  return (
    <Callout title="Affiliate disclosure" tone="affiliate">
      <p>{affiliateDisclosure}</p>
    </Callout>
  );
}
