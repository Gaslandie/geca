"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";
import { assetPath } from "@/lib/assets";
import localImageLoader from "@/lib/image-loader";

export function HeroVideo({
  src,
  poster,
  pause,
  play,
}: {
  src: string;
  poster: string;
  pause: string;
  play: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manuallyPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const lightPoster = localImageLoader({ src: poster, width: 960 });

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
      if (!video.getAttribute("src")) video.src = assetPath(src);
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
    if (!video.getAttribute("src")) video.src = assetPath(src);
    void video.play().catch(() => {
      // Garder l'image et les liens accessibles si la lecture n'est pas possible.
    });
  };

  return (
    <>
      <div
        className="hero-visual"
        aria-hidden="true"
        style={{ backgroundImage: `url("${lightPoster}")` }}
      >
        <video
          ref={videoRef}
          poster={lightPoster}
          width={1280}
          height={720}
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
          <Icon name={playing ? "pause" : "play"} />
        </button>
      )}
    </>
  );
}
