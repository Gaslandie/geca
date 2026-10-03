import Link from "next/link";
import Image from "next/image";
import type { ComponentProps, ReactNode } from "react";
import { temporaryImageLabel, type LocalPhoto } from "@/content/site";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`container ${className}`}>{children}</div>;
}

export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const paths: Record<string, ReactNode> = {
    arrow: (
      <>
        <path d="M4 12h15M13 5l7 7-7 7" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    pin: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    tree: (
      <>
        <path d="m12 2-6 8h3l-5 7h16l-5-7h3L12 2ZM12 17v5" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    sprout: (
      <>
        <path d="M12 22v-9M12 13C5 13 3 8 3 3c7 0 9 4 9 10ZM12 16c7 0 9-5 9-10-7 0-9 4-9 10Z" />
      </>
    ),
    water: (
      <>
        <path d="M12 2C9 7 5 10 5 14a7 7 0 0 0 14 0c0-4-4-7-7-12Z" />
        <path d="M9 14a3 3 0 0 0 3 3" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1ZM12 5v15" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M2 21v-3a7 7 0 0 1 14 0v3M16 4a3 3 0 0 1 0 6M18 14c3 0 4 2 4 5v2" />
      </>
    ),
    communities: (
      <>
        <rect x="9" y="3" width="6" height="7" rx="3" />
        <rect x="2" y="5" width="4" height="5" rx="2" />
        <rect x="18" y="5" width="4" height="5" rx="2" />
        <path d="M6 20v-2a6 6 0 0 1 12 0v2H6ZM6.5 12A5 5 0 0 0 1 17v1h5m11.5-6A5 5 0 0 1 23 17v1h-5" />
      </>
    ),
    restoration: (
      <>
        <path d="M12 20v-8M12 15C6 15 4 11 4 5c5 0 8 4 8 10ZM12 12c0-6 4-9 9-9 0 6-3 10-9 11M8 9l4 6m5-8-5 7M5 22c1-3 3-3 7-3s6 0 7 3H5Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M7 2v5m10-5v5M3 9h18" />
        {[7, 12, 17].flatMap((x) => [13, 17].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.8" fill="currentColor" stroke="none" />
        )))}
      </>
    ),
    leaf: (
      <>
        <path d="M20 3C10 2 4 7 4 13a6 6 0 0 0 6 6c6 0 10-6 10-16Z" />
        <path d="M3 21 16 8M8 16v-5m0 5h5" />
      </>
    ),
    graduation: (
      <>
        <path d="m2 8 10-5 10 5-10 5L2 8ZM6 10v7l6 3 6-3v-7M22 8v8" />
      </>
    ),
    document: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M9 6h6M9 10h6M9 14h6M9 18h3" />
      </>
    ),
    frame: (
      <>
        <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  };
  return (
    <svg
      className={`icon ${className}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.arrow}
    </svg>
  );
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
      <Icon name="arrow" />
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
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          preload={priority}
          className="object-cover"
        />
      ) : (
        <div className="placeholder-content">
          <Icon name="frame" />
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
  icon,
}: {
  value: string;
  unit?: string;
  label: string;
  icon: string;
}) {
  return (
    <div className="stat">
      <Icon name={icon} className="stat-icon" />
      <div>
        <p className="stat-value">
          {value}
          {unit && <span>{unit}</span>}
        </p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}
