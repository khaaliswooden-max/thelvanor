import { WordmarkGlyphs } from "./Wordmark";

// The wordmark on its construction grid. Units are 1/100 of the cap height.
// Meant for a dark band; colors come from the band's variables.
export function WordmarkConstruction() {
  const h: number[] = [];
  for (let y = -40; y <= 140; y += 10) h.push(y);
  const v: number[] = [];
  for (let x = -40; x <= 830; x += 10) v.push(x);
  const label = { fontFamily: "var(--font-mono)", fontSize: 6, fill: "var(--ink-muted)" } as const;
  return (
    <svg
      viewBox="-40 -42 868 179"
      className="block h-auto w-full"
      role="img"
      aria-label="The Thelvanor wordmark on its construction grid: 100-unit cap height, 14-unit stroke, and the parallel diagonals of V and A drawn as dashed orange guides."
    >
      <g stroke="var(--line)" strokeWidth={0.5}>
        {h.map((y) => (
          <line key={`h${y}`} x1={-40} x2={828} y1={y} y2={y} />
        ))}
        {v.map((x) => (
          <line key={`v${x}`} x1={x} x2={x} y1={-40} y2={140} />
        ))}
      </g>
      <g strokeWidth={0.6}>
        <line x1={-40} x2={828} y1={0} y2={0} stroke="var(--ink-muted)" />
        <line x1={-40} x2={828} y1={100} y2={100} stroke="var(--ink-muted)" />
        <line x1={-40} x2={828} y1={43} y2={43} stroke="var(--line-strong)" />
        <line x1={-40} x2={828} y1={57} y2={57} stroke="var(--line-strong)" />
      </g>
      <g opacity={0.94} style={{ color: "var(--ink)" }}>
        <WordmarkGlyphs />
      </g>
      <g stroke="var(--keg)" strokeWidth={0.8} strokeDasharray="3 2">
        <line x1={435.6} y1={-40} x2={365.4} y2={140} />
        <line x1={448.6} y1={-40} x2={378.4} y2={140} />
        <line x1={328} y1={-40} x2={398.2} y2={140} opacity={0.5} />
        <line x1={486} y1={-40} x2={415.8} y2={140} opacity={0.5} />
      </g>
      <g stroke="var(--ink)" strokeWidth={0.8}>
        <line x1={92} x2={106} y1={-14} y2={-14} />
        <line x1={92} x2={92} y1={-18} y2={-10} />
        <line x1={106} x2={106} y1={-18} y2={-10} />
      </g>
      <text x={110} y={-11.5} style={{ ...label, fill: "var(--ink)", fontSize: 7 }}>14u</text>
      <text x={-38} y={-3} style={label}>CAP 100</text>
      <text x={-38} y={54} style={label}>BAR</text>
      <text x={-38} y={109} style={label}>BASE 0</text>
      <text x={452} y={-30} style={{ ...label, fill: "var(--keg)", fontSize: 7 }}>
        ∥ slope 0.39 · 12u gap
      </text>
    </svg>
  );
}
