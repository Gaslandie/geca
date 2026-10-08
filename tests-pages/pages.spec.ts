import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { locales, routes } from "../src/content/site";
import { readdir } from "node:fs/promises";

test("export : toutes les pages FR/EN, ressources et entrée du site", async ({ request }) => {
  const assets = new Set<string>();
  for (const locale of locales) {
    for (const path of ["", ...routes.map((route) => route.path)]) {
      const url = `/geca/${locale}/${path ? `${path}/` : ""}`;
      const response = await request.get(url);
      expect(response.status(), url).toBe(200);
      const html = await response.text();
      expect(html).toContain(`lang="${locale}"`);
      expect(html).toContain('name="robots" content="noindex, nofollow"');
      expect(html).toContain("form-action &#x27;none&#x27;");
      for (const match of html.matchAll(/(?:src|href|poster)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
        expect(match[1], url).toMatch(/^\/geca\//);
        if (/\.(css|js|woff2|svg|jpg|png|webp|mp4)$/.test(match[1])) assets.add(match[1]);
      }
    }
  }
  expect(assets.size).toBeGreaterThan(20);
  for (const asset of assets) expect((await request.get(asset)).status(), asset).toBe(200);
  const root = await request.get("/geca/");
  expect(root.status()).toBe(200);
  expect(await root.text()).toContain('content="0;url=/geca/fr/"');
});

test("export : adresses inconnues, fichiers privés et envoi refusés", async ({ request }) => {
  for (const path of ["fr/inconnue/", "fr/evenements/", "en/evenements/", "fr/projets/inconnu/", "fr/a-propos/equipe/", "fr/ressources/", "en/ressources/", "fr/reseaux/", "fr/partenaires/", "docs/TEXTES-AUTHENTIQUES-CLIENT.md", "es/", "es/contact/", ".env", ".git/config", "src/content/site.ts", "api/contact", "api/payments", "_next/image?url=https://example.com/image.jpg&w=640&q=75"]) {
    expect((await request.get(`/geca/${path}`)).status(), path).toBe(404);
  }
  expect((await request.post("/geca/fr/contact/", { data: { email: "demo@example.com" } })).status()).toBe(405);
  const files = await readdir("out", { recursive: true });
  expect(files.some((path) => /(^|\/)(\.env[^/]*|\.git|node_modules|src)(\/|$)|\.map$/.test(path))).toBe(false);
});

for (const width of [375, 1440]) {
  test(`export : images, carrousel, navigation et langues à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    const mediaRequests: string[] = [];
    page.on("request", (request) => {
      if (/geca-forest(\.mp4|-poster)/.test(request.url())) mediaRequests.push(request.url());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/geca/fr/");
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator("img").all()) {
      // Placer le focus sur la rangée avant d’inspecter chaque logo mobile.
      if (await image.evaluate((element) => !!element.closest(".partner-list"))) {
        await page.locator(".partner-list").focus();
      }
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      const source = new URL((await image.getAttribute("src"))!, page.url());
      expect(source.origin).toBe(new URL(page.url()).origin);
      expect(source.pathname).toMatch(/^\/geca\/images\//);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/pages-home-${width}.png`, animations: "disabled" });
    await expect(page.locator(".hero-slide img")).toHaveCount(5);
    for (const text of await page.locator(".hero-brand, #hero-title, .hero-description, .hero-introduction").all()) await expect(text).toHaveCSS("text-align", "left");
    await expect(page.locator(".site-header .brand-logo")).toHaveAttribute("src", /global-ecoaction-logo-transparent-/);
    await expect(page.locator(".site-header .brand")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    expect(await page.locator(".hero-slide img").evaluateAll(images => new Set(images.map(image => new URL((image as HTMLImageElement).src).pathname)).size)).toBe(5);
    await expect(page.locator(".hero-slide img").first()).toHaveAttribute("alt", "");
    await expect(page.locator(".hero video, .hero-video-toggle, .hero-action-arrow")).toHaveCount(0);
    expect(mediaRequests).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator(".hero-actions a").first().click();
    await expect(page).toHaveURL(/\/geca\/fr\/projets\/$/);
    await expect(page.locator('#main-navigation .nav-item > a[href="/geca/fr/projets/"]')).toHaveAttribute("aria-current", "page");
    if (await page.locator(".menu-toggle").isVisible()) await page.locator(".menu-toggle").click();
    await page.locator(".language-switch").getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/geca\/en\/projets\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    if (await page.locator(".menu-toggle").isVisible()) await page.locator(".menu-toggle").click();
    await page.locator(".language-switch").getByRole("link", { name: "FR", exact: true }).click();
    if (await page.locator(".menu-toggle").isVisible()) await page.locator(".menu-toggle").click();
    await page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Contact", exact: true }).click();
    await expect(page).toHaveURL(/\/geca\/fr\/contact\/$/);
    const accessibility = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({ path: `test-results/pages-contact-${width}.png`, fullPage: true });
  });
}

