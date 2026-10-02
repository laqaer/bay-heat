import Link from "next/link";
import { SpotMark } from "./SpotMark";
import { BRAND, DESCRIPTOR } from "@/lib/site";

export function Wordmark({ withDescriptor = true }: { withDescriptor?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <SpotMark className="h-6 w-6 text-(--color-fg) transition-colors group-hover:text-(--color-ember)" />
      <span className="flex items-baseline gap-2 leading-none">
        <span className="wdth-125 text-[20px] font-extrabold tracking-tight text-(--color-fg)">{BRAND.toUpperCase()}</span>
        {withDescriptor ? (
          <span className="hidden font-mono text-[10px] tracking-[0.12em] text-(--color-fg-2) sm:inline">
            {DESCRIPTOR.toUpperCase()}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
