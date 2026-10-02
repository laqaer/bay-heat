// Frozen component prop contracts (feasibility red-team finding #23: only data types were frozen in the
// original blueprint, leaving ~40 component signatures to be invented ad hoc across lanes). Lanes import
// these types; the components themselves live in the owning lane's files.
import type { ReactNode } from "react";
import type { RankedSystem, Grade } from "@/lib/planner/types";
import type { Product, Surface } from "@/lib/commerce/types";
import type { PageEntry } from "@/lib/pages/types";
import type { Source } from "@/lib/types/evidence";

export type SpecPlateProps = { system: RankedSystem; product: Product; surface: Surface; position: 1 | 2 | 3 };
export type VerdictRailProps = { systems: RankedSystem[]; products: Record<string, Product>; surface: Surface };
export type ThermalExhibitProps = {
  posterKey: string; // key into lib/og/posters.generated.ts / public/thermal/*.png
  hud: { out: number; in: number; dims: string };
  caption: string;
  fig: number;
  grade?: Grade; // drives the Spot Mark dot color when shown standalone
};
export type GarageIsoProps = { bays: 1 | 2 | 3 | 4; attached: boolean; ceilingFt: number; doorType: string };
export type FigureProps = { n: number; caption: string; source?: string; children: ReactNode };
export type ReportPageProps = { entry: PageEntry; sources: Source[]; children: ReactNode; surface?: "report" | "camera" };
export type EmailCaptureProps = { source: string; tags: string[]; kitEnabled: boolean; copy?: string };
export type InstrumentProps = { preset?: "1car" | "2car" | "3car"; state?: string };
export type OgCardArgs = {
  variant: "page" | "report" | "verdict";
  eyebrow: string;
  title: string;
  readout?: string;
  sub?: string;
  posterKey?: string;
};