test("export : recherche superposée et liens préfixés FR/EN", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const locale of locales) {
    await page.goto(`/geca/${locale}/`);
    await page.getByRole("button", { name: locale === "fr" ? "Rechercher" : "Search", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/geca/${locale}/$`));
    const dialog = page.getByRole("dialog");
    const input = dialog.getByRole("searchbox");
    await expect(input).toBeFocused();
    await input.fill("PROTEMO");
    await expect(dialog.locator(".search-results a").first()).toHaveAttribute("href", `/geca/${locale}/projets/#projet-protemo`);
    await input.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/geca/${locale}/projets/#projet-protemo$`));
    await expect(page.locator("#projet-protemo")).toBeInViewport();
    await expect(dialog).not.toBeVisible();
  }
});

test("export : entrée et contact utilisables sans JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/geca/");
  await expect(page).toHaveURL(/\/geca\/fr\/$/);
  await page.goto("http://127.0.0.1:3100/geca/fr/contact/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const fields = page.locator("form input, form textarea, form button, form select");
  expect(await fields.count()).toBeGreaterThan(3);
  for (const field of await fields.all()) await expect(field).toBeDisabled();
  const emails = page.locator('a[href^="mailto:"]');
  // Le doublon au-dessus de la photo a été retiré à la demande du client.
  await expect(emails).toHaveCount(2);
  await expect(page.locator('.contact-details a[href^="mailto:"]')).toHaveCount(1);
  for (const email of await emails.all()) await expect(email).toBeVisible();
  await context.close();
});


for (const locale of locales) {
  test(`export : archives ${locale}, périodes et ancres préfixées`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/geca/${locale}/actualites/`);
    await expect(page.locator(".news-card")).toHaveCount(9);
    await expect(page.locator("time")).toHaveCount(2);
    await expect(page.locator("#projet-kounounkan .news-archive-period")).toContainText("2025-2026");
    await page.locator("#projet-kounounkan h3 a").click();
    await expect(page).toHaveURL(new RegExp(`/geca/${locale}/actualites/projet-kounounkan/$`));
    await expect(page.locator("#article-title")).toBeVisible();
  });
}


test("export : newsletter interne sans adresse locale ni fausse inscription", async ({ page }) => {
  for (const locale of locales) {
    await page.goto(`/geca/${locale}/`);
    await expect(page.locator(".newsletter-controls")).not.toHaveAttribute("action", /127\.0\.0\.1|localhost/);
    await expect(page.locator(".newsletter-controls button")).toBeDisabled();
    await expect(page.locator(".newsletter-availability")).toContainText(locale === "fr" ? "pas encore disponible" : "not yet available");
    await expect(page.locator("#hero-title")).toHaveText(locale === "fr" ? "AGIR POUR UN AVENIR DURABLE" : "ACTING FOR A SUSTAINABLE FUTURE");
    for (const link of await page.locator("#main-content a").all()) {
      expect(await link.getAttribute("href")).toMatch(new RegExp(`^/geca/${locale}/`));
    }
  }
});
