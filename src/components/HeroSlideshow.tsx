"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { LocalPhoto } from "@/content/site";
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

export function HeroSlideshow({ photos }: { photos: readonly LocalPhoto[] }) {
  const enabled = useSyncExternalStore(subscribe, canRotate, staticOnServer);
  const [slides, setSlides] = useState(() => ({ active: 0, requested: new Set([0, 1]) }));
  const loaded = useRef(new Set<number>());
  const shown = enabled ? slides.active : 0;

  useEffect(() => {
    if (!enabled || photos.length < 2) return;
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
  }, [enabled, photos.length]);

  return (
    <div className="hero-backdrop" aria-hidden="true" data-reveal="off" data-slide={shown}>
      {photos.map((photo, index) => (index === 0 || enabled) && (
        <div className="hero-slide" data-active={index === shown} key={photo.src}>
          {(index === 0 || slides.requested.has(index)) && (
          <Image src={assetPath(photo.src)} alt="" fill sizes="100vw" preload={index === 0}
            loading={index === 0 ? undefined : "eager"}
            onLoad={() => loaded.current.add(index)} onError={() => {
              loaded.current.delete(index);
              const next = (index + 1) % photos.length;
              setSlides((current) => current.requested.has(next) ? current : { ...current, requested: new Set([...current.requested, next]) });
            }} />
          )}
        </div>
      ))}
    </div>
  );
}
