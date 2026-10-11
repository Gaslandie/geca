import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const locale of ["fr", "en"]) {
  for (const width of [375, 1440]) {
    test(`clavier ${locale} ${width}px : évitement, menu, retour et recherche`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${locale}`);
      await page.keyboard.press("Tab");
      await expect(page.locator(".skip-link")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("main")).toBeFocused();
      await page.goto(`/${locale}/contact`);
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(page.locator(".site-header .brand")).toBeFocused();
      if (width < 1280) {
        for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
        await expect(page.locator(".menu-toggle")).toBeFocused();
        await page.keyboard.press("Enter");
      }
      await page.keyboard.press("Tab");
      await expect(page.locator(".main-nav > ul > li > a").first()).toBeFocused();
      if (width < 1280) {
        await page.keyboard.press("Shift+Tab");
        await expect(page.locator(".menu-toggle")).toBeFocused();
        await page.keyboard.press("Tab");
      }
      await page.keyboard.press("Tab");
      await expect(page.locator(".nav-trigger")).toBeFocused();
      await page.keyboard.press("Space");
      await page.keyboard.press("Tab");
      await expect(page.locator(".nav-dropdown a").first()).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(page.locator(".nav-trigger")).toBeFocused();
      if (width < 1280) {
        await page.keyboard.press("Escape");
        await expect(page.locator(".menu-toggle")).toBeFocused();
        await page.keyboard.press("Shift+Tab");
      } else {
        for (let i = 0; i < 7; i++) await page.keyboard.press("Tab");
      }
      await expect(page.locator(".search-link")).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#site-search-input")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(page.locator(".search-close")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(page.locator(".search-results a").last()).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.locator(".search-close")).toBeFocused();
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(page.locator(".search-link")).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });
  }

  test(`pauses ${locale} : arrêt persistant, reprise et préférences`, async ({ page }) => {
    await page.clock.install();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/${locale}`);
    const hero = page.locator(".hero-motion-toggle");
    await hero.focus();
    await page.keyboard.press("Enter");
    await expect(hero).toHaveText(locale === "fr" ? "Reprendre" : "Resume");
    const slide = await page.locator(".hero-backdrop").getAttribute("data-slide");
    await page.keyboard.press("Tab");
    await page.clock.runFor(11000);
    await expect(page.locator(".hero-backdrop")).toHaveAttribute("data-slide", slide!);
    await hero.focus();
    await page.keyboard.press("Space");
    await expect(hero).toHaveText("Pause");
    await expect.poll(async () => { await page.clock.runFor(5100); return page.locator(".hero-backdrop").getAttribute("data-slide"); }).not.toBe(slide);

    const ticker = page.locator(".partner-ticker");
    await ticker.getByRole("button").focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.mouse.move(0, 0);
    await expect(ticker).toHaveAttribute("data-paused", "true");
    await expect(ticker.locator(".partner-ticker-track")).toHaveCSS("animation-play-state", "paused");
    await ticker.getByRole("button").focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await expect(ticker.locator(".partner-ticker-track")).toHaveCSS("animation-play-state", "running");

    const carousel = page.locator(".partner-carousel");
    const logos = carousel.locator(".partner-list");
    const toggle = carousel.locator(".partner-carousel-toggle");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await page.mouse.move(0, 0);
    const left = await logos.evaluate(el => el.scrollLeft);
    await page.clock.runFor(9000);
    await expect(carousel).toHaveAttribute("data-autoplay", "false");
    expect(await logos.evaluate(el => el.scrollLeft)).toBe(left);
    await toggle.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await expect(carousel).toHaveAttribute("data-autoplay", "true");
    await carousel.scrollIntoViewIfNeeded();
    // L’observateur de visibilité est asynchrone après la sortie du focus.
    await expect.poll(async () => {
      await page.clock.runFor(5200);
      return logos.evaluate(el => el.scrollLeft);
    }).not.toBe(left);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(".motion-toggle")).toHaveCount(0);
    await expect(page.locator(".hero-backdrop")).toHaveAttribute("data-slide", "0");
    await expect(carousel).toHaveAttribute("data-autoplay", "false");
  });
}

for (const width of [320, 1440]) {
  test(`accueil ${width}px : contrôles visibles au clavier et texte à 200 %`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto('/fr');
    await page.evaluate(() => document.fonts.ready);
    const pauseBox = (await page.locator('.hero-motion-toggle').boundingBox())!;
    const actionsBox = (await page.locator('.hero-actions').boundingBox())!;
    expect(pauseBox.y).toBeGreaterThanOrEqual(actionsBox.y + actionsBox.height);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    await page.addStyleTag({ content: ':root { font-size: 200%; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
    let reachedFooter = false;
    for (let step = 0; step < 100; step++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const rect = el.getBoundingClientRect();
        const header = document.querySelector('.site-header')!.getBoundingClientRect();
        const style = getComputedStyle(el);
        return { name: el.textContent, bottom: rect.bottom, top: rect.top, header: header.bottom, outline: style.outlineStyle, footer: !!el.closest('footer') };
      });
      expect(focused.bottom, focused.name || '').toBeGreaterThan(focused.header);
      expect(focused.top, focused.name || '').toBeLessThan(900);
      if (focused.footer) { reachedFooter = true; break; }
    }
    expect(reachedFooter).toBe(true);
  });
}
