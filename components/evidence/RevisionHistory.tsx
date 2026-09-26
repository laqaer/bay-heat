export type Revision = { date: string; note: string };

export function RevisionHistory({ revisions }: { revisions: Revision[] }) {
  if (revisions.length === 0) return null;
  return (
    <section className="mt-6 border-t border-(--color-line) pt-4">
      <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-(--color-fg-2)">Revision history</h2>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-(--color-fg-2)">
        {revisions.map((r) => (
          <li key={r.date}>
            {r.date} — {r.note}
          </li>
        ))}
      </ul>
    </section>
  );
}
