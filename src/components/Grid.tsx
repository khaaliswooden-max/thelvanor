// Persistent 12-column hairline grid (#2a2c30) that every section border,
// column rule, and card edge snaps to. Painted behind content, above the
// black ground. On mobile only the two container edge rules render.
export function Grid() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div className="wrap h-full">
        <div className="h-full border-x border-line md:grid md:grid-cols-12 md:border-x-0">
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`hidden border-l border-line md:block ${i === 11 ? "border-r" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
