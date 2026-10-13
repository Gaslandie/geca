"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { type Locale, type LocalPhoto } from "@/content/site";
import { assetPath } from "@/lib/assets";

function connection() {
  return (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
}
function canRotate() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !connection()?.saveData;
}
function subscribe(callback: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const network = connection();
  motion.addEventListener("change", callback);
  network?.addEventListener?.("change", callback);
  return () => {
    motion.removeEventListener("change", callback);
    network?.removeEventListener?.("change", callback);
  };
}
const staticOnServer = () => false;

const subscribeReady = () => () => {};
const readyOnClient = () => true;

export function HeroSlideshow({ photos, locale }: { photos: readonly LocalPhoto[]; locale: Locale }) {
  const enabled = useSyncExternalStore(subscribe, canRotate, staticOnServer);
  const [slides, setSlides] = useState(() => ({ active: 0, requested: new Set([0]) }));
  const loaded = useRef(new Set<number>());
  const ready = useSyncExternalStore(subscribeReady, readyOnClient, staticOnServer);
  const [manual, setManual] = useState(false);
  const pending = useRef<number | null>(null);
  const shown = slides.active;
  const move = (direction: number) => {
    const next = (slides.active + direction + photos.length) % photos.length;
    setManual(true);
    pending.current = loaded.current.has(next) ? null : next;
    setSlides((current) => ({ active: loaded.current.has(next) ? next : current.active, requested: new Set([...current.requested, next]) }));
  };

  useEffect(() => {
    if (!enabled || manual || photos.length < 2) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const schedule = () => {
      clearInterval(timer);
      if (document.hidden) return;
      timer = setInterval(() => {
        setSlides((current) => {
          for (let step = 1; step < photos.length; step++) {
            const next = (current.active + step) % photos.length;
            if (loaded.current.has(next)) return { active: next, requested: new Set([...current.requested, (next + 1) % photos.length]) };
          }
          return current;
        });
      }, 5000);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [enabled, manual, photos.length]);

  return (
    <>
    <div className="hero-backdrop" aria-hidden="true" data-reveal="off" data-slide={shown}>
      {photos.map((photo, index) => (index === 0 || enabled || slides.requested.has(index)) && (
        <div className="hero-slide" data-active={index === shown} key={photo.src}>
          {(index === 0 || slides.requested.has(index)) && (
          <Image src={assetPath(photo.src)} alt="" fill sizes="(max-width: 767px) 100vw, (max-width: 1300px) 45vw, 590px" preload={index === 0}
            loading={index === 0 ? undefined : "eager"}
            fetchPriority={index === 0 ? undefined : "low"}
            onLoad={() => {
              loaded.current.add(index);
              if (pending.current === index) {
                pending.current = null;
                setSlides((current) => ({ ...current, active: index }));
              }
              if (index === 0 && enabled) setSlides((current) => current.requested.has(1) ? current : { ...current, requested: new Set([...current.requested, 1]) });
            }} onError={() => {
              loaded.current.delete(index);
              if (pending.current === index) pending.current = null;
              const next = (index + 1) % photos.length;
              setSlides((current) => current.requested.has(next) ? current : { ...current, requested: new Set([...current.requested, next]) });
            }} />
          )}
        </div>
      ))}
    </div>
    {ready && photos.length > 1 && <div className="hero-photo-controls" role="group" aria-label={locale === "fr" ? "Photos de l’accueil" : "Homepage photos"}>
      <button type="button" onClick={() => move(-1)} aria-label={locale === "fr" ? "Photo précédente" : "Previous photo"}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6M8 12h12" /></svg>
      </button>
      <span aria-live={manual ? "polite" : "off"} aria-atomic="true">{String(shown + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
      <button type="button" onClick={() => move(1)} aria-label={locale === "fr" ? "Photo suivante" : "Next photo"}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m10 6 6 6-6 6M16 12H4" /></svg>
      </button>
    </div>}
    </>
  );
}
