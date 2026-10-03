import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { locales, routes } from "../src/content/site";

test("routes connues FR / EN, langues et titres", async ({ request }) => {
  for (const locale of locales) {
    for (const path of ["", ...routes.map((route) => route.path)]) {
      const response = await request.get(`/${locale}${path ? `/${path}` : ""}`);
      expect(response.status(), `${locale}/${path}`).toBe(200);
      const html = await response.text();
      expect(html).toContain(`lang="${locale}"`);
      expect(html).toContain("<title>");
      if (path || locale === "en")
        expect(html).toContain(
          locale === "fr"
            ? "Cette rubrique est en préparation."
            : "This section is being prepared.",
        );
    }
  }
  const root = await request.get("/", { maxRedirects: 0 });
  expect(root.status()).toBe(307);
  expect(root.headers().location).toContain("/fr");
});

test("accès refusés et protections de la maquette", async ({ request }) => {
  for (const path of [
    "/fr/inconnue",
    "/fr/projets/inconnu",
    "/es",
    "/es/contact",
    "/fr/a-propos/inconnue",
    "/api/contact",
    "/api/payments",
    "/.env",
    "/src/content/site.ts",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
  const response = await request.get("/fr");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
  const image = await request.get(
    "/_next/image?url=https%3A%2F%2Fexample.com%2Fimage.jpg&w=640&q=75",
  );
  expect(image.status()).toBe(400);
});

for (const width of [320, 375, 670, 767, 768, 970, 1024, 1440]) {
  test(`écran ${width}px : débordement, menus, filtres, accessibilité`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const requests: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    await page.goto("/fr");
    await page.evaluate(() => document.fonts.ready);
    const domains = page.locator(".domains .domain");
    await expect(domains).toHaveCount(6);
    for (const [index, domain] of (await domains.all()).entries()) {
      const photo = await domain.locator(".domain-photo").boundingBox();
      const text = await domain.locator(".domain-content").boundingBox();
      expect(photo).not.toBeNull();
      expect(text).not.toBeNull();
      if (photo && text) {
        if (width < 768) {
          expect(text.y).toBeGreaterThanOrEqual(photo.y + photo.height - 1);
          expect(Math.abs(text.width - photo.width)).toBeLessThan(1);
        } else {
          expect(Math.abs(text.y - photo.y)).toBeLessThan(1);
          expect(Math.abs(text.width - photo.width)).toBeLessThan(1);
          expect(Math.abs(text.height - photo.height)).toBeLessThan(1);
          expect(index % 2 === 0 ? text.x < photo.x : photo.x < text.x).toBe(true);
        }
      }
      const link = domain.getByRole("link");
      await expect(link).toHaveAttribute("href", "/fr/a-propos/domaines-intervention");
      expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const visual = await page.locator(".hero-visual").boundingBox();
    const message = await page.locator(".hero-content").boundingBox();
    expect(visual).not.toBeNull();
    expect(message).not.toBeNull();
    if (visual && message) {
      expect(visual.x).toBe(0);
      expect(visual.width).toBe(width);
      expect(message.y).toBeGreaterThan(visual.y);
      expect(message.y + message.height).toBeLessThan(visual.y + visual.height);
      expect(Math.abs(message.x + message.width / 2 - width / 2)).toBeLessThan(1);
    }
    await expect(page.locator("#hero-title")).toHaveText(
      "AGIR POUR UN AVENIR DURABLE",
    );
    const actions = page.locator(".hero-actions a");
    await expect(actions).toHaveCount(2);
    for (const action of await actions.all()) {
      const box = await action.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole("button", { name: "Mettre la vidéo en pause" }).click();
    await expect.poll(() => page.locator(".hero-visual video").evaluate(
      (video: HTMLVideoElement) => video.paused,
    )).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    if (width < 1200) await menu.click();
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const group of [
      "À propos",
      "Projets & programmes",
      "Actualités",
      "Ressources",
    ]) {
      const trigger = nav.getByRole("button", { name: group, exact: true });
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await trigger.focus();
      await page.keyboard.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toBeFocused();
    }
    if (width < 1200) {
      const about = nav.getByRole("button", { name: "À propos", exact: true });
      await about.click();
      await nav.getByRole("link", { name: "Équipe", exact: true }).click();
      await expect(page).toHaveURL("/fr/equipe");
      await expect(nav).toBeHidden();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        "Cette rubrique est en préparation.",
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.getByRole("link", { name: "Retour à l’accueil" }).click();
    } else {
      await nav
        .getByRole("button", { name: "Ressources", exact: true })
        .click();
      await nav.getByRole("link", { name: "Partenaires", exact: true }).click();
      await expect(page).toHaveURL("/fr/partenaires");
      await page.getByRole("link", { name: "Retour à l’accueil" }).click();
    }
    const filter = page.getByRole("group", { name: "Filtrer les projets" });
    await expect(page.locator(".project-card")).toHaveCount(2);
    await filter.getByRole("button", { name: "Réalisés" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Projet de Territoire de Moussayah — PROTEMO",
      }),
    ).toBeVisible();
    await expect(page.locator(".project-card")).toHaveCount(2);
    await filter.getByRole("button", { name: "En cours", exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    const illustrations = page.locator(".photo-placeholder.has-photo");
    await expect(illustrations).toHaveCount(9);
    for (const illustration of await illustrations.all()) {
      await illustration.scrollIntoViewIfNeeded();
      await expect(
        illustration.getByText("Image temporaire", { exact: true }),
      ).toBeVisible();
      await expect
        .poll(() =>
          illustration
            .locator("img")
            .evaluate(
              (image: HTMLImageElement) =>
                image.complete && image.naturalWidth > 0,
            ),
        )
        .toBe(true);
    }
    if ([375, 768, 1440].includes(width)) {
      await page.locator(".impact").screenshot({
        path: `test-results/impact-${width}.png`,
      });
      await page.locator(".domains").screenshot({
        path: `test-results/domains-${width}.png`,
      });
    }
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `test-results/hero-${width}.png` });
    await page.goto("/en/projets/kounounkan");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(errors).toEqual([]);
    expect(
      requests.filter((url) => !url.startsWith("http://127.0.0.1:3000")),
    ).toEqual([]);
  });
}

test("tous les liens internes de l’accueil répondent", async ({
  page,
  request,
}) => {
  await page.goto("/fr");
  const links = await page
    .locator("a[href^='/']")
    .evaluateAll((elements) => [
      ...new Set(elements.map((element) => element.getAttribute("href")!)),
    ]);
  for (const link of links)
    expect((await request.get(link)).status(), link).toBe(200);
});

test("clavier, langue anglaise et mouvements réduits", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/fr");
  await expect(page.locator(".hero-visual video")).not.toHaveAttribute("src");
  expect(
    await page.locator(".hero-visual video").evaluate((video: HTMLVideoElement) => video.paused),
  ).toBe(true);
  expect(
    await page
      .locator(".hero-actions .button-primary")
      .evaluate((element) => getComputedStyle(element).transitionDuration),
  ).toBe("0s");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Aller au contenu" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => document.activeElement?.id)).toBe(
    "main-content",
  );
  await page.goto("/fr/projets/en-cours");
  await page
    .locator(".desktop-utility")
    .getByRole("link", { name: "EN", exact: true })
    .click();
  await expect(page).toHaveURL("/en/projets/en-cours");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole("link", { name: "Visit the French homepage" }).click();
  await expect(page).toHaveURL("/fr");
});

