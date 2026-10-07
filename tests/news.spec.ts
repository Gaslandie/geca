import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getNewsEntries, getPortfolioProjects, newsContent } from "../src/content/site";
import { getSearchDocuments } from "../src/content/search";

for (const locale of ["fr", "en"] as const) {
  test(`archives ${locale} : faits communs, périodes et absence de publication inventée`, async ({ page }) => {
    const entries = getNewsEntries(locale);
    const projects = getPortfolioProjects(locale);
    expect(entries).toHaveLength(9);
    for (const project of projects) {
      const entry = entries.find((item) => item.id === `projet-${project.slug}`)!;
      expect(entry.description).toBe(project.description);
      expect(entry.period).toBe(project.period);
      expect(entry.partner).toBe(project.partner);
      expect(entry.dateTime).toBeUndefined();
      expect(getSearchDocuments(locale).some((doc) => doc.href === `/${locale}/actualites#${entry.id}`)).toBe(true);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}/actualites`);
    await expect(page.locator(".news-card")).toHaveCount(9);
    await expect(page.locator(".news-archive-description").first()).toHaveCSS("text-align", "justify");
    await expect(page.locator(".news-archive-notice")).toHaveText(newsContent[locale].notice);
    await expect(page.locator("time")).toHaveCount(2);
    await expect(page.locator('time[datetime="2026-08-26"]')).toBeVisible();
    await expect(page.locator('time[datetime="2016-12-14"]')).toHaveCount(1);
    await expect(page.locator(".construction-body, .draft-label")).toHaveCount(0);
    for (const link of await page.locator(".news-card a").all()) {
      const href = (await link.getAttribute("href"))!;
      expect((await page.request.get(href)).status()).toBe(200);
    }
    await page.locator("#projet-protemo").scrollIntoViewIfNeeded();
    await expect(page.locator("#projet-protemo .photo-context-label")).toHaveText(locale === "fr" ? "Illustration du thème" : "Thematic illustration");
  });
}

for (const width of [320, 1440]) {
  test(`archives ${width}px : lecture, clavier et texte agrandi`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr/actualites");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.locator("#projet-kounounkan a").focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/fr/projets#projet-kounounkan");
    await page.goto("/fr/actualites");
    await page.addStyleTag({ content: ":root { font-size: 200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/geca-news-${width}.png` });
  });
}

test("accueil : vraies références 2025-2026 et archives disponibles sans JavaScript", async ({ browser, page }) => {
  await page.goto("/fr");
  await expect(page.locator(".news .draft-label")).toHaveText(["2025-2026", "2025-2026"]);
  await page.locator(".news-card h3 a").first().click();
  await expect(page).toHaveURL("/fr/actualites#projet-kounounkan");
  await expect(page.locator("#projet-kounounkan")).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto("http://127.0.0.1:3000/en/actualites");
  await expect(staticPage.locator(".news-card")).toHaveCount(9);
  await expect(staticPage.locator("#nouvelle-denomination")).toContainText("26 August 2026");
  await context.close();
});
