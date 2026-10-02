import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { OgCardArgs } from "@/components/contracts";

// Shared 1200x630 OG image template (BLUEPRINT.md §4.7). Fonts are static TTF instances (Satori/Resvg do not
// support variable fonts or woff2 -- see company/research/nextjs16-cheatsheet.md §6), read once at module
// scope and committed under assets/fonts/ so builds don't depend on the network.
const displayFont = readFile(join(process.cwd(), "assets/fonts/Archivo-ExpandedExtraBold.ttf"));
const bodyFont = readFile(join(process.cwd(), "assets/fonts/Archivo-Medium.ttf"));
const monoFont = readFile(join(process.cwd(), "assets/fonts/MartianMono-Medium.ttf"));

export const OG_SIZE = { width: 1200, height: 630 };

export async function card(args: OgCardArgs) {
  const [display, body, mono] = await Promise.all([displayFont, bodyFont, monoFont]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#08090C",
          color: "#F3EFE6",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontFamily: "Martian Mono", fontSize: 22, color: "#A3A7B0", letterSpacing: 1 }}>
            {args.eyebrow.toUpperCase()}
          </div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 60, fontWeight: 800, lineHeight: 1.05, maxWidth: 1000 }}>
            {args.title}
          </div>
          {args.readout ? (
            <div style={{ display: "flex", marginTop: 28, fontFamily: "Martian Mono", fontSize: 38, color: "#FFB547" }}>
              {args.readout}
            </div>
          ) : null}
          {args.sub ? (
            <div style={{ display: "flex", marginTop: 12, fontFamily: "Martian Mono", fontSize: 24, color: "#F3EFE6" }}>
              {args.sub}
            </div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", width: 28, height: 28, border: "2.5px solid #F3EFE6" }} />
            <div style={{ display: "flex", fontFamily: "Martian Mono", fontSize: 20, color: "#F3EFE6" }}>bayheatguide.com</div>
          </div>
          <div
            style={{
              display: "flex",
              width: 320,
              height: 10,
              background: "linear-gradient(90deg,#3A0D0B,#8E1B0E,#D9480F,#F77F00,#FCBF49,#FFF1C9)",
            }}
          />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Archivo", data: display, weight: 800, style: "normal" },
        { name: "Archivo", data: body, weight: 500, style: "normal" },
        { name: "Martian Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
