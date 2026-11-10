import { energyModel as m } from "@/content/site";

// Battery energy over a 14-hour winter night under three load policies.
// Pre-build planning model; the INA226 log redraws these lines.
export function NightChart({ className = "" }: { className?: string }) {
  const W = 640;
  const H = 320;
  const pad = { l: 56, r: 16, t: 28, b: 40 };
  const x = (h: number) => pad.l + (h / m.nightHours) * (W - pad.l - pad.r);
  const y = (wh: number) => pad.t + (1 - wh / m.nominalWh) * (H - pad.t - pad.b);

  const series = [
    { name: `3 nodes idle, ${m.idleW} W`, w: m.idleW, color: "var(--ink)", dash: "" },
    { name: "1 node full, 2 idle, 17.2 W", w: 17.2, color: "#3b82f6", dash: "" },
    { name: `3 nodes full, ${m.fullW} W`, w: m.fullW, color: "#e5533c", dash: "" },
  ];
  const reserveColor = "#d99a1b";

  const endHour = (w: number) => Math.min(m.nightHours, m.nominalWh / w);
  const fullCross = (m.nominalWh - m.reserveWh) / m.fullW;

  const label = { fontFamily: "var(--font-mono)", fontSize: 11, fill: "var(--ink-muted)" } as const;

  return (
    <figure className={className}>
      <p className="t-kicker mb-4">Battery energy through a 14-hour winter night</p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="night-t night-d" fill="none">
        <title id="night-t">Battery energy through a 14-hour winter night</title>
        <desc id="night-d">
          Three lines fall from 256 watt-hours. Idle ends the night at about 77 watt-hours, above the 51
          watt-hour reserve. Full load crosses the reserve at about 7.9 hours.
        </desc>
        {[0, 64, 128, 192, 256].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" style={label}>
              {v}
            </text>
          </g>
        ))}
        {[0, 2, 4, 6, 8, 10, 12, 14].map((h) => (
          <text key={h} x={x(h)} y={H - pad.b + 18} textAnchor="middle" style={label}>
            {h}
          </text>
        ))}
        <text x={W - pad.r} y={H - 6} textAnchor="end" style={label}>
          hours after sunset
        </text>
        <text x={pad.l - 8} y={12} textAnchor="end" style={label}>
          Wh
        </text>
        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={y(m.reserveWh)}
          y2={y(m.reserveWh)}
          stroke={reserveColor}
          strokeDasharray="3 5"
        />
        <text x={pad.l + 6} y={y(m.reserveWh) - 6} style={{ ...label, fill: reserveColor }}>
          reserve, {m.reserveWh} Wh
        </text>
        {series.map((s) => {
          const e = endHour(s.w);
          return (
            <line
              key={s.name}
              x1={x(0)}
              y1={y(m.nominalWh)}
              x2={x(e)}
              y2={y(m.nominalWh - s.w * e)}
              stroke={s.color}
              strokeWidth={1.75}
            />
          );
        })}
        <circle cx={x(fullCross)} cy={y(m.reserveWh)} r="3.5" fill="#e5533c" />
        <text x={x(fullCross) + 8} y={y(m.reserveWh) + 22} style={{ ...label, fill: "#e5533c" }}>
          full load crosses the reserve at {fullCross.toFixed(1)} h
        </text>
        <circle cx={x(m.nightHours)} cy={y(m.nominalWh - m.idleW * m.nightHours)} r="3.5" fill="var(--ink)" />
        <text
          x={x(m.nightHours) - 8}
          y={y(m.nominalWh - m.idleW * m.nightHours) - 10}
          textAnchor="end"
          style={{ ...label, fill: "var(--ink)" }}
        >
          {Math.round(m.nominalWh - m.idleW * m.nightHours)} Wh at dawn
        </text>
      </svg>
      <figcaption className="t-kicker mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-2 normal-case tracking-normal">
            <span aria-hidden="true" className="inline-block h-0 w-5 border-t-2" style={{ borderColor: s.color }} />
            {s.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
