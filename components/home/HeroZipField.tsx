"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { resolveZip3 } from "@/lib/planner/zip3";
import { ButtonLink } from "@/components/ui/ButtonLink";

// The hero's ZIP field (BLUEPRINT.md §4.9 #1): a live re-light as you type, then a plain navigation to the
// wizard with the ZIP pre-applied -- no client-side plan() call here, the wizard's own step 1 owns that.
export function HeroZipField() {
  const [digits, setDigits] = useState("");
  const router = useRouter();
  const resolution = useMemo(() => (digits.length === 3 ? resolveZip3(digits) : null), [digits]);

  function go() {
    router.push(digits.length === 3 ? `/garage-heater-calculator?zip=${digits}` : "/garage-heater-calculator");
  }

  return (
    <div className="mt-6">
      <div className="flex max-w-md gap-2">
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          placeholder="ZIP code"
          value={digits}
          onChange={(e) => setDigits(e.target.value.replace(/\D/g, "").slice(0, 5))}
          onKeyDown={(e) => e.key === "Enter" && go()}
          aria-label="ZIP code"
          className="h-14 w-32 border border-(--color-fg)/25 bg-(--color-surface) px-3 font-mono text-lg tracking-wider text-(--color-fg) placeholder:text-(--color-fg-2) focus:border-(--color-ember) focus:outline-none"
        />
        <ButtonLink href={digits.length === 3 ? `/garage-heater-calculator?zip=${digits}` : "/garage-heater-calculator"} className="flex-1">
          Size my garage — 60 s
        </ButtonLink>
      </div>
      <p className="mt-2 h-5 font-mono text-xs text-(--color-fg-2)">
        {digits.length >= 3 && digits.length < 5
          ? resolution
            ? `${resolution.station.city}, ${resolution.state} · zone ${resolution.station.zone} · design low ${resolution.station.h99}°F`
            : "That ZIP prefix isn't in our table yet — you can pick a state on the next step."
          : "No sign-up. No email. Just your ZIP."}
      </p>
    </div>
  );
}
