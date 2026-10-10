import Image from "next/image";
import type { Locale } from "@/content/site";
import { assetPath } from "@/lib/assets";

export function BrandLogo({ preload = false, locale = "fr", sizes = "(max-width: 359px) 136px, (max-width: 479px) 144px, (max-width: 1199px) 164px, 192px" }: { preload?: boolean; locale?: Locale; sizes?: string }) {
  return (
    <Image
      className="brand-logo"
      src={assetPath("/images/brand/global-ecoaction-logo-client-transparent-20261010.png")}
      alt={locale === "fr" ? "Global EcoAction — Agir pour un avenir durable" : "Global EcoAction — Acting for a sustainable future"}
      width={1600}
      height={666}
      sizes={sizes}
      preload={preload}
    />
  );
}
