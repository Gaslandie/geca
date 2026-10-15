import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("projets : quatre panneaux FR/EN, placement, mobile et absence de préchargement", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (/geca-projets.*\.mp4/.test(request.url())) requests.push(request.url()); });
  for (const locale of ["fr", "en"]) {
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/${locale}/projets`);
      const panels = page.locator(".project-video-panel");
      await expect(panels).toHaveCount(4);
      await expect(panels.first()).toHaveAccessibleName(locale === "fr" ? "Lire la vidéo 1" : "Play video 1");
      expect(await page.locator("#videos-projets").evaluate(section => section.previousElementSibling?.classList.contains("interior-introduction") && section.previousElementSibling?.previousElementSibling?.classList.contains("interior-hero") && section.nextElementSibling?.id === "liste-projets")).toBe(true);
      await page.locator("#videos-projets").scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 1440) {
        await panels.nth(2).hover();
        await expect.poll(async () => (await panels.nth(2).boundingBox())!.width / (await panels.first().boundingBox())!.width).toBeGreaterThan(4);
      }
      await page.addStyleTag({ content: ":root { font-size: 200%; }" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  expect(requests).toEqual([]);
});

test("projets : les quatre vidéos jouent, clavier, son, fermeture et focus", async ({ page }) => {
  await page.goto("/fr/projets");
  const panels = page.locator(".project-video-panel");
  const dialog = page.locator(".project-video-dialog");
  const video = dialog.locator("video");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (let index = 0; index < 4; index++) {
    if (index === 3) await page.setViewportSize({ width: 375, height: 812 });
    await panels.nth(index).focus();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeVisible();
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused && element.currentTime > 0), { timeout: 15000 }).toBe(true);
    expect(await video.evaluate((element: HTMLVideoElement) => !element.muted && element.volume === 1 && element.controls)).toBe(true);
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await expect(video).toHaveAttribute("src", new RegExp(`geca-projets-20261015-${index + 1}\\.mp4$`));
    if (index === 0) {
      expect((await new AxeBuilder({ page }).include(".project-video-dialog").analyze()).violations).toEqual([]);
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
    }
    if (index % 2) await dialog.getByRole("button", { name: "Fermer la vidéo" }).click();
    else await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(panels.nth(index)).toBeFocused();
    await expect(video).not.toHaveAttribute("src");
    expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("projets : média absent, repli et mouvement réduit", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/videos/geca-projets-*.mp4", route => route.abort());
  await page.goto("/fr/projets");
  const panel = page.locator(".project-video-panel").first();
  expect(await panel.evaluate(element => getComputedStyle(element).transitionDuration)).toBe("0s");
  await panel.click();
  await expect(page.locator(".project-video-dialog").getByRole("status")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ouvrir la vidéo directement" })).toHaveAttribute("href", /geca-projets-20261015-1\.mp4$/);
});

test("projets : quatre vidéos accessibles sans JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/fr/projets`);
  const panels = page.locator(".project-video-panel");
  for (let i = 0; i < 4; i++) {
    await expect(panels.nth(i)).toHaveAttribute("href", new RegExp(`geca-projets-20261015-${i + 1}\\.mp4$`));
    await expect(panels.nth(i)).toBeVisible();
  }
  await context.close();
});
