"use client";

import { useEffect, useRef, useState } from "react";

export function HeroVideo({
  src,
  poster,
  pause,
  pauseShort,
  play,
}: {
  src: string;
  poster: string;
  pause: string;
  pauseShort: string;
  play: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manuallyPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;

    const updatePlayback = () => {
      if (motion.matches || connection?.saveData || manuallyPaused.current) {
        video.pause();
        return;
      }
      // La source n'est chargée qu'après avoir vérifié les préférences.
      if (!video.getAttribute("src")) video.src = src;
      void video.play().catch(() => {
        // Le navigateur peut refuser la lecture automatique. Le bouton reste utilisable.
      });
    };
    updatePlayback();
    motion.addEventListener("change", updatePlayback);
    return () => {
      motion.removeEventListener("change", updatePlayback);
      video.pause();
    };
  }, [src]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      manuallyPaused.current = true;
      video.pause();
      return;
    }
    manuallyPaused.current = false;
    if (!video.getAttribute("src")) video.src = src;
    void video.play().catch(() => {
      // Garder l'image et les liens accessibles si la lecture n'est pas possible.
    });
  };

  return (
    <>
      <div
        className="hero-visual"
        aria-hidden="true"
        style={{ backgroundImage: `url("${poster}")` }}
      >
        <video
          ref={videoRef}
          poster={poster}
          width={1920}
          height={1080}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          data-ready={ready && !failed}
          onLoadedData={() => setReady(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        />
      </div>
      {!failed && (
        <button
          type="button"
          className="hero-video-toggle"
          onClick={togglePlayback}
          aria-label={playing ? pause : play}
        >
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
          {playing ? pauseShort : play}
        </button>
      )}
    </>
  );
}
