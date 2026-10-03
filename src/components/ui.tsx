import Link from "next/link";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { temporaryImageLabel, type LocalPhoto } from "@/content/site";
import { assetPath } from "@/lib/assets";

export function Icon({ name, className = "" }: {
  name: "menu" | "close" | "search" | "chevron" | "pause" | "play" | "arrow-down-right";
  className?: string;
}) {
  const paths = {
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    pause: <path d="M8 5v14M16 5v14" />,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    "arrow-down-right": <path d="m4 4 16 16M20 5v15H5" />,
  };
  return (
    <svg className={`icon ${className}`} width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`container ${className}`}>{children}</div>;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "light" | "text";
}) {
  return (
    <Link {...props} className={`button button-${variant} ${className}`}>
      {children}
    </Link>
  );
}

export function SectionHeading({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function PhotoPlaceholder({
  label,
  note,
  className = "",
  photo,
  priority = false,
  sizes = "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 640px",
}: {
  label: string;
  note?: string;
  className?: string;
  photo?: LocalPhoto;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div
      className={`photo-placeholder ${photo ? "has-photo" : ""} ${className}`}
    >
      {photo ? (
        <Image
          src={assetPath(photo.src)}
          alt={photo.alt}
          fill
          sizes={sizes}
          preload={priority}
          className="object-cover"
        />
      ) : (
        <div className="placeholder-content">
          <span>{label}</span>
          {note && <small>{note}</small>}
        </div>
      )}
      {photo?.temporary && (
        <span className="temporary-image-label">{temporaryImageLabel}</span>
      )}
    </div>
  );
}

export function StatCard({
  value,
  unit,
  label,
}: {
  value: string;
  unit?: string;
  label: string;
}) {
  return (
    <div className="stat">
      <p className="stat-value">
        {value}
        {unit && <span> {unit}</span>}
      </p>
      <p className="stat-label">{label}</p>
    </div>
  );
}
