import Link from "next/link";
import { researchQuestions } from "@/content/site";
import { KegDrawing } from "./KegDrawing";

// Reuses the same section geometry; the backdrop introduces no new hardware claims.
export function KegSection() {
  const question = researchQuestions[1];
  return (
    <section className="section keg-section" aria-labelledby="cross-section-title">
      <div className="keg-backdrop" aria-hidden="true">
        <KegDrawing animate={false} detail className="keg-pan" />
      </div>
      <div className="wrap keg-section-content">
        <p className="t-meta">Keg-1 / Cross-section / Not to scale</p>
        <div className="section-head">
          <div className="section-heading">
            <h2 id="cross-section-title" className="t-h2">{question.title}.</h2>
          </div>
          <div className="section-copy">
            <p>{question.body}</p>
            <Link href="/research" className="link mt-8 inline-block">
              Research <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
