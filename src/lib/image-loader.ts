"use client";

import type { ImageLoaderProps } from "next/image";
import variants from "@/content/image-variants.json";
import { assetPath } from "./assets";

/** Liste fermée de fichiers locaux préparés : aucune URL externe ou chemin libre. */
export default function localImageLoader({ src, width }: ImageLoaderProps): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const source = basePath && src.startsWith(`${basePath}/`) ? src.slice(basePath.length) : src;
  if (!Object.hasOwn(variants, source) || !Number.isFinite(width) || width <= 0) {
    throw new Error("Image locale inconnue ou largeur invalide.");
  }
  const available = variants[source as keyof typeof variants];
  const variant = available.find((image) => image.width >= width) ?? available[available.length - 1];
  return assetPath(variant.src);
}
