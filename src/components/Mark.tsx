// The mark: a keg in elevation, drawn as two strokes. Monochrome, like the
// wordmark; the accent is reserved for the keg drawing itself.
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="6" y="4" width="12" height="18" rx="2.5" />
      <path d="M8.5 4V2.5h7V4" />
      <path d="M6 9.5h12M6 16.5h12" strokeOpacity="0.5" />
    </svg>
  );
}
