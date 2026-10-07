import { expect, test } from "@playwright/test";
import { stat } from "node:fs/promises";
import localImageLoader from "../src/lib/image-loader";
import variants from "../src/content/image-variants.json";

test("médias : budgets de poids, variantes locales et sources inconnues refusées", async () => {
  for (const images of Object.values(variants)) {
    const mobile = images.find((image) => image.width >= 640) ?? images.at(-1)!;
    expect((await stat(`public${mobile.src}`)).size, mobile.src).toBeLessThan(120_000);
    for (const image of images) expect(image.src).toMatch(/^\/images\/optimized\/[a-z0-9-]+\.webp$/);
  }
  expect((await stat("public/videos/geca-forest.mp4")).size).toBeLessThan(1_500_000);
  for (const src of ["https://example.com/photo.jpg", "http://127.0.0.1/private", "/images/../secret", "/.env", "/images/inconnue.jpg"]) {
    expect(() => localImageLoader({ src, width: 640 })).toThrow();
  }
  for (const width of [0, -1, NaN, Infinity]) {
    expect(() => localImageLoader({ src: "/images/temporary/forest.jpg", width })).toThrow();
  }
});

test("export : taille selon l’écran, photos réutilisées, aucun original téléchargé", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const selected: string[] = [];
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/geca/fr/a-propos/");
    const image = page.locator(".about-landscape img");
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    selected.push(await image.evaluate((img: HTMLImageElement) => img.currentSrc));
  }
  expect(selected[0]).not.toBe(selected[1]);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/geca/fr/");
  await expect(page.locator(".impact-photo")).toHaveCount(0);
  const sharedPhoto = page.locator(".news-card img").first();
  await sharedPhoto.scrollIntoViewIfNeeded();
  await expect.poll(() => sharedPhoto.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const firstSrc = await sharedPhoto.evaluate((img: HTMLImageElement) => img.currentSrc);
  await page.goto("/geca/fr/actualites/projet-kounounkan/");
  const articlePhoto = page.locator(".news-article-photo img");
  await articlePhoto.scrollIntoViewIfNeeded();
  await expect.poll(() => articlePhoto.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await articlePhoto.evaluate((img: HTMLImageElement) => img.currentSrc)).toBe(firstSrc);
  expect(requests.every((url) => url.startsWith("http://127.0.0.1:3100/"))).toBe(true);
  expect(requests.filter((url) => /\.(jpg|png)(\?|$)/.test(url))).toEqual([]);
  for (const path of ["assets/source-images/images/temporary/forest.jpg", "assets/source-images/images/hero/plantation.png", "images/hero/plantation.png", "assets/source-videos/geca-forest.mp4", "images/temporary/forest.jpg"]) {
    expect((await request.get(`/geca/${path}`)).status()).toBe(404);
  }
});
