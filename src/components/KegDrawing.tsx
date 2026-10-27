// Keg-1 cross-section as a hairline technical drawing. Not to scale.
// Follows Fig. 2 of the pre-build preprint. The only color is the keg itself.

type Props = { className?: string; animate?: boolean };

export function KegDrawing({ className = "", animate = true }: Props) {
  const line = "var(--line-strong)";
  const ink = "var(--ink-muted)";
  const keg = "var(--keg)";
  const label = {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fill: ink,
  } as const;

  return (
    <svg
      viewBox="0 0 640 760"
      className={`${className} ${animate ? "draws" : ""}`}
      role="img"
      aria-labelledby="keg-title keg-desc"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title id="keg-title">Keg-1 cross-section</title>
      <desc id="keg-desc">
        A five-gallon stainless keg in section. Three Raspberry Pi 5 nodes on the left wall conduct heat
        through a 3 mm aluminum plate to the keg shell. A fuse block, three buck converters, and a gigabit
        switch sit on the right. Sealed penetrations are on the upper sidewall. Four temperature probes, a
        humidity sensor, and desiccant are marked.
      </desc>

      {/* Keg shell */}
      <g className="d1" stroke={keg} strokeWidth="2">
        <rect x="140" y="80" width="300" height="600" rx="26" />
        {/* lid lip and PRV */}
        <path d="M168 80v-18h244v18" />
        <path d="M300 62v-16h40v16" />
      </g>

      {/* Centerline, faint */}
      <line className="d1" x1="290" y1="40" x2="290" y2="710" stroke={line} strokeDasharray="2 6" strokeWidth="1" />

      {/* Aluminum plate on left wall */}
      <g className="d2" stroke={ink} strokeWidth="1.25">
        <rect x="144" y="180" width="14" height="330" />
        {/* Pi nodes with thermal pads */}
        {[200, 310, 420].map((y) => (
          <g key={y}>
            <rect x="158" y={y} width="12" height="40" />
            <rect x="170" y={y - 8} width="110" height="56" />
            <line x1="178" y1={y + 10} x2="272" y2={y + 10} strokeOpacity="0.5" />
            <line x1="178" y1={y + 24} x2="272" y2={y + 24} strokeOpacity="0.5" />
          </g>
        ))}
        {/* Right stack: switch, bucks, fuse block */}
        <rect x="330" y="190" width="94" height="60" />
        <rect x="330" y="300" width="94" height="60" />
        <rect x="330" y="410" width="94" height="60" />
        <line x1="344" y1="430" x2="410" y2="430" strokeOpacity="0.5" />
        <line x1="344" y1="446" x2="410" y2="446" strokeOpacity="0.5" />
        {/* bottom: desiccant, BME280 */}
        <rect x="170" y="590" width="90" height="48" />
        <rect x="340" y="600" width="56" height="36" />
      </g>

      {/* Penetrations on the upper right wall */}
      <g className="d3" stroke={ink} strokeWidth="1.25">
        <circle cx="440" cy="130" r="9" />
        <circle cx="440" cy="160" r="9" />
        <line x1="449" y1="130" x2="500" y2="130" />
        <line x1="449" y1="160" x2="500" y2="160" />
      </g>

      {/* Sensor points, orange */}
      <g className="d4" fill={keg} stroke={keg} strokeWidth="1">
        <circle cx="200" cy="120" r="3.5" />
        <circle cx="151" cy="345" r="3.5" />
        <circle cx="236" cy="206" r="3.5" />
        <circle cx="120" cy="300" r="3.5" />
      </g>

      {/* Leader lines */}
      <g className="d4" stroke={line} strokeWidth="1">
        <line x1="204" y1="118" x2="252" y2="104" />
        <line x1="236" y1="202" x2="236" y2="176" />
        <line x1="120" y1="300" x2="92" y2="300" />
        <line x1="151" y1="345" x2="92" y2="345" />
        <line x1="208" y1="614" x2="208" y2="660" />
        <line x1="368" y1="636" x2="368" y2="660" />
        <line x1="424" y1="220" x2="500" y2="220" />
        <line x1="424" y1="330" x2="500" y2="330" />
        <line x1="424" y1="440" x2="500" y2="440" />
        <line x1="224" y1="320" x2="224" y2="290" />
      </g>

      {/* Labels */}
      <g style={label}>
        <text x="256" y="100">DS18B20, air</text>
        <text x="240" y="170" textAnchor="middle">DS18B20, SoC</text>
        <text x="88" y="296" textAnchor="end">DS18B20, outside</text>
        <text x="88" y="349" textAnchor="end">DS18B20, wall</text>
        <text x="224" y="284" textAnchor="middle">Pi 5 ×3</text>
        <text x="150" y="528" transform="rotate(-90 150 528)" textAnchor="start">3 mm Al plate</text>
        <text x="506" y="134">IP68 gland, 12 V in</text>
        <text x="506" y="164">RJ45 bulkhead, data out</text>
        <text x="506" y="224">GbE switch</text>
        <text x="506" y="334">3× buck 5.1 V</text>
        <text x="506" y="444">Fuse block B1–B5</text>
        <text x="208" y="676" textAnchor="middle">silica gel</text>
        <text x="368" y="676" textAnchor="middle">BME280</text>
        <text x="320" y="36" textAnchor="middle">pressure-relief valve, never disabled</text>
        <text x="290" y="734" textAnchor="middle">5 gal 304 stainless ball-lock keg, ≈ 8.5 in × 25 in</text>
      </g>
    </svg>
  );
}
