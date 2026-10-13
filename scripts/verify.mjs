import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl']
});

const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
page.on('pageerror', (error) => errors.push(error.message));
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.locator('#scene canvas').waitFor();
await page.screenshot({ path: 'desktop-preview.png', fullPage: true });

await page.getByRole('button', { name: '拆解', exact: true }).click();
const explodeValue = await page.locator('#explode-value').textContent();
await page.getByRole('button', { name: '剖切', exact: true }).click();
const sectionValue = await page.locator('#explode-value').textContent();
await page.locator('[data-layer="bowl"] .visibility-toggle').click();
const bowlVisibility = await page.locator('[data-layer="bowl"] .visibility-toggle').getAttribute('aria-pressed');
await page.locator('#restore-button').click();
const restoredVisibility = await page.locator('[data-layer="bowl"] .visibility-toggle').getAttribute('aria-pressed');

await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: 'mobile-preview.png', fullPage: true });
const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);

console.log(JSON.stringify({ explodeValue, sectionValue, bowlVisibility, restoredVisibility, horizontalOverflow, errors }, null, 2));
await browser.close();

if (explodeValue !== '65%' || sectionValue !== '0%' || bowlVisibility !== 'false' || restoredVisibility !== 'true' || horizontalOverflow || errors.length) {
  process.exitCode = 1;
}
