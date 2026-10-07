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
  const [active, setActive] = useState(0);
  const loaded = useRef(new Set<number>());
  const shown = enabled ? active : 0;

  useEffect(() => {
    if (!enabled || photos.length < 2) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const schedule = () => {
      clearInterval(timer);
      if (document.hidden) return;
      timer = setInterval(() => {
        setActive((current) => {
          for (let step = 1; step < photos.length; step++) {
            const next = (current + step) % photos.length;
            if (loaded.current.has(next)) return next;
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
          <Image src={assetPath(photo.src)} alt="" fill sizes="100vw" preload={index === 0}
            loading={index === 0 ? undefined : "eager"}
            onLoad={() => loaded.current.add(index)} onError={() => loaded.current.delete(index)} />
        </div>
      ))}
    </div>
  );
}
