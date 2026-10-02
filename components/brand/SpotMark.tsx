// The Spot Mark: sensor corner brackets with the hot dot off-centre, lower right -- like a spot meter
// landing on the leaking door corner. BLUEPRINT.md §4.6. `--dot` can be overridden per grade in the planner
// result (Glow -> Frost as the grade goes A -> F).
export function SpotMark({ className, dotColor }: { className?: string; dotColor?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
      style={dotColor ? ({ "--dot": dotColor } as React.CSSProperties) : undefined}
    >
      <path
        d="M3 11V3h8M21 3h8v8M29 21v8h-8M11 29H3v-8"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="square"
      />
      <circle cx={20.5} cy={20.5} r={4.25} fill="var(--dot, #FF8A1F)" />
    </svg>
  );
}
