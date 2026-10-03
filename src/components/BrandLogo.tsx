import Image from "next/image";
import { assetPath } from "@/lib/assets";

export function BrandLogo({ preload = false }: { preload?: boolean }) {
  return (
    <Image
      className="brand-logo"
      src={assetPath("/images/brand/global-ecoaction-logo.png")}
      alt="Global EcoAction — Agir pour un avenir durable"
      width={1774}
      height={887}
      sizes="(max-width: 359px) 136px, (max-width: 479px) 144px, (max-width: 1199px) 164px, 192px"
      preload={preload}
    />
  );
}
