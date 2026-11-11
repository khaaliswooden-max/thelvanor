"use client";

import { useEffect, useRef, useState } from "react";

type SizeMessage = { type: "keg1-sol:size"; stacked: boolean; height: number };

function isSizeMessage(d: unknown): d is SizeMessage {
  return (
    typeof d === "object" &&
    d !== null &&
    (d as SizeMessage).type === "keg1-sol:size" &&
    typeof (d as SizeMessage).height === "number"
  );
}

// Hosts the Keg-1 SOL twin (a static app under /public/sims) inside the page.
// Wide screens: the app is a fixed three-column console that fits under the nav.
// Narrow screens: the app stacks and reports its own height, and the frame grows
// to match, so the page scrolls once and the frame never scrolls inside it.
// The app (three.js, ~1.3 MB) loads only when the frame nears the viewport.
export function TwinFrame({ src, title }: { src: string; title: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [armed, setArmed] = useState(false);
  const [stackedHeight, setStackedHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.source !== frame.current?.contentWindow) return;
      if (!isSizeMessage(e.data)) return;
      setStackedHeight(e.data.stacked ? e.data.height : null);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div
      ref={wrap}
      className="w-full"
      style={{
        // 64px is the sticky nav. The console fills what is left of the viewport, within sane bounds.
        height: stackedHeight ? `${stackedHeight}px` : "clamp(720px, calc(100dvh - 64px), 940px)",
      }}
    >
      {armed ? (
        <iframe
          ref={frame}
          src={src}
          title={title}
          loading="lazy"
          className="block h-full w-full border-0"
          style={{ background: "var(--dark)", colorScheme: "dark" }}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="t-kicker">Loading the simulation</p>
        </div>
      )}
    </div>
  );
}
