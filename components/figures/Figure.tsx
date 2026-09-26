import type { FigureProps } from "@/components/contracts";

export function Figure({ n, caption, source, children }: FigureProps) {
  return (
    <figure className="not-prose my-8">
      <div className="border border-(--color-line)">{children}</div>
      <figcaption className="mt-2 text-xs leading-5 text-(--color-fg-2)">
        <span className="font-mono uppercase tracking-[0.08em]">FIG. {n}</span> {caption}
        {source ? <span> — {source}</span> : null}
      </figcaption>
    </figure>
  );
}
