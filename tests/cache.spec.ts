import { test, expect } from '@playwright/test';
import variants from '../src/content/image-variants.json';

const image = Object.values(variants)[0][0].src;
const immutable = 'public, max-age=31536000, immutable';

test('cache : image versionnée, validation 304, fichier mutable et refus', async ({ request }) => {
  const first = await request.get(image);
  expect(first.status()).toBe(200);
  expect(first.headers()['cache-control']).toBe(immutable);
  expect(first.headers()['etag']).toBeTruthy();
  const valid = await request.get(image, { headers: { 'If-None-Match': first.headers()['etag'] } });
  expect(valid.status()).toBe(304);
  expect((await valid.body()).length).toBe(0);
  expect(valid.headers()['cache-control']).toBe(immutable);
  const changed = await request.get(image, { headers: { 'If-None-Match': '"ancienne-version"' } });
  expect(changed.status()).toBe(200);
  expect((await changed.body()).length).toBeGreaterThan(0);
  expect((await request.get('/icon.svg')).headers()['cache-control']).not.toContain('immutable');
  for (const path of ['/images/optimized/absent-123456789abc.webp', '/.env', '/backoffice/database/database.sqlite']) {
    const denied = await request.get(path);
    expect(denied.status()).toBe(404);
    expect(denied.headers()['cache-control']).toContain('no-store');
    expect(denied.headers()['cache-control']).not.toContain('immutable');
  }
});

test('cache navigateur : seconde visite sans retransfert des ressources communes', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, reducedMotion: 'reduce', viewport: { width: 375, height: 900 } });
  const page = await context.newPage();
  const resources = async () => page.evaluate(() => performance.getEntriesByType('resource')
    .filter((entry) => /\.(woff2|css|js|webp)$/.test(entry.name))
    .map((entry) => { const r = entry as PerformanceResourceTiming; return { name: r.name, transfer: r.transferSize, body: r.encodedBodySize }; }));
  await page.goto('/fr');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.hero-slide img').first().evaluate(image => (image as HTMLImageElement).decode());
  const cold = await resources();
  expect(cold.some(r => r.transfer > 0)).toBe(true);
  await page.goto('about:blank');
  await page.goto('/fr');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.hero-slide img').first().evaluate(image => (image as HTMLImageElement).decode());
  const warm = (await resources()).filter(r => cold.some(c => c.name === r.name && c.body > 0));
  for (const extension of ['.woff2', '.css', '.js', '.webp']) expect(warm.some(r => r.name.endsWith(extension))).toBe(true);
  expect(warm.length).toBeGreaterThan(5);
  for (const resource of warm) expect(resource.transfer, resource.name).toBe(0);
  console.log(JSON.stringify({ cachedResources: warm.length, bytesAvoided: warm.reduce((sum, r) => sum + r.body, 0) }));
  await context.close();
});
