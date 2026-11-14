import { ImageResponse } from "next/og";
import { GLYPHS, WORDMARK_WIDTH } from "@/components/Wordmark";

export const alt = "Thelvanor. A data center the size of a keg.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const DARK = "#1a1c20";
const GRID = "#25282d";
const INK = "#f2f2f0";
const MUTED = "#a9adb4";
const KEG = "#e8650a";

export default function OG() {
  const cols = Array.from({ length: 41 }, (_, i) => i * 30);
  const rows = Array.from({ length: 22 }, (_, i) => i * 30);
  const markW = 880;
  const markH = (markW * 100) / WORDMARK_WIDTH;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: DARK,
          color: INK,
          display: "flex",
          position: "relative",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", top: 0, left: 0 }}>
          {cols.map((x) => (
            <line key={`c${x}`} x1={x} x2={x} y1={0} y2={630} stroke={GRID} strokeWidth={1} />
          ))}
          {rows.map((y) => (
            <line key={`r${y}`} x1={0} x2={1200} y1={y} y2={y} stroke={GRID} strokeWidth={1} />
          ))}
        </svg>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "64px 80px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 4, color: MUTED }}>
            <span>THELVANOR, PBC</span>
            <span>KEG-1</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            <svg width={markW} height={markH} viewBox={`0 0 ${WORDMARK_WIDTH} 100`}>
              {GLYPHS.map((g) => (
                <path
                  key={g.ch}
                  transform={`translate(${g.x},0)`}
                  d={g.d}
                  fill={g.ch === "V" || g.ch === "A" ? KEG : INK}
                  fillRule="evenodd"
                />
              ))}
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 50, lineHeight: 1.05, letterSpacing: -1.5, fontWeight: 500 }}>
                A data center the size of a keg.
              </div>
              <div style={{ fontSize: 24, color: MUTED }}>
                Three nodes. One panel. Under $1,000. Measured, then published.
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
