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
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const list = useRef<HTMLUListElement>(null);
  const region = useRef<HTMLDivElement>(null);
  const scrollFrame = useRef(0);
  const stopScroll = useCallback(() => {
    cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = 0;
    list.current?.style.removeProperty("scroll-snap-type");
  }, []);
  const move = useCallback((direction: number, manual = false) => {
    const viewport = list.current;
    if (!viewport || !viewport.firstElementChild) return;
    stopScroll();
    const step = viewport.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(viewport).gap);
    const max = viewport.scrollWidth - viewport.clientWidth;
    const target = direction > 0
      ? viewport.scrollLeft >= max - 2 ? 0 : Math.min(max, viewport.scrollLeft + step)
      : viewport.scrollLeft <= 2 ? max : Math.max(0, viewport.scrollLeft - step);
    const wrapping = direction > 0 ? viewport.scrollLeft >= max - 2 : viewport.scrollLeft <= 2;
    if (!canRotate() || wrapping) viewport.scrollTo({ left: target, behavior: "instant" });
    else {
      const from = viewport.scrollLeft;
      const started = performance.now();
      viewport.style.scrollSnapType = "none";
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / 1600);
        const fraction = progress * progress * (3 - 2 * progress);
        viewport.scrollLeft = from + (target - from) * fraction;
        if (progress < 1) scrollFrame.current = requestAnimationFrame(tick);
        else stopScroll();
      };
      scrollFrame.current = requestAnimationFrame(tick);
    }
    if (manual) {
      const first = Math.round(target / step);
      const count = Math.max(1, Math.round(viewport.clientWidth / step));
      setAnnouncement(`Partenaires ${first + 1} à ${Math.min(items.length, first + count)} sur ${items.length}`);
    }
  }, [items.length, stopScroll]);

  useEffect(() => {
    if (!ready || !region.current || typeof IntersectionObserver !== "function") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(region.current);
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    if (!autoAllowed || !inView) { stopScroll(); return; }
    if (hovered || focused) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const schedule = () => {
      clearInterval(timer);
      if (document.hidden) stopScroll();
      else timer = setInterval(() => move(1), 8000);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", schedule); };
  }, [autoAllowed, hovered, focused, inView, move, stopScroll]);

  useEffect(() => () => stopScroll(), [stopScroll]);

  return (
    <div ref={region} className="partner-carousel" data-ready={ready} data-paused={hovered || focused}
      role="region" aria-label="Logos des partenaires" aria-roledescription={ready ? "carrousel" : undefined}
      onMouseEnter={() => { stopScroll(); setHovered(true); }} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => { stopScroll(); setFocused(true); }} onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}>
      {ready && <button type="button" className="partner-carousel-arrow partner-carousel-prev" aria-label="Partenaires précédents" aria-controls="partner-logo-list" onClick={() => move(-1, true)}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m14 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </button>}
      <ul ref={list} id="partner-logo-list" className="partner-list" tabIndex={ready ? 0 : undefined} aria-label="Liste des partenaires" data-reveal="off"
        onPointerDown={stopScroll} onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1, true); }
        }}>
        {items.map((partner) => <li className="card-content" data-reveal="off" key={partner.name}>
          <Image src={assetPath(partner.logo.src)} alt={partner.logo.alt} width={partner.logo.width} height={partner.logo.height}
            sizes="(min-width: 1100px) 220px, (min-width: 700px) 240px, 260px" className="partner-logo" />
        </li>)}
      </ul>
      {ready && <button type="button" className="partner-carousel-arrow partner-carousel-next" aria-label="Partenaires suivants" aria-controls="partner-logo-list" onClick={() => move(1, true)}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m10 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </button>}

      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    </div>
  );
}