test("vidéo locale : lecture sans son, pause au clavier et mouvements réduits", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/fr");
  const video = page.locator(".hero-visual video");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) =>
    element.readyState >= 2 && !element.paused && element.currentTime > 0,
  )).toBe(true);
  expect(await video.evaluate((element: HTMLVideoElement) =>
    element.muted && element.loop && element.playsInline && element.videoWidth === 1920,
  )).toBe(true);
  const pause = page.getByRole("button", { name: "Mettre la vidéo en pause" });
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  const stoppedAt = await video.evaluate((element: HTMLVideoElement) => element.currentTime);
  await page.locator(".hero-actions a").first().focus();
  expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(stoppedAt);
  await page.getByRole("button", { name: "Lire la vidéo" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  const media = await request.get("/videos/geca-forest.mp4", {
    headers: { Range: "bytes=0-63" },
  });
  expect(media.status()).toBe(206);
  expect(media.headers()["content-type"]).toContain("video/mp4");
  expect((await media.body()).subarray(4, 8).toString()).toBe("ftyp");
});

test("vidéo indisponible : image de secours et deux liens utilisables", async ({ page }) => {
  await page.route("**/videos/geca-forest.mp4", (route) => route.abort());
  await page.goto("/fr");
  await expect(page.locator(".hero-video-toggle")).toHaveCount(0);
  await expect(page.locator(".hero-visual video")).toHaveAttribute("data-ready", "false");
  expect(await page.locator(".hero-visual").evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  )).toContain("geca-forest-poster.jpg");
  for (const [label, path] of [
    ["Découvrir nos projets", "/fr/projets"],
    ["Devenir partenaire", "/fr/devenir-partenaire"],
  ]) {
    await page.locator(".hero-actions").getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(path);
    await page.getByRole("link", { name: "Retour à l’accueil" }).click();
  }
});

test("économie de données : image fixe avant une lecture demandée", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
  });
  const mediaRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/videos/geca-forest.mp4")) mediaRequests.push(request.url());
  });
  await page.goto("/fr");
  const video = page.locator(".hero-visual video");
  await expect(video).not.toHaveAttribute("src");
  expect(mediaRequests).toEqual([]);
  await page.getByRole("button", { name: "Lire la vidéo" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
});

test("lecture automatique refusée : image fixe et commande de lecture", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError"));
  });
  await page.goto("/fr");
  await expect(page.getByRole("button", { name: "Lire la vidéo" })).toBeVisible();
  expect(await page.locator(".hero-visual video").evaluate(
    (video: HTMLVideoElement) => video.paused,
  )).toBe(true);
  expect(await page.locator(".hero-visual").evaluate(
    (element) => getComputedStyle(element).backgroundImage,
  )).toContain("geca-forest-poster.jpg");
  await expect(page.locator(".hero-actions a")).toHaveCount(2);
});

test("sans JavaScript : image chargée, message et liens présents", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const posterLoaded = page.waitForResponse((response) =>
    response.url().endsWith("/videos/geca-forest-poster.jpg") && response.status() === 200,
  );
  await page.goto("http://127.0.0.1:3000/fr");
  await posterLoaded;
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect(page.locator(".hero-actions a")).toHaveCount(2);
  await expect(page.locator(".hero-visual video")).not.toHaveAttribute("src");
  await expect(page.locator(".hero-video-toggle")).toBeHidden();
  await context.close();
});
