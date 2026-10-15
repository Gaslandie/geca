"use client";

import { useRef, useState } from "react";
import type { getHomeContent } from "@/content/site";
import { assetPath } from "@/lib/assets";
import { Icon } from "./ui";

export function PresentationVideo({ video }: { video: ReturnType<typeof getHomeContent>["about"]["video"] }) {
  const player = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const play = async () => {
    const element = player.current;
    if (!element) return;
    setFailed(false);
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
    <div className="presentation-video" data-reveal>
      <div className="presentation-video-frame">
        <video
          ref={player}
          src={assetPath(video.src)}
          poster={assetPath(video.poster)}
          width={video.width}
          height={video.height}
          controls
          playsInline
          preload="none"
          tabIndex={0}
          aria-label={video.title}
          onPlay={() => { setStarted(true); setFailed(false); }}
          onError={() => setFailed(true)}
          onVolumeChange={event => setSoundOn(!event.currentTarget.muted && event.currentTarget.volume > 0)}
        >
          <a href={assetPath(video.src)}>{video.open}</a>
        </video>
        {!started && !failed && (
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
      <noscript><style>{`.presentation-video-play { display: none; }`}</style></noscript>
    </div>
  );
}
