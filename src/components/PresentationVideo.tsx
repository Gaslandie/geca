"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { getHomeContent } from "@/content/site";
import { assetPath } from "@/lib/assets";
import { Icon } from "./ui";

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function PresentationVideo({ video }: { video: ReturnType<typeof getHomeContent>["about"]["video"] }) {
  const player = useRef<HTMLVideoElement>(null);
  // Le HTML reste utilisable sans JS ; un seul jeu de commandes après hydratation.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const nativeControls = !hydrated || started || failed;
  const portrait = video.height > video.width;

  const play = async () => {
    const element = player.current;
    if (!element) return;
    setFailed(false);
    setStarted(true);
    element.muted = false;
    element.volume = 1;
    setSoundOn(true);
    // Le focus reste dans le lecteur lorsque le bouton central disparaît.
    element.focus({ preventScroll: true });
    try {
      await element.play();
    } catch {
      setFailed(true);
    }
  };

  const toggleSound = () => {
    const element = player.current;
    if (!element) return;
    const enable = element.muted || element.volume === 0;
    element.muted = !enable;
    if (enable && element.volume === 0) element.volume = 1;
    setSoundOn(enable);
  };

  return (
    <div className={`presentation-video${portrait ? " presentation-video--portrait" : ""}`} data-reveal>
      <div className="presentation-video-frame">
        <video
          ref={player}
          src={assetPath(video.src)}
          poster={assetPath(video.poster)}
          width={video.width}
          height={video.height}
          controls={nativeControls}
          playsInline
          preload="none"
          tabIndex={nativeControls ? 0 : -1}
          aria-label={video.title}
          onPlay={() => { setStarted(true); setFailed(false); }}
          onError={() => setFailed(true)}
          onVolumeChange={event => setSoundOn(!event.currentTarget.muted && event.currentTarget.volume > 0)}
        >
          <a href={assetPath(video.src)}>{video.open}</a>
        </video>
        {hydrated && !started && !failed && (
          <button type="button" className="presentation-video-play" aria-label={video.play} onClick={play}>
            <Icon name="play" />
          </button>
        )}
      </div>
      {started && <div className="presentation-video-controls">
        <button type="button" className="button button-text" onClick={toggleSound}>
          {soundOn ? video.mute : video.unmute}
        </button>
      </div>}
      {failed && <p className="presentation-video-error" role="status">{video.error} <a href={assetPath(video.src)}>{video.open}</a></p>}
    </div>
  );
}
