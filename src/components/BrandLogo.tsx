import Image from "next/image";
import type { Locale } from "@/content/site";
import { assetPath } from "@/lib/assets";

export function BrandLogo({ preload = false, darkBackground = false, locale = "fr", sizes = "(max-width: 359px) 136px, (max-width: 479px) 144px, (max-width: 1199px) 164px, 192px" }: { preload?: boolean; darkBackground?: boolean; locale?: Locale; sizes?: string }) {
  return (
    <Image
      className="brand-logo"
      src={assetPath(darkBackground
        ? "/images/brand/global-ecoaction-logo-white-slogan.png"
        : "/images/brand/global-ecoaction-logo-transparent.png")}
      alt={locale === "fr" ? "Global EcoAction — Agir pour un avenir durable" : "Global EcoAction — Acting for a sustainable future"}
      width={1774}
      height={887}
      sizes={sizes}
      preload={preload}
    />
  );
}
