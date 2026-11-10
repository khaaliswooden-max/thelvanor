"use client";

import { useEffect, useRef, useState } from "react";

// Lazy-loads @google/model-viewer only when the figure scrolls into view,
// so the GLB (≈385 KB, Draco) never costs anything on first paint.
export function ModelViewer({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (armed) void import("@google/model-viewer");
  }, [armed]);

  return (
    <div ref={ref} className="relative aspect-square w-full bg-surface">
      {armed ? (
        // model-viewer is a custom element; React 19 passes unknown props through as attributes.
        <model-viewer
          src={src}
          poster={poster}
          alt={alt}
          camera-controls
          touch-action="pan-y"
          auto-rotate
          auto-rotate-delay="1500"
          rotation-per-second="12deg"
          camera-orbit="35deg 72deg auto"
          shadow-intensity="0.6"
          exposure="1.0"
          interaction-prompt="none"
          loading="lazy"
          reveal="auto"
          style={{ width: "100%", height: "100%", background: "transparent" }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={alt} className="h-full w-full object-contain" />
      )}
      <p className="t-kicker absolute bottom-3 left-4">Drag to orbit · scroll to zoom</p>
    </div>
  );
}
