import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { aboutContent, contactContent, homeContent, interventionContent, locales, missionVisionContent, partnershipContent, portfolioContent, routes } from "../src/content/site";

test("routes connues FR / EN, langues et titres", async ({ request }) => {
  for (const locale of locales) {
    for (const path of ["", ...routes.map((route) => route.path)]) {
      const response = await request.get(`/${locale}${path ? `/${path}` : ""}`);
      expect(response.status(), `${locale}/${path}`).toBe(200);
      const html = await response.text();
      expect(html).toContain(`lang="${locale}"`);
      expect(html).toContain("<title>");
      if (path === "contact") {
        expect(html).toContain(contactContent[locale].title);
        expect(html).toContain(contactContent[locale].form.demo);
      } else if (path === "a-propos") {
        expect(html).toContain(aboutContent[locale].title);
        expect(html).toContain("RENASCEDD");
      } else if (path === "a-propos/domaines-intervention") {
        expect(html).toContain(interventionContent[locale].title);
      } else if (path === "a-propos/mission-vision-valeurs") {
        expect(html).toContain(missionVisionContent[locale].title);
        expect(html).toContain(missionVisionContent[locale].mission.summary);
      } else if (path === "projets") {
        expect(html).toContain(portfolioContent[locale].catalogTitle);
        expect(html).toContain(portfolioContent[locale].notice);
      } else if (path === "devenir-partenaire") {
        expect(html).toContain(partnershipContent[locale].strengthsTitle);
        expect(html).toContain(partnershipContent[locale].positioning);
      } else if (path || locale === "en")
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
    "/fr/equipe",
    "/en/equipe",
    "/fr/ressources",
    "/en/ressources",
    "/fr/reseaux",
    "/en/reseaux",
    "/fr/partenaires",
    "/en/partenaires",
    "/fr/ressources/publications",
    "/en/ressources/documents",
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
  // Les variantes préparées suppriment l’API de traitement à la demande.
  for (const source of ["https://example.com/image.jpg", "http://127.0.0.1/private", "/.env", "/images/temporary/forest.jpg"]) {
    const image = await request.get(`/_next/image?url=${encodeURIComponent(source)}&w=640&q=75`);
    expect(image.status()).toBe(404);
  }
});

for (const width of [320, 375, 480, 670, 767, 768, 970, 1024, 1440]) {
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
    // Mesurer la disposition finale après l'apparition commune, testée séparément.
    await page.locator(".hero-grid").evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
    });
    const domains = page.locator(".domains .domain");
    await expect(domains).toHaveCount(8);
    for (const [index, domain] of (await domains.all()).entries()) {
      const area = homeContent.domains.items[index];
      await expect(domain.locator(".domain-content > p")).toHaveText(area.description);
      if (area.photo) {
        expect(await domain.locator("img").evaluate((image: HTMLImageElement) => new URL(image.currentSrc || image.src).pathname)).toMatch(new RegExp(`/images/optimized/images-domaines-${area.photo.src.split("/").pop()!.replace(/\.jpg$/, "")}-\\d+-[a-f0-9]+\\.webp$`));
        await expect(domain.locator(".temporary-image-label")).toHaveCount(0);
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
      } else {
        await expect(domain.locator("img")).toHaveCount(0);
        const copy = (await domain.locator(".domain-content").boundingBox())!;
        expect(copy.width).toBeCloseTo((await domain.boundingBox())!.width, 0);
      }
      const link = domain.getByRole("link");
      await expect(link).toHaveAttribute("href", `/fr/a-propos/domaines-intervention#${homeContent.domains.items[index].id}`);
      expect((await link.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const visual = await page.locator(".hero-visual").boundingBox();
    const message = await page.locator(".hero-content").boundingBox();
    const frame = (await page.locator(".header-inner").boundingBox())!;
    const logo = (await page.locator(".site-header .brand").boundingBox())!;
    const menuBox = (await page.locator(".menu-toggle").boundingBox())!;
    expect(frame.x).toBeCloseTo(logo.x, 0);
    expect(frame.x + frame.width).toBeCloseTo(menuBox.x + menuBox.width, 0);
    for (const section of await page.locator("#main-content > section:not(.hero), #main-content .container, .site-footer .container").all()) {
      const box = (await section.boundingBox())!;
      expect(box.x).toBeCloseTo(frame.x, 0);
      expect(box.width).toBeCloseTo(frame.width, 0);
    }
    // Le fond garde le cadre commun ; son contenu reste à distance des bords.
    for (const container of await page.locator("#main-content .container").all()) {
      const box = (await container.boundingBox())!;
      for (const child of await container.locator(":scope > *").all()) {
        const content = (await child.boundingBox())!;
        expect(content.x - box.x).toBeGreaterThanOrEqual(19.5);
        expect(box.x + box.width - content.x - content.width).toBeGreaterThanOrEqual(19.5);
      }
    }
    for (const section of await page.locator(".hero, .site-footer").all()) {
      const box = (await section.boundingBox())!;
      expect(box.x).toBe(0);
      expect(box.width).toBe(width);
    }
    if (width >= 768) expect(visual).not.toBeNull();
    else expect(visual).toBeNull();
    expect(message).not.toBeNull();
    await expect(page.locator(".hero-photo img")).toHaveAttribute("alt", homeContent.hero.photo.alt);
    await expect(page.locator(".hero-photo .temporary-image-label")).toHaveCount(0);
    expect(await page.locator(".hero-photo img").evaluate((img: HTMLImageElement) => new URL(img.currentSrc).pathname)).toMatch(/images-hero-plantation-\d+-[a-f0-9]+\.webp$/);
    if (message) {
      expect(message.x).toBe(0);
      expect(message.width).toBeCloseTo(width < 768 ? width : width * 0.65, 0);
      const caption = (await page.locator(".hero-caption").boundingBox())!;
      const actionPanel = (await page.locator(".hero-actions").boundingBox())!;
      const photo = (await page.locator(".hero-photo").boundingBox())!;
      if (width >= 768) {
        expect(visual!.x).toBe(0);
        expect(visual!.width).toBeCloseTo(width * 0.65, 0);
        expect(visual!.y).toBeCloseTo(caption.y, 0);
        expect(visual!.height).toBeCloseTo(caption.height, 0);
        expect(photo.y).toBeCloseTo(message.y, 0);
        expect(photo.x).toBeCloseTo(message.x + message.width, 0);
        expect(photo.width).toBeCloseTo(actionPanel.width, 0);
        expect(photo.x).toBeCloseTo(actionPanel.x, 0);
        expect(caption.y).toBeCloseTo(message.y + message.height, 0);
        expect(actionPanel.y).toBeCloseTo(caption.y, 0);
        expect(caption.width).toBeCloseTo(width * 0.65, 0);
        expect(actionPanel.x).toBeCloseTo(caption.x + caption.width, 0);
      } else {
        expect(await page.locator("#hero-title").evaluate((title) => getComputedStyle(title).textAlign)).toBe("center");
        expect(await page.locator(".hero-content .eyebrow").evaluate((label) => getComputedStyle(label).color)).toBe("rgb(255, 224, 138)");
        expect(photo.y).toBeCloseTo(message.y, 0);
        expect(caption.y).toBeCloseTo(message.y + message.height, 0);
        expect(photo.height).toBeCloseTo(message.height + caption.height, 0);
        expect(actionPanel.y).toBeCloseTo(photo.y + photo.height, 0);
      }
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
    if (width >= 768) {
      await page.getByRole("button", { name: "Mettre la vidéo en pause" }).click();
    } else {
      await expect(page.locator(".hero-video-toggle")).toBeHidden();
      await expect(page.locator(".hero-visual video")).not.toHaveAttribute("src");
      await expect(page.locator(".hero-visual video")).not.toHaveAttribute("poster");
      expect(requests.filter((url) => /geca-forest(\.mp4|-poster)/.test(url))).toEqual([]);
    }
    await expect.poll(() => page.locator(".hero-visual video").evaluate(
      (video: HTMLVideoElement) => video.paused,
    )).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const menu = page.getByRole("button", { name: "Menu", exact: true });
    await expect(menu).toBeVisible();
    const search = page.locator(".header-actions .search-link");
    await expect(search).toHaveAccessibleName("Rechercher");
    await expect(search.locator("svg")).toHaveCount(1);
    await expect(menu.locator("svg")).toHaveCount(1);
    await expect(page.locator(".hero-actions .hero-action-arrow")).toBeVisible();
    await expect(page.locator(".domain svg, .project-card svg, .stat svg, .news-card svg")).toHaveCount(0);
    await expect(search).toHaveAttribute("aria-haspopup", "dialog");
    await expect(page.locator("#main-navigation a[href='/fr/recherche']")).toHaveCount(0);
    const searchBox = (await search.boundingBox())!;
    const donateBox = (await page.locator(".donate-link").boundingBox())!;
    const language = page.locator("#main-navigation .language-switch");
    await expect(page.locator(".header-actions .language-switch")).toHaveCount(0);
    await expect(language).toBeHidden();
    expect(searchBox.x).toBeGreaterThanOrEqual(donateBox.x + donateBox.width + 5);
    const menuBarBox = (await menu.boundingBox())!;
    expect(menuBarBox.x).toBeGreaterThanOrEqual(searchBox.x + searchBox.width + 7);
    const brandBox = (await page.locator(".site-header .brand").boundingBox())!;
    expect(searchBox.y + searchBox.height / 2).toBeCloseTo(donateBox.y + donateBox.height / 2, 0);
    expect(searchBox.y + searchBox.height / 2).toBeCloseTo(brandBox.y + brandBox.height / 2, 0);
    expect(menuBarBox.y + menuBarBox.height / 2).toBeCloseTo(brandBox.y + brandBox.height / 2, 0);
    await expect(page.locator(".donate-link")).toHaveText("Faire un don");
    await expect(page.locator(".hero-introduction")).toContainText("En Guinée, nous agissons avec les communautés");
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeHidden();
    await menu.click();
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav).toBeVisible();
    await expect(language.getByRole("link", { name: "FR", exact: true })).toBeVisible();
    await expect(language.getByRole("link", { name: "EN", exact: true })).toBeVisible();
    // Une même hiérarchie typographique doit rester commune à toutes les sections.
    const typography = await page.evaluate(() => {
      const headings = [...document.querySelectorAll("main h2")].map((element) => {
        const style = getComputedStyle(element);
        return [style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight].join("|");
      });
      const menuLink = document.querySelector(".nav-item > a")!;
      return {
        headings: [...new Set(headings)],
        navigationSize: parseFloat(getComputedStyle(menuLink).fontSize),
        fontsLoaded: [...document.fonts].some((font) => font.status === "loaded"),
      };
    });
    expect(typography.headings).toHaveLength(1);
    expect(typography.navigationSize).toBeGreaterThanOrEqual(18);
    expect(typography.fontsLoaded).toBe(true);
    const sectionHeaders = await page.locator(".section-heading").evaluateAll((headers) =>
      headers.map((header) => {
        const section = header.closest("section")!.getBoundingClientRect();
        return [...header.querySelectorAll("h2, .eyebrow, .section-description")].every((element) => {
          const box = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          // Gassama demande une description justifiée dans « Notre organisation ».
          const justified = element.matches(".about-content .section-description");
          return style.textAlign === (justified ? "justify" : "center") &&
            (!justified || style.textAlignLast === "start") &&
            Math.abs(box.x + box.width / 2 - (section.x + section.width / 2)) < 1;
        });
      }),
    );
    // Tous les en-têtes de section, y compris Impact, sont centrés.
    expect(sectionHeaders).toHaveLength(6);
    await expect(page.locator(".team, .team-member, a[href$='/equipe']")).toHaveCount(0);
    expect(sectionHeaders.every(Boolean)).toBe(true);
    const partnerCards = await page.locator(".partner-list li").evaluateAll((cards) =>
      cards.map((card) => {
        const box = card.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }),
    );
    expect(partnerCards).toHaveLength(5);
    for (const card of partnerCards) {
      expect(Math.abs(card.width - partnerCards[0].width)).toBeLessThan(1);
      expect(Math.abs(card.height - partnerCards[0].height)).toBeLessThan(1);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    for (const group of [
      "À propos",
      "Actualités",
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
      await nav.getByRole("link", { name: "Mission, vision et valeurs", exact: true }).click();
      await expect(page).toHaveURL("/fr/a-propos/mission-vision-valeurs");
      await expect(nav).toBeHidden();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        missionVisionContent.fr.title,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator(".contact-breadcrumb").getByRole("link", { name: "Accueil", exact: true }).click();
    } else {
      await nav
        .getByRole("button", { name: "Actualités", exact: true })
        .click();
      await nav.getByRole("link", { name: "Événements", exact: true }).click();
      await expect(page).toHaveURL("/fr/evenements");
      await page.getByRole("link", { name: "Retour à l’accueil" }).click();
    }
    const filter = page.getByRole("group", { name: "Filtrer les projets" });
    await expect(page.locator(".project-card")).toHaveCount(2);
    await filter.getByRole("button", { name: "Réalisés" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Projet de Territoire de Moussayah - PROTEMO",
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
    await expect(illustrations).toHaveCount(15);
    for (const illustration of await illustrations.all()) {
      await illustration.scrollIntoViewIfNeeded();
      if (await illustration.evaluate((element) => element.matches(".domain-photo, .hero-photo"))) {
        await expect(illustration.locator(".temporary-image-label")).toHaveCount(0);
      } else {
        await expect(
          illustration.getByText("Image temporaire", { exact: true }),
        ).toBeVisible();
      }
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
      await page.locator(".news").screenshot({
        path: `test-results/news-${width}.png`,
      });
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
    await page.goto("/en/projets");
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

test("texte agrandi à 200 % : contenus et navigation restent dans le cadre", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/fr");
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: ":root { font-size: 200%; }" });
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const nav = page.getByRole("navigation", { name: "Navigation principale" });
    await expect(nav).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await nav.getByRole("button", { name: "À propos", exact: true }).click();
    await expect(nav.getByRole("link", { name: "Domaines d’expertise", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(".hero-actions .button-primary")).toBeVisible();
    await expect(page.locator(".hero-actions .button-secondary")).toBeVisible();
  }
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
  await page.goto("/fr/projets");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .locator("#main-navigation .language-switch")
    .getByRole("link", { name: "EN", exact: true })
    .click();
  await expect(page).toHaveURL("/en/projets");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.locator(".site-header .brand").click();
  await expect(page).toHaveURL("/en");
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
    element.muted && element.loop && element.playsInline && element.videoWidth === 1280,
  )).toBe(true);
  const pause = page.getByRole("button", { name: "Mettre la vidéo en pause" });
  await expect(pause).toHaveText("");
  await expect(pause.locator("svg")).toHaveCount(1);
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await expect(page.getByRole("button", { name: "Lire la vidéo" })).toHaveText("");
  const stoppedAt = await video.evaluate((element: HTMLVideoElement) => element.currentTime);
  await page.locator(".hero-actions a").first().focus();
  expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBe(stoppedAt);
  await page.getByRole("button", { name: "Lire la vidéo" }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(video).not.toHaveAttribute("src");
  await expect(video).not.toHaveAttribute("poster");
  await expect(page.locator(".hero-video-toggle")).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".hero-video-toggle")).toBeVisible();
  await expect(video).not.toHaveAttribute("src");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => !element.paused)).toBe(true);
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
  )).toMatch(/geca-forest-poster-960-[a-f0-9]+\.webp/);
  for (const [label, path] of [
    ["Découvrir nos projets", "/fr/projets"],
    ["Devenir partenaire", "/fr/devenir-partenaire"],
  ]) {
    await page.locator(".hero-actions").getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(path);
    await page.locator(".site-header .brand").click();
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
  )).toMatch(/geca-forest-poster-960-[a-f0-9]+\.webp/);
  await expect(page.locator(".hero-actions a")).toHaveCount(2);
});

