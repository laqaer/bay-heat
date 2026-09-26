import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#08090C", position: "relative" }}>
        <svg viewBox="0 0 32 32" style={{ position: "absolute", top: 42, left: 42, width: 96, height: 96 }}>
          <path d="M3 11V3h8M21 3h8v8M29 21v8h-8M11 29H3v-8" stroke="#F3EFE6" strokeWidth={2.5} strokeLinecap="square" fill="none" />
          <circle cx={20.5} cy={20.5} r={4.25} fill="#FF8A1F" />
        </svg>
      </div>
    ),
    size,
  );
}
