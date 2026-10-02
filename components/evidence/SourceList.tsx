import type { Source } from "@/lib/types/evidence";

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <section className="mt-12 border-t border-(--color-line) pt-6">
      <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-(--color-fg-2)">Sources</h2>
      <ol className="mt-3 space-y-1 text-xs leading-5 text-(--color-fg-2)">
        {sources.map((s, i) => (
          <li key={s.id} id={`source-${i + 1}`}>
            [{i + 1}]{" "}
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-(--color-link) underline">
              {s.title}
            </a>
            , {s.publisher}. Retrieved {s.retrieved}.
          </li>
        ))}
      </ol>
    </section>
  );
}
