import { expect, test } from "@playwright/test";
import { locales, routes } from "../src/content/site";

for (const locale of locales) {
  for (const width of [375, 1440]) {
    test(`introductions ${locale} ${width}px : modèle commun sur toutes les pages internes`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      for (const route of routes) {
        await page.goto(`/${locale}/${route.path}`);
        const introduction = page.locator("main .page-intro-copy");
        await expect(introduction).toHaveCount(1);
        await expect(introduction).toHaveCSS("text-align", "justify");
        await expect(introduction).toHaveCSS("text-align-last", "start");
        expect(await introduction.evaluate((element) => getComputedStyle(element, "::before").width)).toBe("4px");
        const heading = await page.locator("main h1").boundingBox();
        const paragraph = await introduction.boundingBox();
        expect(paragraph!.y, route.path).toBeGreaterThan(heading!.y + heading!.height);
        expect(paragraph!.width, route.path).toBeLessThanOrEqual(900);
        await page.addStyleTag({ content: "html { font-size: 200%; }" });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route.path).toBe(true);
      }
      await page.goto(`/${locale}`);
      await expect(page.locator(".page-intro-copy")).toHaveCount(0);
    });
  }
}

// Contrat visuel commun : les nouvelles pages doivent réutiliser ces mêmes règles.
for (const width of [375, 1440]) {
  test(`règles communes ${width}px : titres centrés, cartes et espaces stables`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const path of ["/fr", "/fr/equipe", "/en/equipe", "/fr/a-propos", "/fr/projets", "/fr/a-propos/domaines-intervention", "/fr/a-propos/mission-vision-valeurs", "/en/a-propos/mission-vision-valeurs", "/fr/contact", "/fr/actualites", "/fr/devenir-partenaire", "/en/devenir-partenaire", "/en/projets", "/en/contact"]) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const headings = await page.locator("main h1, main h2, main h3, main .eyebrow, main .card-subtitle, main .contact-form-title, main .contact-detail-label, main .portfolio-objective-label").evaluateAll((elements) =>
        elements.map((element) => ({ text: element.textContent, align: getComputedStyle(element).textAlign, hero: !!element.closest(".hero-content") })),
      );
      expect(headings.length, path).toBeGreaterThan(0);
      for (const heading of headings) expect(heading.align, `${path}: ${heading.text}`).toBe(heading.hero ? "left" : "center");
      const paddings = await page.locator("main .card-content").evaluateAll((elements) => elements.map((element) => {
        const style = getComputedStyle(element);
        return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
      }));
      const allPaddingValues = new Set(paddings.flat());
      if (paddings.length) {
        expect(allPaddingValues.size, path).toBe(1);
        expect(parseFloat(paddings[0][0])).toBeGreaterThanOrEqual(20);
        expect(parseFloat(paddings[0][0])).toBeLessThanOrEqual(32);
        const card = page.locator("main .card-content").first();
        await card.scrollIntoViewIfNeeded();
        await card.evaluate(async (element) => {
          await Promise.allSettled(element.getAnimations({ subtree: true }).map((animation) => animation.finished));
        });
        const dimensions = () => card.evaluate((element) => {
          const style = getComputedStyle(element);
          return [element.clientWidth, element.clientHeight, style.padding, style.margin, style.borderWidth];
        });
        const before = await dimensions();
        await card.hover();
        expect(await dimensions(), `${path}: survol`).toEqual(before);
      }
      const spacing = await page.locator("main > section").evaluateAll((sections) => sections.slice(1).map((section, index) => {
        const previous = sections[index].getBoundingClientRect();
        return { actual: section.getBoundingClientRect().top - previous.bottom, margin: parseFloat(getComputedStyle(section).marginTop) };
      }));
      if (spacing.length) {
        expect(new Set(spacing.map((gap) => gap.margin)).size, path).toBe(1);
        for (const gap of spacing) expect(gap.actual, path).toBeCloseTo(gap.margin, 0);
      }
      await page.addStyleTag({ content: "html { font-size: 200%; }" });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), path).toBe(true);
    }
  });
}
