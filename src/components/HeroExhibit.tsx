"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type StateMessage = { type: "keg1-exhibit:state"; state: "ready" | "unavailable" };

function isStateMessage(d: unknown): d is StateMessage {
  if (typeof d !== "object" || d === null) return false;
  const m = d as StateMessage;
  return m.type === "keg1-exhibit:state" && (m.state === "ready" || m.state === "unavailable");
}

// poster   the still image, served with the page. It is the largest paint, so nothing may delay it.
// ask      a visitor on data saver: the model loads only if they ask for it.
// loading  the frame is mounted but hidden until the model reports its first frame.
// live     the model is on screen.
// still    WebGL is not available. The poster stays.
type Phase = "poster" | "ask" | "loading" | "live" | "still";

// The home page hero. Hosts the Keg-1 exhibit (a static app under /public/sims) in its
// hero mode: the model alone, with the wheel and vertical swipes left to the page.
// three.js (about 200 KB compressed) is fetched only after the page has loaded and gone idle.
export function HeroExhibit({
  src,
  poster,
  alt,
  title,
}: {
  src: string;
  poster: string;
  alt: string;
  title: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [phase, setPhase] = useState<Phase>("poster");

  useEffect(() => {
    let idle: number | undefined;
    let timer: number | undefined;
    const arm = () => {
      const saveData =
        (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
      setPhase(saveData ? "ask" : "loading");
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(arm, { timeout: 2500 });
      else timer = window.setTimeout(arm, 1200);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.source !== frame.current?.contentWindow) return;
      if (!isStateMessage(e.data)) return;
      setPhase(e.data.state === "ready" ? "live" : "still");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const mounted = phase === "loading" || phase === "live";

  return (
    <div
      className="relative w-full overflow-hidden bg-surface-2"
      // Two to one on a desktop, as the still hero was. Taller in proportion on a phone, so the keg reads.
      style={{ height: "clamp(420px, 50vw, 760px)" }}
    >
      <Image
        src={poster}
        alt={alt}
        fill
        preload
        sizes="100vw"
        aria-hidden={phase === "live"}
        className="object-cover"
      />
      {mounted ? (
        <iframe
          ref={frame}
          src={src}
          title={title}
          className={`absolute inset-0 block h-full w-full border-0 transition-opacity duration-500 ${
            phase === "live" ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{ background: "var(--surface-2)" }}
        />
      ) : null}
      {phase === "ask" ? (
        <button
          type="button"
          onClick={() => setPhase("loading")}
          className="btn btn-solid absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          Load the 3D model
        </button>
      ) : null}
    </div>
  );
}
