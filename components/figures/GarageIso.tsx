import type { GarageIsoProps } from "@/components/contracts";

// STUB(W0) -- owned by W3. Parametric isometric SVG: x' = (x-y)cos30deg, y' = (x+y)sin30deg - z.
const COS30 = Math.cos(Math.PI / 6);
const SIN30 = Math.sin(Math.PI / 6);

function project(x: number, y: number, z: number, scale: number, ox: number, oy: number): [number, number] {
  return [ox + (x - y) * COS30 * scale, oy + (x + y) * SIN30 * scale - z * scale];
}

export function GarageIso({ bays, ceilingFt }: GarageIsoProps) {
  const w = bays === 1 ? 12 : bays === 2 ? 24 : bays === 3 ? 32 : 40;
  const d = 24;
  const h = ceilingFt;
  const scale = 4;
  const ox = 160;
  const oy = 140;
  const corners = {
    a: project(0, 0, 0, scale, ox, oy),
    b: project(w, 0, 0, scale, ox, oy),
    c: project(w, d, 0, scale, ox, oy),
    d: project(0, d, 0, scale, ox, oy),
    a2: project(0, 0, h, scale, ox, oy),
    b2: project(w, 0, h, scale, ox, oy),
    c2: project(w, d, h, scale, ox, oy),
    d2: project(0, d, h, scale, ox, oy),
  };
  const poly = (pts: [number, number][]) => pts.map((p) => p.join(",")).join(" ");
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full">
      <polygon points={poly([corners.a, corners.b, corners.b2, corners.a2])} fill="none" stroke="currentColor" strokeWidth={1} />
      <polygon points={poly([corners.b, corners.c, corners.c2, corners.b2])} fill="none" stroke="currentColor" strokeWidth={1} />
      <polygon points={poly([corners.a, corners.b, corners.c, corners.d])} fill="none" stroke="currentColor" strokeWidth={0.75} opacity={0.5} />
      <polygon points={poly([corners.a2, corners.b2, corners.c2, corners.d2])} fill="none" stroke="currentColor" strokeWidth={1} />
    </svg>
  );
}
