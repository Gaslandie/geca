"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function connection() {
  return (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
}
function canMove() {
  return !matchMedia("(prefers-reduced-motion: reduce)").matches && !connection()?.saveData;
}
function subscribe(callback: () => void) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const network = connection();
  motion.addEventListener("change", callback);
  network?.addEventListener?.("change", callback);
  return () => {
    motion.removeEventListener("change", callback);
    network?.removeEventListener?.("change", callback);
  };
}
const staticOnServer = () => false;

export function PartnerTicker({ names, label }: { names: readonly string[]; label: string }) {
  const enabled = useSyncExternalStore(subscribe, canMove, staticOnServer);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const region = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }) : undefined;
    if (region.current) observer?.observe(region.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [enabled]);

  return (
    <aside ref={region} className="partner-ticker" aria-label={label} data-reveal="off" data-enabled={enabled} data-paused={paused || !visible}>
      <div className="partner-ticker-heading">
        <p>{label}</p>
        {enabled && <button className="partner-ticker-control" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? "Reprendre le défilement" : "Mettre en pause"}
        </button>}
      </div>
      <div className="partner-ticker-window">
        <div className="partner-ticker-track">
          <ul>{names.map((name) => <li key={name}>{name}</li>)}</ul>
          <ul aria-hidden="true" className="partner-ticker-copy">{names.map((name) => <li key={name}>{name}</li>)}</ul>
        </div>
      </div>
    </aside>
  );
}
