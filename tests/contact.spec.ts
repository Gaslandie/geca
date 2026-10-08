import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { contactContent, identity, locales } from "../src/content/site";

for (const locale of locales) {
  test(`carte ${locale} : activation explicite et itinéraire public`, async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).origin !== "http://127.0.0.1:3000") external.push(request.url());
    });
    await page.route("https://www.openstreetmap.org/export/embed.html?**", (route) => route.fulfill({
      contentType: "text/html", body: "<!doctype html><html lang='fr'><title>Carte de test</title><body>Carte du quartier</body></html>",
    }));
    await page.goto(`/${locale}/contact`);
    const map = page.getByRole("region", { name: contactContent[locale].map.title, exact: true });
    await map.scrollIntoViewIfNeeded();
    await expect(map.locator("iframe")).toHaveCount(0);
    expect(external).toEqual([]);
    const directions = map.getByRole("link", { name: contactContent[locale].map.directions });
    const destination = new URL((await directions.getAttribute("href"))!);
    expect(destination.origin).toBe("https://www.google.com");
    expect(destination.searchParams.get("destination")).toBe(identity.address.fr);
    await expect(directions).toHaveAttribute("rel", "noopener noreferrer");
    await map.getByRole("button", { name: contactContent[locale].map.show }).focus();
    await page.keyboard.press("Enter");
    const frame = map.locator("iframe");
    await expect(frame).toBeFocused();
    await expect(frame).toHaveAttribute("referrerpolicy", "no-referrer");
    await expect(frame).toHaveAttribute("title", contactContent[locale].map.description);
    const mapParams = new URL((await frame.getAttribute("src"))!).searchParams;
    expect(mapParams.has("marker")).toBe(false);
    // La vue doit contenir Kissosso, sans attribuer ce repère au bureau GECA.
    const [west, south, east, north] = mapParams.get("bbox")!.split(",").map(Number);
    expect(-13.57237).toBeGreaterThan(west);
    expect(-13.57237).toBeLessThan(east);
    expect(9.63719).toBeGreaterThan(south);
    expect(9.63719).toBeLessThan(north);
    expect(external.every((url) => url.startsWith("https://www.openstreetmap.org/export/embed.html?"))).toBe(true);
  });
}

