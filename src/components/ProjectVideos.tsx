"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { projectVideoContent, type Locale } from "@/content/site";
import { assetPath } from "@/lib/assets";
import { Container, Icon } from "./ui";

export function ProjectVideos({ locale }: { locale: Locale }) {
  const text = projectVideoContent[locale];
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const player = useRef<HTMLVideoElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const media = player.current;
    return () => { media?.pause(); media?.removeAttribute("src"); media?.load(); };
  }, []);

  const stop = () => {
    const media = player.current;
    if (media) {
      media.pause();
      media.removeAttribute("src");
      media.load();
    }
    opener.current?.focus({ preventScroll: true });
  };

  const open = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const modal = dialog.current;
    const media = player.current;
    if (!modal?.showModal || !media) return;
    event.preventDefault();
    opener.current = event.currentTarget;
    setSelected(index);
    setFailed(false);
    modal.showModal();
    // Source chargée uniquement sur demande ; play reste dans le geste utilisateur.
    media.src = assetPath(text.items[index].src);
    media.poster = assetPath(text.items[index].poster);
    media.muted = false;
    media.volume = 1;
    void media.play().catch(() => { if (modal.open) setFailed(true); });
  };

  return (
    <section id="videos-projets" className="section project-videos" aria-label={text.title}>
      <Container>
        <div className="project-video-panels" data-reveal>
          {text.items.map((item, index) => (
            <a key={item.src} href={assetPath(item.src)}
              className={`project-video-panel${active === index ? " is-active" : ""}`}
              style={{ backgroundImage: `url("${assetPath(item.poster)}")` }}
              aria-label={`${text.play} ${index + 1}`}
              onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)}
              onClick={event => open(event, index)}>
              <span className="project-video-play" aria-hidden="true"><Icon name="play" /></span>
              <span className="project-video-number" aria-hidden="true">0{index + 1}</span>
            </a>
          ))}
        </div>
      </Container>
      <dialog ref={dialog} className="project-video-dialog" aria-labelledby="project-video-title"
        onClose={stop} onCancel={() => player.current?.pause()}
        onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="project-video-modal-content">
          <div className="project-video-modal-header">
            <h2 id="project-video-title">{text.video} {selected + 1}</h2>
            <button type="button" className="project-video-close" aria-label={text.close} onClick={() => dialog.current?.close()}><Icon name="close" /></button>
          </div>
          <video ref={player} controls playsInline preload="none" width={text.items[selected].width} height={text.items[selected].height}
            aria-label={`${text.video} ${selected + 1}`} onError={() => setFailed(true)} onPlay={() => setFailed(false)} />
          {failed && <p role="status">{text.error}</p>}
        </div>
      </dialog>
    </section>
  );
}
