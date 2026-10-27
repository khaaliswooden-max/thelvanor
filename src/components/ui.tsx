import type { Grade } from "@/content/site";
import { status } from "@/content/site";

export function GradeTag({ g }: { g: Grade }) {
  const text =
    g === "verified" ? "VERIFIED" : g === "plausible" ? "PLAUSIBLE" : g === "speculative" ? "SPECULATIVE" : "LESSON";
  return (
    <span className="grade" data-g={g} title={gradeHelp[g]}>
      {text}
    </span>
  );
}

const gradeHelp: Record<Grade, string> = {
  verified: "A cited primary or authoritative source supports the claim.",
  plausible: "Reasoned from evidence but not directly sourced.",
  speculative: "A hypothesis to be tested on the bench.",
  lesson: "Withheld by design; the builder produces the number before buying the part.",
};

export function SectionHead({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-5">
        {kicker ? <p className="t-meta mb-2">{kicker}</p> : null}
        <h2 className="t-h2">{title}</h2>
      </div>
      {children ? <div className="t-body md:col-span-7 md:pt-1">{children}</div> : null}
    </div>
  );
}

export function StatusStrip({ compact = false }: { compact?: boolean }) {
  const cells = [
    { k: "Phase", v: `${status.phase}`, sub: status.phaseName },
    { k: "Measurements", v: `${status.measurements}`, sub: "logged" },
    { k: "Claims under test", v: `${status.claimsUnderTest}`, sub: "graded" },
    { k: "Budget", v: `$${status.budget.toLocaleString()}`, sub: `$${status.spent} spent` },
    { k: "As of", v: status.asOf, sub: "" },
  ];
  return (
    <dl
      className={`grid grid-cols-2 border-y border-line sm:grid-cols-5 ${compact ? "" : ""}`}
      aria-label="Build status"
    >
      {cells.map((c, i) => (
        <div
          key={c.k}
          className={`px-0 py-4 sm:px-5 ${i === cells.length - 1 ? "col-span-2 sm:col-span-1" : ""} ${i === 0 ? "sm:pl-0" : ""} ${i < cells.length - 1 ? "sm:border-r sm:border-line" : ""}`}
        >
          <dt className="t-meta">{c.k}</dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="t-num text-xl leading-none">{c.v}</span>
            {c.sub ? <span className="t-meta">{c.sub}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
