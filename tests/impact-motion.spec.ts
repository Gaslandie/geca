import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { homeContent } from "../src/content/site";

test("hero : apparition commune, arrêt au clavier et aucune répétition", async ({ page }) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    Object.assign(window, { heroRevealCalls: 0, heroReveal: null });
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args);
      if (this.classList.contains("hero-grid")) {
        const state = window as unknown as { heroRevealCalls: number; heroReveal: Animation };
        state.heroRevealCalls++;
        state.heroReveal = animation;
        animation.pause();
        animation.currentTime = 0;
      }
      return animation;
    };
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/fr");
  await expect.poll(() => page.evaluate(() =>
    (window as unknown as { heroRevealCalls: number }).heroRevealCalls,
  )).toBe(1);
  const offset = () => page.locator(".hero-grid").evaluate((element) =>
    new DOMMatrixReadOnly(getComputedStyle(element).transform).m42,
  );
  expect(await offset()).toBe(12);
  expect(await page.locator(".hero-grid").evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const duration = await page.evaluate(() => {
    const animation = (window as unknown as { heroReveal: Animation }).heroReveal;
    const duration = Number(animation.effect!.getComputedTiming().duration);
    animation.currentTime = duration / 2;
    return duration;
  });
  expect(duration).toBe(480);
  expect(await offset()).toBeGreaterThan(0);
  expect(await offset()).toBeLessThan(12);
  await page.locator(".hero-actions a").first().focus();
  await expect.poll(offset).toBe(0);
  await page.locator(".impact").scrollIntoViewIfNeeded();
  await page.locator(".hero").scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => (window as unknown as { heroRevealCalls: number }).heroRevealCalls)).toBe(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.locator(".hero").evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
});

