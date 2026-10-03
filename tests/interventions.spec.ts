import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getInterventionAreas, interventionContent } from "../src/content/site";

const path = "/a-propos/domaines-intervention";
for (const width of [320, 375, 768, 1440, 1920]) {
  test(`domaines ${width}px : lecture, images, marges et accessibilité`, async ({ page }) => {
    const errors: string[] = [];
    const external: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1:3000")) external.push(request.url());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/fr${path}`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(interventionContent.fr.title);
    await expect(page.locator(".intervention-area")).toHaveCount(6);
    const frame = (await page.locator(".header-inner").boundingBox())!;
    const sections = await page.locator("main > section").all();
    const gap = await page.locator("main > section").nth(1).evaluate((element) => parseFloat(getComputedStyle(element).marginBlockStart));
    let previousBottom: number | undefined;
    for (const section of sections) {
      const box = (await section.boundingBox())!;
      expect(box.x).toBeCloseTo(frame.x, 0);
      expect(box.width).toBeCloseTo(frame.width, 0);
      if (previousBottom !== undefined) expect(box.y - previousBottom).toBeCloseTo(gap, 0);
      previousBottom = box.y + box.height;
    }
    expect((await page.locator("footer").boundingBox())!.y - previousBottom!).toBeCloseTo(gap, 0);
    for (const area of getInterventionAreas("fr")) {
      const photo = page.locator(`#${area.id} .intervention-photo`);
      await photo.scrollIntoViewIfNeeded();
      await expect(photo.locator(".temporary-image-label")).toHaveCount(0);
      expect(await photo.locator("img").evaluate((image: HTMLImageElement) => new URL(image.src).searchParams.get("url"))).toBe(`/images/domaines/${area.id}.jpg`);
      await expect.poll(() => photo.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/interventions-${width}.png`, fullPage: true });
    await page.addStyleTag({ content: ":root { font-size: 200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test("domaines : sommaire au clavier, retour, accueil, langue et destinations", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/fr${path}`);
  for (const area of getInterventionAreas("fr")) {
    const link = page.locator(".intervention-nav").getByRole("link", { name: area.title, exact: true });
    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(`/fr${path}#${area.id}`);
    await expect(page.locator(`#${area.id}`)).toBeInViewport();
    await page.locator(`#${area.id}`).getByRole("link", { name: interventionContent.fr.back }).click();
    await expect(page.locator(".intervention-nav")).toBeInViewport();
  }
  await page.goto("/fr");
  await page.locator(".domain-link").nth(2).click();
  await expect(page).toHaveURL(`/fr${path}#agroecologie`);
  await expect(page.locator("#agroecologie")).toBeInViewport();
  await page.locator(".menu-toggle").click();
  await page.locator("#main-navigation .language-switch").getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(`/en${path}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(interventionContent.en.title);
  await expect(page.locator("meta[name='description']")).toHaveAttribute("content", interventionContent.en.metadata);
  const links = await page.locator("main a[href^='/']").evaluateAll((elements) => [...new Set(elements.map((element) => element.getAttribute("href")!))]);
  for (const link of links) expect((await request.get(link)).status()).toBe(200);
  await page.getByRole("link", { name: interventionContent.en.closing.projects }).click();
  await expect(page).toHaveURL("/en/projets");
});

test("domaines : contenu et navigation sans JavaScript, FR et EN", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const locale of ["fr", "en"] as const) {
    await page.goto(`http://127.0.0.1:3000/${locale}${path}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(interventionContent[locale].title);
    for (const domain of getInterventionAreas(locale)) {
      const photo = page.locator(`#${domain.id} .intervention-photo`);
      await photo.scrollIntoViewIfNeeded();
      await expect(photo.locator(".temporary-image-label")).toHaveCount(0);
      await expect(photo.locator("img")).toHaveAttribute("alt", domain.photo.alt);
      expect(await photo.locator("img").evaluate((image: HTMLImageElement) => new URL(image.src).searchParams.get("url"))).toBe(`/images/domaines/${domain.id}.jpg`);
      await expect.poll(() => photo.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
    const area = getInterventionAreas(locale)[5];
    await page.locator(".intervention-nav").getByRole("link", { name: area.title, exact: true }).click();
    await expect(page.locator(`#${area.id}`)).toBeInViewport();
    await page.getByRole("link", { name: interventionContent[locale].closing.contact }).click();
    await expect(page).toHaveURL(`/${locale}/contact`);
  }
  await context.close();
});