for (const locale of locales) {
  test(`contact ${locale} : validation, aperçu, aucune transmission et effacement`, async ({ page, request }) => {
    const text = contactContent[locale];
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/${locale}/contact`);
    const form = page.getByRole("form", { name: text.form.title });
    const button = form.getByRole("button", { name: text.form.submit });
    await expect(button).toBeEnabled();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(text.title);
    await expect(page.locator(".contact-details a").first()).toHaveAttribute("href", identity.phoneHref);
    await expect(page.locator('.contact-details a[href^="mailto:"]')).toHaveAttribute("href", `mailto:${identity.email}`);

    // Terminer les images locales et préchargements de liens avant de surveiller la saisie.
    await page.locator(".site-footer").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    await form.scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");

    const network: string[] = [];
    page.on("request", (r) => {
      const url = new URL(r.url());
      // Le chargement tardif d'un fichier JS local reste autorisé.
      // Toute autre requête pendant la saisie ou l'aperçu est un échec.
      const localScript = url.origin === "http://127.0.0.1:3000" &&
        url.pathname.startsWith("/_next/static/") && url.search === "" &&
        r.resourceType() === "script" && r.method() === "GET" && !r.postData();
      if (!localScript) network.push(r.url());
    });
    await button.click();
    await expect(page.getByRole("region", { name: text.form.preview })).toHaveCount(0);
    await form.locator("[name=name]").fill("Exemple GECA");
    await form.locator("[name=email]").fill("adresse-invalide");
    await form.locator("[value=partnership]").check();
    await form.locator("[name=message]").fill("Un projet de restauration en Guinée.");
    await button.click();
    expect(await form.locator("[name=email]").evaluate((node: HTMLInputElement) => node.validity.typeMismatch)).toBe(true);
    await expect(page.getByRole("region", { name: text.form.preview })).toHaveCount(0);
    await form.locator("[name=email]").fill("exemple@example.com");
    await form.locator("[name=message]").fill("            ");
    await button.click();
    expect(await form.locator("[name=message]").evaluate((node: HTMLTextAreaElement) => node.validity.customError)).toBe(true);
    await expect(page.getByRole("region", { name: text.form.preview })).toHaveCount(0);

    const message = '<script>window.contactInjected = true</script>\nNotre idée de projet.';
    await form.locator("[name=message]").fill(message);
    await button.click();
    const preview = page.getByRole("region", { name: text.form.preview });
    await expect(preview).toBeVisible();
    await expect(preview).toBeFocused();
    await expect(preview.getByRole("status")).toHaveText(text.form.notSent);
    await expect(preview.locator(".contact-preview-message")).toHaveText(message);
    await expect(preview.locator("script")).toHaveCount(0);
    expect(await page.evaluate(() => "contactInjected" in window)).toBe(false);
    expect(network).toEqual([]);
    expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
    await preview.getByRole("button", { name: text.form.reset }).click();
    await expect(form.locator("[name=name]")).toHaveValue("");
    await expect(form.locator("[name=email]")).toHaveValue("");
    await expect(form.locator("[name=message]")).toHaveValue("");
    await expect(preview).toHaveCount(0);
    expect(network).toEqual([]);
    const response = await request.post("/api/contact", { data: { message: "Essai refusé" } });
    expect(response.status()).toBe(404);
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`contact ${width}px : disposition, photos et accessibilité`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    // Mesurer la disposition au repos, pas au milieu de l’apparition de 12 px.
    // Les mouvements et leur arrêt au focus sont vérifiés dans les tests dédiés.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr/contact");
    await expect(page.locator(".contact-submit")).toBeEnabled();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const introduction = (await page.locator(".contact-landscape").boundingBox())!;
    const form = (await page.locator(".contact-form-panel").boundingBox())!;
    const frame = (await page.locator(".header-inner").boundingBox())!;
    for (const section of await page.locator("#main-content > section, .contact-forest, #main-content .container, .site-footer .container").all()) {
      const box = (await section.boundingBox())!;
      expect(box.x).toBeCloseTo(frame.x, 0);
      expect(box.width).toBeCloseTo(frame.width, 0);
    }
    const footer = (await page.locator(".site-footer").boundingBox())!;
    expect(footer.x).toBe(0);
    expect(footer.width).toBe(width);
    if (width >= 768) {
      expect(introduction.y).toBeCloseTo(form.y, 0);
      expect(introduction.width).toBeCloseTo(form.width, 0);
      expect(form.x).toBeCloseTo(introduction.x + introduction.width, 0);
    } else {
      expect(form.y).toBeCloseTo(introduction.y + introduction.height, 0);
    }
    await expect(page.locator("main .temporary-image-label")).toHaveCount(0);
    for (const image of await page.locator("main img").all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
    await page.screenshot({ path: `/tmp/geca-contact-${width}.png`, fullPage: true });
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("contact : sans JavaScript, saisie désactivée et coordonnées disponibles", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000/fr/contact");
  await expect(page.locator("#contact-name")).toBeDisabled();
  await expect(page.locator(".contact-submit")).toBeDisabled();
  await expect(page.getByText(contactContent.fr.form.noScript, { exact: true })).toBeVisible();
  await expect(page.locator('.contact-details a[href^="mailto:"]')).toHaveAttribute("href", `mailto:${identity.email}`);
  await context.close();
});

test("contact : choix au clavier et passage FR vers EN", async ({ page }) => {
  await page.goto("/fr/contact");
  await expect(page.locator("[value=partnership]")).toBeEnabled();
  await page.locator("[value=partnership]").focus();
  await page.keyboard.press("Space");
  await expect(page.locator("[value=partnership]")).toBeChecked();
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("[value=project]")).toBeChecked();
  if (await page.locator(".menu-toggle").isVisible()) {
    await page.locator(".menu-toggle").focus();
    await page.keyboard.press("Enter");
  }
  const english = page.getByRole("link", { name: "EN", exact: true });
  await expect(english).toHaveAttribute("href", "/en/contact");
  await english.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/en\/contact$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(contactContent.en.title);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
