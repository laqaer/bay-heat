import { card, OG_SIZE } from "@/lib/og/card";
import { BRAND, DESCRIPTOR } from "@/lib/site";

export const alt = `${BRAND}: ${DESCRIPTOR}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return card({
    variant: "page",
    eyebrow: DESCRIPTOR,
    title: "One garage. Seven answers.",
    readout: "10,200 → 40,300 BTU/h",
    sub: "Every number shows its work.",
  });
}
