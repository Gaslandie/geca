import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('vidéo de publication : lecture FR/EN, téléphone/ordinateur et HTTP privé refusé', async ({ page, request }) => {
  test.skip(process.env.GECA_TEST_PUBLICATION_VIDEO !== 'true', 'Copie jetable contenant une publication vidéo requise.');
  for (const locale of ['fr', 'en']) {
    for (const width of [375, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/actualites/admin-11111111-1111-4111-8111-111111111111/`);
      const video = page.locator('.publication-video video');
      await expect(video).toHaveAttribute('preload', 'none');
      await expect(video).toHaveAttribute('controls', '');
      expect(await video.evaluate((v: HTMLVideoElement) => v.autoplay)).toBe(false);
      await video.scrollIntoViewIfNeeded();
      await video.evaluate(async (v: HTMLVideoElement) => { v.muted = true; await v.play(); });
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.2);
      await video.evaluate((v: HTMLVideoElement) => { v.pause(); v.currentTime = 3; });
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThanOrEqual(3);
      await video.focus();
      await page.keyboard.press('Space');
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
      await video.evaluate((v: HTMLVideoElement) => v.pause());
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).include('.publication-video').analyze()).violations).toEqual([]);
      await page.screenshot({ path: `/tmp/geca-video-public-${locale}-${width}.png` });
      const src = await video.locator('source').getAttribute('src');
      expect(src).toMatch(/^\/videos\/publication-[a-f0-9]{64}\.mp4$/);
      const ranged = await request.get(src!, { headers: { Range: 'bytes=0-99' } });
      expect(ranged.status()).toBe(206);
      expect((await ranged.body()).length).toBe(100);
    }
  }
  for (const path of ['/publication-videos/private.mp4', '/storage/app/private/publication-videos/private.mp4', '/videos/publication-invalid.mp4']) {
    expect((await request.get(path)).status()).toBe(404);
  }
});