test("sans JavaScript : image chargée, message et liens présents", async ({ browser }) => {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
    const page = await context.newPage();
    const mediaRequests: string[] = [];
    page.on("request", (request) => {
      if (/geca-forest(\.mp4|-poster)/.test(request.url())) mediaRequests.push(request.url());
    });
    const imageLoaded = page.waitForResponse((response) =>
      /images-hero-plantation-\d+-[a-f0-9]+\.webp$/.test(response.url()) && response.status() === 200,
    );
    await page.goto("http://127.0.0.1:3000/fr");
    await imageLoaded;
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.locator(".hero-actions a")).toHaveCount(2);
    await expect(page.locator(".hero-visual video")).not.toHaveAttribute("src");
    await expect(page.locator(".hero-video-toggle")).toBeHidden();
    if (width < 768) expect(mediaRequests).toEqual([]);
    else expect(mediaRequests.some((url) => /geca-forest-poster-960-[a-f0-9]+\.webp$/.test(url))).toBe(true);
    await context.close();
  }
});


test("hamburger sur ordinateur : clavier, fermeture, redimensionnement et langue", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr");
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  const menu = page.locator(".menu-toggle");
  await expect(nav).toBeHidden();
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "FR", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(menu).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".hero-video-toggle")).toBeFocused();
  await menu.click();
  await page.setViewportSize({ width: 375, height: 900 });
  await expect(nav).toBeVisible();
  // Le titre est maintenant couvert par le panneau : cliquer la page visible.
  const panel = (await nav.boundingBox())!;
  await page.mouse.click(10, panel.y + panel.height + 10);
  await expect(nav).toBeHidden();
  await menu.click();
  await page.locator("#main-navigation .language-switch").getByRole("link", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL("/en");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});
