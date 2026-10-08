import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { getHomeContent } from "../src/content/site";

for (const width of [320, 375, 768, 1440]) {
  test(`accueil EN : contenu, liens, clavier et texte agrandi ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    const text = getHomeContent("en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("Global EcoAction — Acting together in Guinea");
    await expect(page.locator('#hero-title')).toHaveText(`${text.hero.title} ${text.hero.titleSecondLine}`);
    await expect(page.locator('.domain')).toHaveCount(8);
    await expect(page.locator('.stat-label')).toHaveText(text.impact.stats.map(stat => stat.label));
    await expect(page.locator('.impact-achievements li')).toHaveText(text.impact.achievements);
    await expect(page.locator('.team-member')).toHaveCount(8);
    await expect(page.locator('.hero-slide')).toHaveCount(1);
    await expect(page.locator('.hero-brand-gold').filter({ hasText: /^Eco$/ })).toHaveCSS('color', 'rgb(235, 173, 14)');
    for (const link of await page.locator('#main-content a').all()) {
      expect(await link.getAttribute('href')).toMatch(/^\/en\//);
    }
    await page.screenshot({ path: `/tmp/geca-en-${width}.png` });
    await page.getByRole('button', { name: 'Completed', exact: true }).click();
    await expect(page.locator('.project-card')).toHaveCount(2);
    await expect(page.locator('.project-status')).toHaveText(['Completed', 'Completed']);
    await expect(page.locator('.temporary-image-label')).toHaveText('Temporary image');
    await expect(page.locator('.photo-context-label')).toHaveText('Thematic illustration');
    await page.getByRole('button', { name: 'Next partners' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.partner-carousel [aria-live]')).toContainText('Partners');
    await expect(page.locator('.site-footer .newsletter-controls')).toHaveAttribute('action', /\/newsletter\/en\/commencer$/);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.addStyleTag({ content: ':root { font-size: 200%; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const input = dialog.getByRole('searchbox');
    await input.fill('365000');
    await expect(dialog.locator('.search-results a[href="/en#impact-title"]')).toBeVisible();
    await input.fill('zzzzqqqq');
    await expect(dialog.locator('.search-results a')).toHaveCount(4);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/en');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Search', exact: true })).toBeFocused();
    await page.screenshot({ path: `/tmp/geca-en-${width}-200.png`, fullPage: true });
    await page.goto('/fr');
    await expect(page.locator('#hero-title')).toHaveText('AGIR POUR UN AVENIR DURABLE');
    await expect(page.locator('.hero-introduction')).toHaveText(getHomeContent('fr').hero.introduction);
  });
}

test('accueil EN sans JavaScript : photos, liens et refus des routes privées', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/en');
  await expect(page.locator('#hero-title')).toBeVisible();
  await expect(page.locator('.hero-slide')).toHaveCount(1);
  await page.getByRole('link', { name: 'Explore our projects' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:3000/en/projets');
  await context.close();
  for (const path of ['/es', '/en/ressources', '/en/evenements', '/en/projets/inconnu', '/backoffice', '/.env', '/backoffice/database/database.sqlite']) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test('hero EN : cinq fonds, fondu et mouvement réduit', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('.hero-slide')).toHaveCount(5);
  await expect(page.locator('.hero-backdrop')).toHaveAttribute('data-slide', '0');
  await expect(page.locator('.hero-backdrop')).toHaveAttribute('data-slide', '1', { timeout: 7000 });
  await expect(page.locator('.hero video, .hero button')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.hero-slide')).toHaveCount(1);
  await expect(page.locator('.hero-backdrop')).toHaveAttribute('data-slide', '0');
});
