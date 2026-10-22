import type { PublicationVideoData, Locale } from "@/content/site";
import { assetPath } from "@/lib/assets";

export function PublicationVideo({ video, title, locale }: { video?: PublicationVideoData; title: string; locale: Locale }) {
  if (!video) return null;
  return <figure className="publication-video" data-reveal>
    <video controls playsInline preload="none" width={video.width} height={video.height} aria-label={`${locale === "fr" ? "Vidéo" : "Video"} : ${title}`}>
      <source src={assetPath(video.src)} type="video/mp4" />
      <a href={assetPath(video.src)}>{locale === "fr" ? "Ouvrir la vidéo" : "Open video"}</a>
    </video>
  </figure>;
}
