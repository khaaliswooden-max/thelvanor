import type { Grade } from "@/content/site";
import { status } from "@/content/site";

export function GradeTag({ g }: { g: Grade }) {
  const text=
    g==="verified"? "VERIFIED":g==="plausible"? "PLAUSIBLE":g==="speculative"? "SPECULATIVE":"LESSON";
  return (
    <span className="grade" data-g={g} title={gradeHelp[g]}>
      {text}
    </span>
  );
}

const gradeHelp: Record<Grade,string>={
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
    <div className="section-head">
      <div className="section-heading">
        {kicker? <p className="t-meta mb-2">{kicker}</p>:null}
        <h2 className="t-h2">{title}</h2>
      </div>
      {children? <div className="section-copy">{children}</div>:null}
    </div>
  );
}

export function StatusStrip() {
  const cells=[
    { k: "Phase",v: `${status.phase}`,sub: status.phaseName },
    { k: "Measurements",v: `${status.measurements}`,sub: "logged" },
    { k: "Claims under test",v: `${status.claimsUnderTest}`,sub: "graded" },
    { k: "Budget",v: `$${status.budget.toLocaleString()}`,sub: `$${status.spent} spent` },
    { k: "As of",v: status.asOf,sub: "" },
  ];
  return (
    <dl className="status-strip" aria-label="Build status">
      {cells.map((c) => (
        <div key={c.k}>
          <dt className="t-meta">{c.k}</dt>
          <dd>
            <span className="status-value">{c.v}</span>
            {c.sub? <span className="t-meta">{c.sub}</span>:null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
