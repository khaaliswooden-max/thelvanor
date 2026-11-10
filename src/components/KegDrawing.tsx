import { useId } from "react";

// Keg-1 cross-section as a hairline technical drawing. Not to scale.
// Follows Fig. 2 of the pre-build preprint. The only color is the keg itself.

type Props={ className?: string; animate?: boolean; detail?: boolean };

export function KegDrawing({ className="",animate=true,detail=false }: Props) {
  const id=useId();
  const line="var(--line-strong)";
  const ink="var(--ink-muted)";
  const keg="var(--keg)";
  const label={
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    fill: ink,
  } as const;

  return (
    <svg
      viewBox={detail? "110 80 360 600":"-60 0 820 760"}
      className={`${className} ${animate? "draws":""}`}
      role="img"
      aria-labelledby={`${id}-title ${id}-desc`}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title id={`${id}-title`}>Keg-1 cross-section</title>
      <desc id={`${id}-desc`}>
        A five-gallon stainless keg in section. Three Raspberry Pi 5 nodes on the left wall conduct heat
        through a 3 mm aluminum plate to the keg shell. A fuse block, three buck converters, and a gigabit
        switch sit on the right. Sealed penetrations are on the upper sidewall. Four temperature probes, a
        humidity sensor, and desiccant are marked.
      </desc>

      {/* Keg shell */}
      <g className="d1" stroke={keg} strokeWidth="1">
        <path pathLength="1" vectorEffect="non-scaling-stroke" d="M182 80H398C424 80 440 108 440 140V636C440 664 422 680 394 680H186C158 680 140 664 140 636V140C140 108 156 80 182 80Z" />
        <path pathLength="1" vectorEffect="non-scaling-stroke" d="M140 154H440M140 166H440M140 546H440M140 558H440M146 650H434" />
        <path pathLength="1" vectorEffect="non-scaling-stroke" d="M166 94H414M166 106H414" />
        {/* lid lip and PRV */}
        <path pathLength="1" vectorEffect="non-scaling-stroke" d="M168 80v-18h244v18" />
        <path pathLength="1" vectorEffect="non-scaling-stroke" d="M300 62v-16h40v16" />
      </g>

      {/* Centerline, faint */}
      <line pathLength="1" vectorEffect="non-scaling-stroke" className="d1" x1="290" y1="40" x2="290" y2="710" stroke={line} strokeDasharray="2 6" strokeWidth="1" />

      {/* Aluminum plate on left wall */}
      <g className="d2" stroke={ink} strokeWidth="1">
        <rect pathLength="1" vectorEffect="non-scaling-stroke" x="144" y="180" width="14" height="330" />
        {/* Pi nodes with thermal pads */}
        {[200,310,420].map((y) => (
          <g key={y}>
            <rect pathLength="1" vectorEffect="non-scaling-stroke" x="158" y={y} width="12" height="40" />
            <rect pathLength="1" vectorEffect="non-scaling-stroke" x="170" y={y-8} width="110" height="56" />
            <line pathLength="1" vectorEffect="non-scaling-stroke" x1="178" y1={y+10} x2="272" y2={y+10} strokeOpacity="0.5" />
            <line pathLength="1" vectorEffect="non-scaling-stroke" x1="178" y1={y+24} x2="272" y2={y+24} strokeOpacity="0.5" />
          </g>
        ))}
        {/* Right stack: switch, bucks, fuse block */}
        <rect pathLength="1" vectorEffect="non-scaling-stroke" x="330" y="190" width="94" height="60" />
        <rect pathLength="1" vectorEffect="non-scaling-stroke" x="330" y="300" width="94" height="60" />
        <rect pathLength="1" vectorEffect="non-scaling-stroke" x="330" y="410" width="94" height="60" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="344" y1="430" x2="410" y2="430" strokeOpacity="0.5" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="344" y1="446" x2="410" y2="446" strokeOpacity="0.5" />
        {/* bottom: desiccant, BME280 */}
        <rect pathLength="1" vectorEffect="non-scaling-stroke" x="170" y="590" width="90" height="48" />
        <rect pathLength="1" vectorEffect="non-scaling-stroke" x="340" y="600" width="56" height="36" />
      </g>

      {/* Penetrations on the upper right wall */}
      <g className="d3" stroke={ink} strokeWidth="1">
        <circle pathLength="1" vectorEffect="non-scaling-stroke" cx="440" cy="130" r="9" />
        <circle pathLength="1" vectorEffect="non-scaling-stroke" cx="440" cy="160" r="9" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="449" y1="130" x2="500" y2="130" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="449" y1="160" x2="500" y2="160" />
      </g>

      {/* Sensor points, orange */}
      <g className="d4" fill={keg} stroke={keg} strokeWidth="1">
        <circle pathLength="1" vectorEffect="non-scaling-stroke" cx="200" cy="120" r="3.5" />
        <circle pathLength="1" vectorEffect="non-scaling-stroke" cx="151" cy="345" r="3.5" />
        <circle pathLength="1" vectorEffect="non-scaling-stroke" cx="236" cy="206" r="3.5" />
        <circle pathLength="1" vectorEffect="non-scaling-stroke" cx="120" cy="300" r="3.5" />
      </g>

      {/* Leader lines */}
      <g className="d4" stroke={line} strokeWidth="1">
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="204" y1="118" x2="252" y2="104" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="236" y1="202" x2="236" y2="176" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="120" y1="300" x2="92" y2="300" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="151" y1="345" x2="92" y2="345" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="208" y1="614" x2="208" y2="660" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="368" y1="636" x2="368" y2="660" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="424" y1="220" x2="500" y2="220" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="424" y1="330" x2="500" y2="330" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="424" y1="440" x2="500" y2="440" />
        <line pathLength="1" vectorEffect="non-scaling-stroke" x1="224" y1="320" x2="224" y2="290" />
      </g>

      {/* Labels */}
      <g style={label} className={detail? "keg-labels-hidden":""}>
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
