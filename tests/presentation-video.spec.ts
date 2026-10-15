import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("vidéo accueil : placement FR/EN, petit écran, clavier et lecture réelle", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const videoRequests: string[] = [];
  page.on("request", request => { if (request.url().endsWith("geca-presentation-20261015.mp4")) videoRequests.push(request.url()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const locale of ["fr", "en"]) {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/${locale}`);
      const frame = page.locator(".presentation-video");
      await frame.scrollIntoViewIfNeeded();
      await expect(frame.getByRole("button")).toHaveAccessibleName(locale === "fr" ? "Lire la vidéo de présentation" : "Play the presentation video");
      const copy = await page.locator(".about-content").boundingBox();
      const box = await frame.boundingBox();
      const actions = await page.locator(".about-video-actions").boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(copy!.y + copy!.height);
      expect(actions!.y).toBeGreaterThanOrEqual(box!.y + box!.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(videoRequests).toEqual([]);
      await page.addStyleTag({ content: ":root { font-size: 200%; }" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await page.goto("/fr");
  const video = page.locator(".presentation-video video");
  const button = page.getByRole("button", { name: "Lire la vidéo de présentation" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused && element.currentTime > 0), { timeout: 15000 }).toBe(true);
  await expect(video).toBeFocused();
  expect(await video.evaluate((element: HTMLVideoElement) => element.controls && !element.muted && !element.autoplay)).toBe(true);
  const sound = page.locator(".presentation-video-controls button");
  await expect(sound).toHaveText("Couper le son");
  await sound.click();
  expect(await video.evaluate((element: HTMLVideoElement) => element.muted)).toBe(true);
  await expect(sound).toHaveText("Activer le son");
  await video.evaluate((element: HTMLVideoElement) => { element.volume = 0; });
  await sound.click();
  expect(await video.evaluate((element: HTMLVideoElement) => !element.muted && element.volume === 1)).toBe(true);
  await video.evaluate((element: HTMLVideoElement) => element.pause());
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await video.evaluate((element: HTMLVideoElement) => { element.currentTime = 120; });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.seeking && element.currentTime >= 120)).toBe(true);
  expect((await new AxeBuilder({ page }).include(".about.section").analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test("vidéo accueil : fichier indisponible, repli lisible", async ({ page }) => {
  await page.route("**/videos/geca-presentation-20261015.mp4", route => route.abort());
  await page.goto("/fr");
  await page.getByRole("button", { name: "Lire la vidéo de présentation" }).click();
  await expect(page.locator(".presentation-video").getByRole("status")).toContainText("La vidéo n’a pas pu démarrer.");
  await expect(page.locator(".presentation-video").getByRole("link", { name: "Ouvrir la vidéo" })).toHaveAttribute("href", /\/videos\/geca-presentation-20261015\.mp4$/);
});

test("vidéo accueil : commandes utilisables sans JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/fr`);
  const video = page.locator(".presentation-video video");
  await expect(video).toHaveAttribute("controls", "");
  await expect(video).toHaveAttribute("preload", "none");
  await expect(page.locator(".presentation-video-play")).toBeHidden();
  await context.close();
});
