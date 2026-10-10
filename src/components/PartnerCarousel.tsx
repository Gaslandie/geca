"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { partnerCarouselText, type Locale } from "@/content/site";
import { assetPath } from "@/lib/assets";

type Partner = { name: string; logo: { src: string; alt: string; width: number; height: number } };
const subscribeReady = () => () => {};
const readySnapshot = () => true;
const serverSnapshot = () => false;
function connection() {
  return (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
}
function canAnimate() { return !matchMedia("(prefers-reduced-motion: reduce)").matches && !connection()?.saveData; }
function subscribeMotion(callback: () => void) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const network = connection();
  motion.addEventListener("change", callback);
  network?.addEventListener?.("change", callback);
  return () => { motion.removeEventListener("change", callback); network?.removeEventListener?.("change", callback); };
}

export function PartnerCarousel({ items, locale }: { items: readonly Partner[]; locale: Locale }) {
  const text = partnerCarouselText[locale];
  const ready = useSyncExternalStore(subscribeReady, readySnapshot, serverSnapshot);
  const motionAllowed = useSyncExternalStore(subscribeMotion, canAnimate, serverSnapshot);
  const [focused, setFocused] = useState(false);
  const running = ready && motionAllowed && !focused;
  const [announcement, setAnnouncement] = useState("");
  const list = useRef<HTMLUListElement>(null);
  const scrollFrame = useRef(0);
  const hovering = useRef(false);
  const stopScroll = useCallback(() => {
    cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = 0;
    list.current?.style.removeProperty("scroll-snap-type");
  }, []);
  const move = useCallback((direction: number, announce = true) => {
    const viewport = list.current;
    if (!viewport || !viewport.firstElementChild) return;
    stopScroll();
    const step = viewport.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(viewport).gap);
    const max = viewport.scrollWidth - viewport.clientWidth;
    const target = direction > 0
      ? viewport.scrollLeft >= max - 2 ? 0 : Math.min(max, viewport.scrollLeft + step)
      : viewport.scrollLeft <= 2 ? max : Math.max(0, viewport.scrollLeft - step);
    const wrapping = direction > 0 ? viewport.scrollLeft >= max - 2 : viewport.scrollLeft <= 2;
    if (!canAnimate() || wrapping || max <= 2) {
      viewport.scrollTo({ left: target, behavior: "instant" });
    }
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
    const first = Math.round(target / step);
    const count = Math.max(1, Math.round(viewport.clientWidth / step));
    if (announce) setAnnouncement(text.range(first + 1, Math.min(items.length, first + count), items.length));
  }, [items.length, stopScroll, text]);

  useEffect(() => {
    const unsubscribe = subscribeMotion(stopScroll);
    const stopWhenHidden = () => { if (document.hidden) stopScroll(); };
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", stopWhenHidden);
      stopScroll();
    };
  }, [stopScroll]);

  useEffect(() => {
    if (!running) return;
    let inView = typeof IntersectionObserver !== "function";
    const observer = typeof IntersectionObserver === "function" ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) stopScroll();
    }) : undefined;
    if (list.current) observer?.observe(list.current);
    const timer = window.setInterval(() => {
      if (inView && !document.hidden && !hovering.current) move(1, false);
    }, 3500);
    return () => {
      window.clearInterval(timer);
      observer?.disconnect();
      stopScroll();
    };
  }, [running, move, stopScroll]);

  return (
    <div className="partner-carousel" data-ready={ready} data-autoplay={running}
      role="region" aria-label={text.region} aria-roledescription={ready ? text.role : undefined}
      onPointerEnter={() => { hovering.current = true; stopScroll(); }}
      onPointerLeave={() => { hovering.current = false; }}
      onFocusCapture={() => { setFocused(true); stopScroll(); }}
      onBlurCapture={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}>
      {ready && <button type="button" className="partner-carousel-arrow partner-carousel-prev" aria-label={text.previous} aria-controls="partner-logo-list" onClick={() => move(-1)}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m14 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </button>}
      <ul ref={list} id="partner-logo-list" className="partner-list" tabIndex={ready ? 0 : undefined} aria-label={text.list} data-reveal="off"
        onPointerDown={stopScroll} onWheel={stopScroll} onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
        }}>
        {items.map((partner) => <li className="card-content" data-reveal="off" key={partner.name}>
          <Image src={assetPath(partner.logo.src)} alt={partner.logo.alt} width={partner.logo.width} height={partner.logo.height}
            sizes="(min-width: 1100px) 220px, (min-width: 700px) 240px, 260px" className="partner-logo" />
        </li>)}
      </ul>
      {ready && <button type="button" className="partner-carousel-arrow partner-carousel-next" aria-label={text.next} aria-controls="partner-logo-list" onClick={() => move(1)}>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m10 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
      </button>}

      <p className="sr-only" aria-live={running ? "off" : "polite"} aria-atomic="true">{announcement}</p>
    </div>
  );
}
