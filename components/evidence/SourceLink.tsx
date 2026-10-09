import { getSource } from "@/lib/facts";

// An inline link from a safety line to the document it quotes, so the line can be checked wherever it renders --
// including client-only views (the calculator report, Can I Run It?) that have no Sources list of their own.
// Generic product classes cite no single model's manual, so they get no link (scripts/source-audit.mjs).
export function SourceLink({ sourceId }: { sourceId?: string }) {
  const source = sourceId ? getSource(sourceId) : null;
  if (!source) return null;
  return (
    <>
      {" "}
      <a href={source.url} title={source.title} className="whitespace-nowrap underline underline-offset-2" data-source-link={source.id}>
        Source ↗
      </a>
    </>
  );
}
