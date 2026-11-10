import type { Grade } from "@/content/site";
import { status } from "@/content/site";

export function GradeTag({ g }: { g: Grade }) {
  const text =
    g === "verified" ? "Verified" : g === "plausible" ? "Plausible" : g === "speculative" ? "Speculative" : "Lesson";
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

/** Kicker in the left column, headline and body in the right. The design's section rhythm. */
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
      <div className="md:col-span-3">{kicker ? <p className="t-kicker md:pt-3">{kicker}</p> : null}</div>
      <div className="md:col-span-8">
        <h2 className="t-h2">{title}</h2>
        {children ? <div className="t-body mt-6 space-y-4">{children}</div> : null}
      </div>
    </div>
  );
}

export function StatusStrip() {
  const cells = [
    { k: "Phase, pre-build", v: `${status.phase}` },
    { k: "Measurements logged", v: `${status.measurements}` },
    { k: "Claims under test, graded", v: `${status.claimsUnderTest}` },
    { k: `Budget, $${status.spent} spent`, v: `$${status.budget.toLocaleString()}` },
  ];
  return (
    <dl className="grid grid-cols-2 border-y border-line md:grid-cols-4" aria-label="Build status">
      {cells.map((c, i) => (
        <div
          key={c.k}
          className={`py-7 pr-4 ${i % 2 === 1 ? "pl-6 border-l border-line" : ""} ${i >= 2 ? "border-t border-line md:border-t-0" : ""} ${i === 2 ? "md:border-l md:pl-6" : ""}`}
        >
          <dd className="t-num text-4xl leading-none">{c.v}</dd>
          <dt className="t-kicker mt-3">{c.k}</dt>
        </div>
      ))}
    </dl>
  );
}
