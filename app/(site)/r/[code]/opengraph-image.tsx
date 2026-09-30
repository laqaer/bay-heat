import { card, OG_SIZE } from "@/lib/og/card";

export const alt = "BayHeat Garage Heat Report";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: PageProps<"/r/[code]">) {
  const { code } = await params;
  return card({ variant: "report", eyebrow: "Garage Heat Report", title: code, sub: "Plan your own garage at bayheatguide.com" });
}
