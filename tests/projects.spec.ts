import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getPortfolioProjects, homeContent, portfolioContent, projects } from "../src/content/site";

for (const width of [320, 375, 768, 1440, 1920]) {
  test(`catalogue ${width}px : projets lisibles, photos et accessibilité`, async ({ page }) => {
    const errors: string[] = [];
    const external: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1:3000")) external.push(request.url());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/fr/projets");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(portfolioContent.fr.title);
    await expect(page.locator(".portfolio-project")).toHaveCount(7);
    await expect(page.locator(".portfolio-notice")).toHaveText(portfolioContent.fr.notice);
    const frame = (await page.locator(".header-inner").boundingBox())!;
    for (const section of await page.locator("main > section").all()) {
      const box = (await section.boundingBox())!;
      expect(box.x).toBeCloseTo(frame.x, 0);
      expect(box.width).toBeCloseTo(frame.width, 0);
    }
    for (const [index, card] of (await page.locator(".portfolio-project").all()).entries()) {
      await card.scrollIntoViewIfNeeded();
      await expect(card.getByText("Image temporaire", { exact: true })).toBeVisible();
      await expect.poll(() => card.locator("img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
      await expect(card.locator("dl > div")).toHaveCount(3);
      const photo = (await card.locator(".portfolio-photo").boundingBox())!;
      const copy = (await card.locator(".portfolio-project-body").boundingBox())!;
      if (width < 768) {
        expect(copy.y).toBeGreaterThanOrEqual(photo.y + photo.height - 1);
      } else {
        expect(copy.y).toBeCloseTo(photo.y, 0);
        expect(index % 2 === 0 ? photo.x < copy.x : copy.x < photo.x).toBe(true);
      }
    }
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `test-results/projects-${width}.png`, fullPage: true });
    await page.addStyleTag({ content: ":root { font-size: 200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(".portfolio-closing").getByRole("link", { name: portfolioContent.fr.contact, exact: true })).toBeVisible();
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
  });
}

test("page unique : menu direct, accueil vers une ancre, langue et contact", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await page.locator(".menu-toggle").click();
  const navigation = page.getByRole("navigation", { name: "Navigation principale" });
  await expect(navigation.getByRole("button", { name: "Projets & programmes", exact: true })).toHaveCount(0);
  await navigation.getByRole("link", { name: "Projets & programmes", exact: true }).click();
  await expect(page).toHaveURL("/fr/projets");
  await expect(page.locator(".portfolio-project")).toHaveCount(7);
  await page.goto("/fr");
  const first = projects[0];
  const cardLink = page.getByRole("link", { name: `${homeContent.projects.view} : ${first.title}`, exact: true });
  await cardLink.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(`/fr/projets#projet-${first.slug}`);
  await expect(page.locator(`#projet-${first.slug}`)).toBeInViewport();
  await page.locator(".menu-toggle").click();
  await page.locator("#main-navigation .language-switch").getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL("/en/projets");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(portfolioContent.en.title);
  await expect(page.locator(".portfolio-project")).toHaveCount(7);
  await page.locator(".portfolio-closing").getByRole("link", { name: portfolioContent.en.contact, exact: true }).click();
  await expect(page).toHaveURL("/en/contact");
});

for (const locale of ["fr", "en"] as const) {
  test(`page unique ${locale} sans JavaScript : données de l’accueil et sous-pages retirées`, async ({ browser, request }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:3000/${locale}/projets`);
    await expect(page.locator(".portfolio-project")).toHaveCount(7);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(portfolioContent[locale].title);
    for (const project of getPortfolioProjects(locale)) {
      const card = page.locator(`#projet-${project.slug}`);
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(project.title);
      await expect(card.locator(".portfolio-description")).toHaveText(project.description);
      await expect(card.locator("dd")).toHaveText([project.zone, project.period, project.partner]);
      if (project.status) await expect(card.locator(".portfolio-status")).toHaveText(portfolioContent[locale].statuses[project.status]);
      else await expect(card.locator(".portfolio-status")).toHaveCount(0);
    }
    if (locale === "fr") {
      await expect(page.locator(".portfolio-intro .section-description")).toHaveText(homeContent.projects.description);
      await expect(page.locator(".portfolio-closing .section-description")).toHaveText(homeContent.cta.partnerText);
    }
    await expect(page.locator(`a[href^='/${locale}/projets/']`)).toHaveCount(0);
    const links = await page.locator("main a[href^='/']").evaluateAll((elements) => [...new Set(elements.map((element) => element.getAttribute("href")!))]);
    for (const link of links) expect((await request.get(link)).status()).toBe(200);
    for (const path of ["en-cours", "realises", ...projects.map((project) => project.slug), "inconnu", "en-cours/inconnu", "realises/inconnu"]) {
      expect((await request.get(`/${locale}/projets/${path}`)).status(), path).toBe(404);
    }
    await page.locator(".portfolio-closing").getByRole("link", { name: portfolioContent[locale].contact, exact: true }).click();
    await expect(page).toHaveURL(`/${locale}/contact`);
    await context.close();
  });
}
