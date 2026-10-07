"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { assetPath } from "@/lib/assets";

type Partner = { name: string; logo: { src: string; alt: string; width: number; height: number } };
const subscribeReady = () => () => {};
const readySnapshot = () => true;
const serverSnapshot = () => false;
function connection() {
  return (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
}
function canRotate() { return !matchMedia("(prefers-reduced-motion: reduce)").matches && !connection()?.saveData; }
function subscribeMotion(callback: () => void) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const network = connection();
  motion.addEventListener("change", callback);
  network?.addEventListener?.("change", callback);
  return () => { motion.removeEventListener("change", callback); network?.removeEventListener?.("change", callback); };
}

export function PartnerCarousel({ items }: { items: readonly Partner[] }) {
  const ready = useSyncExternalStore(subscribeReady, readySnapshot, serverSnapshot);
  const autoAllowed = useSyncExternalStore(subscribeMotion, canRotate, serverSnapshot);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const list = useRef<HTMLUListElement>(null);
  const region = useRef<HTMLDivElement>(null);
  const move = useCallback((direction: number, manual = false) => {
    const viewport = list.current;
    if (!viewport || !viewport.firstElementChild) return;
    const step = viewport.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(viewport).gap);
    const max = viewport.scrollWidth - viewport.clientWidth;
    const target = direction > 0
      ? viewport.scrollLeft >= max - 2 ? 0 : Math.min(max, viewport.scrollLeft + step)
      : viewport.scrollLeft <= 2 ? max : Math.max(0, viewport.scrollLeft - step);
    viewport.scrollTo({ left: target, behavior: canRotate() ? "smooth" : "instant" });
    if (manual) {
      setPaused(true);
      const first = Math.round(target / step);
      const count = Math.max(1, Math.round(viewport.clientWidth / step));
      setAnnouncement(`Partenaires ${first + 1} à ${Math.min(items.length, first + count)} sur ${items.length}`);
    }
  }, [items.length]);

  useEffect(() => {
    if (!ready || !region.current || typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(region.current);
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    if (!autoAllowed || paused || hovered || focused || !inView) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const schedule = () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(() => move(1), 6000);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", schedule); };
  }, [autoAllowed, paused, hovered, focused, inView, move]);

  return (
    <div ref={region} className="partner-carousel" data-ready={ready} data-paused={paused}
      role="region" aria-label="Logos des partenaires" aria-roledescription={ready ? "carrousel" : undefined}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}>
      {ready && <button type="button" className="partner-carousel-arrow partner-carousel-prev" aria-label="Partenaires précédents" aria-controls="partner-logo-list" onClick={() => move(-1, true)}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m14 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </button>}
      <ul ref={list} id="partner-logo-list" className="partner-list" tabIndex={ready ? 0 : undefined} aria-label="Liste des partenaires" data-reveal="off"
        onPointerDown={() => setPaused(true)} onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1, true); }
        }}>
        {items.map((partner) => <li className="card-content" data-reveal="off" key={partner.name}>
          <Image src={assetPath(partner.logo.src)} alt={partner.logo.alt} width={partner.logo.width} height={partner.logo.height}
            sizes="(min-width: 1100px) 180px, (min-width: 700px) 200px, 220px" className="partner-logo" />
        </li>)}
      </ul>
      {ready && <button type="button" className="partner-carousel-arrow partner-carousel-next" aria-label="Partenaires suivants" aria-controls="partner-logo-list" onClick={() => move(1, true)}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m10 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </button>}
      {autoAllowed && <button type="button" className="partner-carousel-pause button button-text" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? "Reprendre le défilement des logos" : "Mettre en pause les logos"}
      </button>}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    </div>
  );
}
