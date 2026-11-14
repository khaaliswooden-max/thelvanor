// The Thelvanor wordmark, drawn on a 100-unit cap height with a 14-unit stroke.
// V and Λ share one diagonal and sit 12 units apart: a waveform, and VA, the volt-ampere.
// Keg orange marks that pair; every other glyph takes currentColor.

export const WORDMARK_WIDTH = 788;

export const GLYPHS: { ch: string; x: number; d: string }[] = [
  { ch: "T", x: 0, d: "M0,0H76V14H45V100H31V14H0Z" },
  { ch: "H", x: 92, d: "M0,0H14V43H62V0H76V100H62V57H14V100H0Z" },
  { ch: "E", x: 190, d: "M0,0H64V14H14V43H56V57H14V86H64V100H0Z" },
  { ch: "L", x: 272, d: "M0,0H14V86H60V100H0Z" },
  { ch: "V", x: 328, d: "M0,0H15L46,79.5L77,0H92L53,100H39Z" },
  { ch: "A", x: 394, d: "M39,0H53L92,100H77L46,20.5L15,100H0Z" },
  { ch: "N", x: 496, d: "M0,0H16L66,77.5V0H80V100H64L14,22.5V100H0Z" },
  {
    ch: "O",
    x: 598,
    d: "M34,0H58A34,34 0 0 1 92,34V66A34,34 0 0 1 58,100H34A34,34 0 0 1 0,66V34A34,34 0 0 1 34,0ZM34,14H58A20,20 0 0 1 78,34V66A20,20 0 0 1 58,86H34A20,20 0 0 1 14,66V34A20,20 0 0 1 34,14Z",
  },
  {
    ch: "R",
    x: 712,
    d: "M0,0H48A28,28 0 0 1 76,28V30A28,28 0 0 1 48,58L76,100H59L31,58H14V100H0ZM14,14H48A14,14 0 0 1 62,28V30A14,14 0 0 1 48,44H14Z",
  },
];

export function WordmarkGlyphs({ signal = "var(--keg)" }: { signal?: string }) {
  return (
    <>
      {GLYPHS.map((g) => (
        <path
          key={g.ch}
          transform={`translate(${g.x},0)`}
          d={g.d}
          fill={g.ch === "V" || g.ch === "A" ? signal : "currentColor"}
          fillRule="evenodd"
        />
      ))}
    </>
  );
}

export function Wordmark({ className = "", title = "Thelvanor" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={`0 0 ${WORDMARK_WIDTH} 100`} className={className} role="img" aria-label={title}>
      <WordmarkGlyphs />
    </svg>
  );
}
