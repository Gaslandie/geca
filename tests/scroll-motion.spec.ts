import { expect, test } from "@playwright/test";

type MotionLog = { target: Element; duration: number; easing: string; frames: Keyframe[]; animation: Animation }[];

for (const locale of ["fr", "en"]) {
  test(`défilement uniforme ${locale} : pages, textes, photos et pied de page`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      const original = Element.prototype.animate;
      const log: MotionLog = [];
      Object.assign(window, { motionLog: log });
      Element.prototype.animate = function (frames, options) {
        const animation = original.call(this, frames, options);
        const timing = animation.effect!.getTiming();
        log.push({ target: this, duration: Number(timing.duration), easing: timing.easing ?? "linear", frames: frames as Keyframe[], animation });
        return animation;
      };
    });
    for (const [path, sample] of [
      ["", locale === "fr" ? ".impact-achievements li" : ".construction-body"],
      ["a-propos", ".about-prose"],
      ["projets", ".portfolio-experience-list li"],
      ["a-propos/domaines-intervention", ".intervention-detail"],
      ["a-propos/mission-vision-valeurs", ".mission-prose, .mission-figure"],
      ["devenir-partenaire", ".partnership-strength-card"],
      ["contact", ".contact-form-panel, .contact-forest"],
      ["actualites", ".news-card"],
    ]) {
      await page.goto(`/${locale}${path ? `/${path}` : ""}`);
      const blocks = page.locator(`${sample}, .footer-grid > *, .footer-bottom`);
      for (const block of await blocks.all()) {
        await block.scrollIntoViewIfNeeded();
        await expect.poll(() => block.evaluate((element) =>
          (window as unknown as { motionLog: MotionLog }).motionLog.filter((entry) => entry.target === element).length,
        )).toBe(1);
      }
      const result = await page.evaluate(() => {
        const log = (window as unknown as { motionLog: MotionLog }).motionLog;
        return {
          nested: log.some((entry) => log.some((other) => other.target !== entry.target && other.target.contains(entry.target))),
          timings: log.every((entry) => [560, 600, 720].includes(entry.duration) && entry.easing === "cubic-bezier(0.2, 0.65, 0.3, 1)"),
          frames: log.every((entry) => String(entry.frames[0].transform).startsWith("translateY(") && String(entry.frames[1].transform).startsWith("translateY(0)") && entry.frames.every((frame) => frame.opacity === undefined)),
        };
      });
      expect(result.nested, path).toBe(false);
      expect(result.timings, path).toBe(true);
      expect(result.frames, path).toBe(true);
      await page.evaluate(() => scrollTo(0, 0));
      await blocks.last().scrollIntoViewIfNeeded();
      expect(await blocks.last().evaluate((element) =>
        (window as unknown as { motionLog: MotionLog }).motionLog.filter((entry) => entry.target === element).length,
      )).toBe(1);
    }
  });
}

test("nouveaux blocs : opt-out, annulation et nettoyage des éléments retirés", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    const connection = Object.assign(new EventTarget(), { saveData: false });
    Object.defineProperty(navigator, "connection", { value: connection, configurable: true });
    const original = Element.prototype.animate;
    const log: MotionLog = [];
    Object.assign(window, { motionLog: log, motionReady: false });
    Element.prototype.animate = function (frames, options) {
      const animation = original.call(this, frames, options);
      Object.assign(window, { motionReady: true });
      if (this.id.startsWith("motion-test")) {
        log.push({ target: this, animation, duration: Number(animation.effect!.getTiming().duration), easing: "", frames: frames as Keyframe[] });
        animation.pause();
      }
      return animation;
    };
  });
  await page.goto("/fr/projets");
  // Insérer après la prise en main de la page par React et SiteMotion.
  await page.waitForFunction(() => (window as unknown as { motionReady: boolean }).motionReady);
  await page.evaluate(() => {
    const block = document.createElement("div");
    block.id = "motion-test-parent";
    block.dataset.reveal = "";
    const child = document.createElement("p");
    child.id = "motion-test-child";
    child.dataset.reveal = "";
    child.textContent = "Bloc ajouté";
    block.append(child);
    document.querySelector("main")!.append(block);
    const excluded = document.createElement("div");
    excluded.id = "motion-test-off";
    excluded.dataset.reveal = "off";
    excluded.textContent = "Bloc sans mouvement";
    document.querySelector("main")!.append(excluded);
  });
  await page.locator("#motion-test-parent").scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as unknown as { motionLog: MotionLog }).motionLog.length)).toBe(1);
  await page.evaluate(() => document.querySelector("#motion-test-parent")!.remove());
  await expect.poll(() => page.evaluate(() => (window as unknown as { motionLog: MotionLog }).motionLog[0].animation.playState)).toBe("idle");
  await page.evaluate(() => {
    const block = document.createElement("div");
    block.id = "motion-test-new";
    block.dataset.reveal = "";
    block.textContent = "Nouveau bloc";
    document.querySelector("main")!.append(block);
  });
  await page.locator("#motion-test-new").scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => (window as unknown as { motionLog: MotionLog }).motionLog.length)).toBe(2);
  await page.evaluate(() => {
    const connection = (navigator as Navigator & { connection: EventTarget & { saveData: boolean } }).connection;
    connection.saveData = true;
    connection.dispatchEvent(new Event("change"));
  });
  await expect.poll(() => page.evaluate(() => (window as unknown as { motionLog: MotionLog }).motionLog[1].animation.playState)).toBe("idle");
  await expect(page.locator("#motion-test-new")).toBeVisible();
});

for (const width of [375, 1440]) {
  test(`titres distincts et cartes coordonnées à ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      const original = Element.prototype.animate;
      const log: { target: Element; duration: number; delay: number; frames: Keyframe[] }[] = [];
      Object.assign(window, { coordinatedMotion: log });
      Element.prototype.animate = function (frames, options) {
        const animation = original.call(this, frames, options);
        const timing = animation.effect!.getTiming();
        log.push({ target: this, duration: Number(timing.duration), delay: timing.delay ?? 0, frames: frames as Keyframe[] });
        return animation;
      };
    });
    await page.goto("/fr");
    await expect.poll(() => page.locator("#hero-title").evaluate((element) =>
      (window as unknown as { coordinatedMotion: { target: Element; duration: number; delay: number; frames: Keyframe[] }[] }).coordinatedMotion
        .filter((entry) => entry.target === element).map((entry) => [entry.duration, entry.delay, entry.frames[0].transform]),
    )).toEqual([[720, 0, "translateY(24px) scale(.96)"]]);
    await page.locator(".team-member").first().scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator(".team-member").first().evaluate((element) =>
      (window as unknown as { coordinatedMotion: { target: Element; duration: number }[] }).coordinatedMotion
        .find((entry) => entry.target === element)?.duration,
    )).toBe(600);
    expect(await page.evaluate(() =>
      (window as unknown as { coordinatedMotion: { delay: number }[] }).coordinatedMotion.every((entry) => entry.delay >= 0 && entry.delay <= 280),
    )).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => page.locator("main").evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
  });
}