for (const width of [320, 768, 1440]) {
  test(`impact ${width}px : photo continue, cartes empilées et texte agrandi`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/fr");
    const section = page.locator(".impact");
    await section.scrollIntoViewIfNeeded();
    const cards = section.locator(".stat");
    await expect(cards).toHaveCount(4);
    await expect(section.locator(".stat-value")).toHaveText(["35 000", "365 000", "150 000", "84"]);
    await expect(section.locator(".stat-label")).toHaveText(["arbres plantés en 2019", "arbres plantés en 2020", "arbres plantés en 2021", "collectivités accompagnées"]);
    await expect(section.locator(".impact-achievements li")).toHaveText([...homeContent.impact.achievements]);
    await expect(section.getByText("Image temporaire", { exact: true })).toBeVisible();
    const heading = (await section.locator(".impact-heading").boundingBox())!;
    const first = (await cards.first().boundingBox())!;
    expect(first.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    const sectionBox = (await section.boundingBox())!;
    expect(heading.x + heading.width / 2).toBeCloseTo(sectionBox.x + sectionBox.width / 2, 0);
    for (let index = 1; index < 4; index++) {
      const previous = (await cards.nth(index - 1).boundingBox())!;
      const current = (await cards.nth(index).boundingBox())!;
      expect(current.y).toBeGreaterThan(previous.y + previous.height);
    }
    const background = (await section.locator(".impact-photo").boundingBox())!;
    const box = (await section.boundingBox())!;
    expect(background).toEqual(box);
    expect((await new AxeBuilder({ page }).include(".impact").analyze()).violations).toEqual([]);
    await section.screenshot({ path: `/tmp/geca-impact-new-${width}.png` });
    await page.addStyleTag({ content: ":root { font-size: 200%; }" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test("apparitions : une seule lecture, préférence modifiée et contenu toujours visible", async ({ page }) => {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    const log: string[] = [];
    Object.assign(window, { gecaMotionCalls: log });
    Element.prototype.animate = function (...args) {
      log.push(this.className);
      return animate.apply(this, args);
    };
  });
  await page.goto("/fr");
  await page.locator(".impact").scrollIntoViewIfNeeded();
  const statCalls = () => page.evaluate(() => (window as unknown as { gecaMotionCalls: string[] }).gecaMotionCalls.filter((name) => name.split(" ").includes("stat")).length);
  for (const card of await page.locator(".stat").all()) await card.scrollIntoViewIfNeeded();
  await expect.poll(statCalls).toBe(4);
  expect(await page.locator(".stat").first().evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
  await page.locator(".hero").scrollIntoViewIfNeeded();
  await page.locator(".impact").scrollIntoViewIfNeeded();
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await statCalls()).toBe(4);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => page.locator(".impact").evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  await expect(page.locator(".impact .stat-value")).toHaveText(["35 000", "365 000", "150 000", "84"]);
  const before = await statCalls();
  await page.locator(".hero").scrollIntoViewIfNeeded();
  await page.locator(".impact").scrollIntoViewIfNeeded();
  expect(await statCalls()).toBe(before);
  expect(await page.locator(".stat").first().evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator(".menu-toggle").click();
  expect(await page.locator(".main-nav").evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
});

for (const mode of ["reduce", "saveData", "unsupported", "noAnimate"] as const) {
  test(`contenu visible sans apparitions : ${mode}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript((selected) => {
      if (selected === "saveData") Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
      if (selected === "unsupported") Object.defineProperty(window, "IntersectionObserver", { value: undefined, configurable: true });
      if (selected === "noAnimate") {
        Object.defineProperty(Element.prototype, "animate", { value: undefined, configurable: true });
        Object.assign(window, { gecaMotionCalls: [] });
        return;
      }
      const animate = Element.prototype.animate;
      const log: string[] = [];
      Object.assign(window, { gecaMotionCalls: log });
      Element.prototype.animate = function (...args) {
        log.push(this.className);
        return animate.apply(this, args);
      };
    }, mode);
    if (mode === "reduce") await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fr");
    await page.locator(".impact").scrollIntoViewIfNeeded();
    await expect(page.locator("#impact-title")).toBeVisible();
    await expect(page.locator(".stat-value")).toHaveText(["35 000", "365 000", "150 000", "84"]);
    expect(await page.evaluate(() => (window as unknown as { gecaMotionCalls: string[] }).gecaMotionCalls)).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const [path, selectors] of [
  ["/fr", ".domain, .stat, .project-card, .news-card, .event-card, .partner-list li, .cta-grid > div"],
  ["/fr/a-propos", ".about-since, .about-conviction, .about-purpose-card, .about-steps li, .about-domain-grid li"],
  ["/fr/projets", ".portfolio-project"],
  ["/fr/a-propos/domaines-intervention", ".intervention-detail"],
  ["/fr/contact", ".contact-details-grid > div"],
  ["/fr/devenir-partenaire", ".partnership-strength-card"],
  ["/fr/a-propos/mission-vision-valeurs", ".mission-value-card"],
]) {
  test(`cartes ${path} : apparition unique, relief et réduction des mouvements`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      const animate = Element.prototype.animate;
      const calls = new Map<Element, number>();
      Object.assign(window, { cardMotionCalls: calls });
      Element.prototype.animate = function (...args) {
        calls.set(this, (calls.get(this) ?? 0) + 1);
        return animate.apply(this, args);
      };
    });
    await page.goto(path);
    const cards = page.locator(`main :is(${selectors})`);
    expect(await cards.count()).toBeGreaterThan(0);
    for (const card of await cards.all()) {
      await card.scrollIntoViewIfNeeded();
      await expect.poll(() => card.evaluate((element) =>
        (window as unknown as { cardMotionCalls: Map<Element, number> }).cardMotionCalls.get(element) ?? 0,
      )).toBe(1);
      await card.evaluate(async (element) => {
        await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => {})));
      });
      expect(await card.evaluate((element) => getComputedStyle(element).opacity)).toBe("1");
      await card.hover();
      await expect.poll(() => card.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
      await page.mouse.move(0, 0);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await cards.last().scrollIntoViewIfNeeded();
    expect(await cards.last().evaluate((element) =>
      (window as unknown as { cardMotionCalls: Map<Element, number> }).cardMotionCalls.get(element),
    )).toBe(1);
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const card of await cards.all()) {
      expect(await card.evaluate((element) => element.getAnimations().length)).toBe(0);
      expect(await card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe("0s");
    }
    await page.reload();
    await cards.last().scrollIntoViewIfNeeded();
    expect(await cards.last().evaluate((element) =>
      (window as unknown as { cardMotionCalls: Map<Element, number> }).cardMotionCalls.get(element) ?? 0,
    )).toBe(0);
    await expect(cards.last()).toBeVisible();
  });
}
