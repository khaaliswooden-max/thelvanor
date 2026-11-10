import { ImageResponse } from "next/og";

export const alt = "Thelvanor. A data center the size of a keg.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          color: "#111214",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72 }}>
          <div style={{ fontSize: 26, color: "#5c6168" }}>Thelvanor, PBC</div>
          <div style={{ fontSize: 84, lineHeight: 0.98, letterSpacing: -3, fontWeight: 500 }}>
            A data center the size of a keg.
          </div>
          <div style={{ fontSize: 24, color: "#5c6168" }}>Three nodes. One panel. Under $1,000. Measured, then published.</div>
        </div>
        <div style={{ width: 380, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #e4e5e8" }}>
          <svg width="220" height="420" viewBox="0 0 24 44" fill="none" stroke="#E8650A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="36" rx="3" />
            <path d="M7.5 5V2.5h9V5" />
            <path d="M4 16h16M4 30h16" strokeOpacity="0.5" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
