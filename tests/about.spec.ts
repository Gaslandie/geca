import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { aboutContent } from "../src/content/site";

for (const width of [320, 375, 768, 1440, 1920]) {
  test(`à propos ${width}px : lecture, cadre commun et accessibilité`, async ({ page }) => {
    const errors: string[] = [];
    const external: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1:3000")) external.push(request.url());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/fr/a-propos");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(aboutContent.fr.title);
    await expect(page.locator("main > section")).toHaveCount(6);
    await expect(page.locator(".about-domain-grid > li")).toHaveCount(6);
    await expect(page.locator("main")).toContainText("RENASCEDD");
    const frame = (await page.locator(".header-inner").boundingBox())!;
    for (const section of await page.locator("main > section").all()) {
      const box = (await section.boundingBox())!;
      expect(box.x).toBeCloseTo(frame.x, 0);
      expect(box.width).toBeCloseTo(frame.width, 0);
    }
    for (const photo of await page.locator("main .photo-placeholder").all()) {
      await photo.scrollIntoViewIfNeeded();
      await expect(photo.getByText("Image temporaire", { exact: true })).toBeVisible();
      await expect.poll(() => photo.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    }
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/about-${width}.png`, fullPage: true });
    await page.addStyleTag({ content: ":root { font-size: 200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(".about-closing").getByRole("link", { name: aboutContent.fr.closing.contact })).toBeVisible();
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test("à propos : arrivée depuis l'accueil, histoire au clavier, langue et contact", async ({ page, request }) => {
  await page.goto("/fr");
  await page.getByRole("link", { name: "À propos de GECA", exact: true }).click();
  await expect(page).toHaveURL("/fr/a-propos");
  const story = page.getByRole("link", { name: aboutContent.fr.explore });
  await story.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/fr\/a-propos#notre-histoire$/);
  await expect(page.locator("#notre-histoire")).toBeInViewport();
  await page.locator(".menu-toggle").click();
  await page.locator("#main-navigation .language-switch").getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL("/en/a-propos");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(aboutContent.en.title);
  await expect(page.locator("meta[name='description']")).toHaveAttribute("content", aboutContent.en.metadata);
  const links = await page.locator("main a[href^='/']").evaluateAll((elements) => [...new Set(elements.map((element) => element.getAttribute("href")!))]);
  for (const link of links) expect((await request.get(link)).status()).toBe(200);
  await page.getByRole("link", { name: aboutContent.en.closing.contact }).click();
  await expect(page).toHaveURL("/en/contact");
});

test("à propos : contenu et liens disponibles sans JavaScript en FR et EN", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const locale of ["fr", "en"] as const) {
    await page.goto(`http://127.0.0.1:3000/${locale}/a-propos`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(aboutContent[locale].title);
    await expect(page.locator(".about-year")).toHaveText("2016");
    await page.getByRole("link", { name: aboutContent[locale].closing.contact }).click();
    await expect(page).toHaveURL(`/${locale}/contact`);
  }
  await context.close();
});
