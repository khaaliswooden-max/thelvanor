// Keg-1 deployed, as a wide hairline cross-section: panel as sunshade above,
// battery box on the ground, the keg in section with its sensors. Drawn wide
// so the section on / can pan it slowly behind the headline. The only color
// is the keg shell and the sensor points. Not to scale.

export function KegScene({ className = "" }: { className?: string }) {
  const line = "var(--line-strong)";
  const ink = "var(--ink-muted)";
  const faint = "var(--ink-faint)";
  const keg = "var(--keg)";
  const label = {
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    fill: ink,
  } as const;

  return (
    <svg
      viewBox="0 0 3400 640"
      className={className}
      role="img"
      aria-labelledby="scene-title scene-desc"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="scene-title">Keg-1 deployed, cross-section</title>
      <desc id="scene-desc">
        A technical line drawing of the deployed Keg-1 site. A solar panel on struts shades a stainless keg
        drawn in cross-section: three compute nodes on an aluminum plate against the left wall, a switch, buck
        converters, and a fuse block on the right, sensor points marked. A battery box sits on the ground and
        a cable enters the keg through a sealed gland.
      </desc>

      {/* ground */}
      <g stroke={line} strokeWidth="1">
        <line x1="0" y1="520" x2="3400" y2="520" />
        {Array.from({ length: 84 }, (_, i) => (
          <line key={i} x1={i * 41} y1="520" x2={i * 41 - 8} y2="532" strokeOpacity="0.5" />
        ))}
      </g>

      {/* panel as sunshade, on struts */}
      <g stroke={ink} strokeWidth="1.25">
        <path d="M300 128 L860 84 L896 128 L336 172 Z" />
        <line x1="340" y1="146" x2="880" y2="102" strokeOpacity="0.5" />
        <line x1="420" y1="166" x2="420" y2="150" />
        <line x1="430" y1="171" x2="452" y2="206" />
        <line x1="770" y1="137" x2="742" y2="196" />
      </g>
      <text x="586" y="52" textAnchor="middle" style={label}>
        100 W panel, doubles as sunshade
      </text>
      <line x1="586" y1="60" x2="586" y2="96" stroke={line} strokeWidth="1" />

      {/* keg shell, the accent */}
      <g stroke={keg} strokeWidth="2">
        <rect x="480" y="200" width="260" height="320" rx="22" />
        <path d="M506 200v-16h208v16" />
        <path d="M592 184v-14h36v14" />
      </g>
      <text x="610" y="156" textAnchor="middle" style={label}>
        pressure-relief valve, never disabled
      </text>

      {/* interior: plate, nodes, right stack */}
      <g stroke={ink} strokeWidth="1.25">
        <rect x="484" y="266" width="12" height="200" />
        {[276, 336, 396].map((y) => (
          <g key={y}>
            <rect x="496" y={y} width="10" height="34" />
            <rect x="506" y={y - 6} width="84" height="46" />
            <line x1="512" y1={y + 8} x2="584" y2={y + 8} strokeOpacity="0.5" />
            <line x1="512" y1={y + 24} x2="584" y2={y + 24} strokeOpacity="0.5" />
          </g>
        ))}
        <rect x="616" y="272" width="80" height="46" />
        <rect x="616" y="336" width="80" height="46" />
        <rect x="616" y="400" width="80" height="46" />
        <line x1="628" y1="416" x2="684" y2="416" strokeOpacity="0.5" />
        <line x1="628" y1="430" x2="684" y2="430" strokeOpacity="0.5" />
        <rect x="506" y="462" width="70" height="38" />
        <rect x="640" y="466" width="46" height="30" />
      </g>
      <g style={label}>
        <text x="548" y="258" textAnchor="middle">Pi 5 ×3</text>
        <text x="656" y="262" textAnchor="middle">GbE switch</text>
        <text x="656" y="330" textAnchor="middle">3× buck 5.1 V</text>
        <text x="656" y="394" textAnchor="middle">Fuse block B1–B5</text>
        <text x="541" y="516" textAnchor="middle">silica gel</text>
        <text x="663" y="516" textAnchor="middle">BME280</text>
      </g>

      {/* sensor points, the accent */}
      <g fill={keg} stroke={keg} strokeWidth="1">
        <circle cx="530" cy="228" r="3.5" />
        <circle cx="524" cy="286" r="3.5" />
        <circle cx="490" cy="366" r="3.5" />
        <circle cx="462" cy="330" r="3.5" />
      </g>
      <g stroke={line} strokeWidth="1">
        <line x1="534" y1="226" x2="570" y2="214" />
        <line x1="524" y1="282" x2="548" y2="266" />
        <line x1="486" y1="366" x2="466" y2="366" />
        <line x1="462" y1="330" x2="462" y2="366" />
      </g>
      <g style={label}>
        <text x="574" y="212">DS18B20, air</text>
        <text x="458" y="382" textAnchor="end">DS18B20, wall</text>
      </g>

      {/* penetrations and cable in */}
      <g stroke={ink} strokeWidth="1.25">
        <circle cx="740" cy="240" r="8" />
        <circle cx="740" cy="266" r="8" />
        <line x1="748" y1="240" x2="806" y2="240" />
        <line x1="748" y1="264" x2="806" y2="288" />
      </g>
      <g style={label}>
        <text x="812" y="236">IP68 gland, 12 V in</text>
        <text x="812" y="292">RJ45 bulkhead, data out</text>
      </g>

      {/* battery box on the ground */}
      <g stroke={ink} strokeWidth="1.25">
        <rect x="860" y="452" width="140" height="68" />
        <line x1="860" y1="476" x2="1000" y2="476" strokeOpacity="0.5" />
      </g>
      <path d="M806 240 L836 240 L836 452" stroke={ink} strokeWidth="1.25" strokeDasharray="4 4" />
      <text x="930" y="440" textAnchor="middle" style={label}>
        LiFePO₄ battery, MPPT
      </text>

      {/* dimensions */}
      <g stroke={line} strokeWidth="1">
        <line x1="480" y1="552" x2="740" y2="552" />
        <line x1="480" y1="546" x2="480" y2="558" />
        <line x1="740" y1="546" x2="740" y2="558" />
        <line x1="772" y1="200" x2="772" y2="520" />
        <line x1="766" y1="200" x2="778" y2="200" />
        <line x1="766" y1="520" x2="778" y2="520" />
      </g>
      <g style={label}>
        <text x="610" y="572" textAnchor="middle">≈ 8.5 in</text>
        <text x="790" y="364">≈ 25 in</text>
      </g>

      {/* a second unit, farther out, fainter */}
      <g stroke={faint} strokeWidth="1">
        <rect x="1750" y="360" width="120" height="160" rx="14" />
        <path d="M1766 360v-10h88v10" />
        <path d="M1710 344 L1900 328 L1912 350 L1722 366 Z" />
        <line x1="1810" y1="336" x2="1810" y2="350" />
      </g>

      {/* a third, only a panel on the horizon */}
      <g stroke={faint} strokeWidth="1" strokeOpacity="0.6">
        <path d="M2560 420 L2740 408 L2750 428 L2570 440 Z" />
        <line x1="2650" y1="414" x2="2650" y2="520" />
        <rect x="3010" y="420" width="80" height="100" rx="10" />
        <path d="M3022 420v-8h56v8" />
      </g>

      {/* site label */}
      <text x="20" y="620" style={label}>
        Keg-1, deployed. Cross-section, not to scale.
      </text>
    </svg>
  );
}
