import Image from "next/image";
import type { ReactNode } from "react";
import { clientPhotoSources, type Locale, type LocalPhoto } from "@/content/site";
import { assetPath } from "@/lib/assets";

const photos = {
  about: "gbara-visite",
  mission: "bassia-champ",
  domains: "bassia-maraichage",
  projects: "moussayah-ombrieres",
  partnership: "moussayah-dialogue",
  contact: "hero-gbara-entretien",
  news: "sensibilisation-acteurs-locaux",
  team: "bassia-champ",
  support: "kolaboui-materiels",
  information: "moussayah-pepiniere",
} as const;

export function PageHero({ locale, title, id, theme, photo, breadcrumbs, children }: {
  locale: Locale;
  title: string;
  id: string;
  theme: keyof typeof photos;
  photo?: LocalPhoto;
  breadcrumbs: ReactNode;
  children?: ReactNode;
}) {
  const source = clientPhotoSources[photos[theme]];
  const image = photo ?? { src: source.src, alt: source[locale] };
  return <>
    <div className="interior-breadcrumb">{breadcrumbs}</div>
    <section className={`interior-hero interior-hero--${theme}`} aria-labelledby={id}>
      <Image src={assetPath(image.src)} alt={image.alt} fill preload sizes="(min-width: 1600px) 1480px, 100vw" className="interior-hero-photo" />
      <h1 id={id} data-reveal><span>{title}</span></h1>
      {image.contextLabel && <span className="photo-context-label">{image.contextLabel}</span>}
      {image.temporary && <span className="temporary-image-label">{locale === "fr" ? "Image temporaire" : "Temporary image"}</span>}
    </section>
    {children && <div className="interior-introduction"><div className="container">{children}</div></div>}
  </>;
}
