import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const base = process.env.APEX_PREVIEW_URL || 'http://localhost:5173';
const executablePath = process.env.APEX_BROWSER_EXECUTABLE || 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe';
if (!existsSync(executablePath)) throw new Error('Set APEX_BROWSER_EXECUTABLE to the Brave executable path.');
const directory = resolve('docs/screenshots');
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true, args: ['--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const save = async (name) => { await page.screenshot({ path: resolve(directory, `${name}.png`) }); console.log(`Captured ${name}`); };
const ready = async () => {
  await page.waitForFunction(() => !document.querySelector('.experience-loader'), null, { timeout: 180000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(650);
};
const route = async (path, selector) => {
  await page.evaluate(value => { window.location.hash = value; }, path);
  await page.locator(selector).waitFor({ timeout: 30000 });
  await page.waitForTimeout(600);
};
const section = async (selector, offset = 100) => {
  await page.locator(selector).evaluate((element, gap) => window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - gap, behavior: 'instant' }), offset);
  await page.waitForTimeout(1350);
};
const sceneReady = async () => {
  await page.waitForFunction(() => document.querySelector('.turntable-zoom button')?.disabled === false, null, { timeout: 180000 });
  await ready();
  await page.waitForTimeout(1000);
};
try {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('.experience-loader').first().waitFor();
  await page.waitForTimeout(200);
  await save('loading');
  await ready();
  await page.locator('.cinema-selector button').first().click();
  await page.mouse.move(12, 12);
  await page.waitForTimeout(1400);
  const pause = page.getByRole('button', { name: 'توقف اسلایدهای نمایشگاه', exact: true });
  if (await pause.count()) await pause.click();
  await save('home');
  await page.locator('.cinema-selector button').nth(1).click();
  await page.mouse.move(12, 12); await page.waitForTimeout(1100);
  await save('home-mustang');
  await section('#collection');
  await save('collection');
  await section('#collection .car-card', 100);
  await save('collection-cards');
  await section('.apex-studio-invite', 84);
  await save('home-studio');

  await route('/cars/senna', '.vehicle-cover');
  await save('vehicle');
  await section('#performance', 145);
  await save('performance');
  await section('#engineering', 84);
  await page.getByRole('tab', { name: 'ساختار و شاسی', exact: true }).click();
  await page.waitForTimeout(400);
  await save('engineering');
  await section('#specifications', 145);
  await save('specifications');

  await route('/collection', '.catalog-page');
  for (const name of ['Revuelto', 'Senna', 'Tourbillon']) {
    const card = page.locator('.car-card').filter({ has: page.locator('.card-name', { hasText: name }) });
    await card.locator('.compare-add').click();
  }
  await route('/compare', '.comparison-table');
  await section('.comparison-scroll', 105);
  await save('compare');
  await route('/studio?car=revuelto', '.turntable-studio');
  const clear = page.getByRole('button', { name: 'پاک کردن مقایسه', exact: true });
  if (await clear.count()) await clear.click();
  await sceneReady(); await save('studio-dark');
  await page.getByRole('group', { name: 'انتخاب ماشین', exact: true }).getByRole('button', { name: 'Senna', exact: true }).click();
  await sceneReady(); await save('studio-senna');
  await page.keyboard.press('h'); await page.waitForTimeout(700);
  await save('presentation');
  await page.getByRole('button', { name: 'نمایش کنترل‌ها (H)', exact: true }).click();
  await page.getByRole('group', { name: 'انتخاب ماشین', exact: true }).getByRole('button', { name: '911 Targa 4S', exact: true }).click();
  await sceneReady();
  await page.getByRole('button', { name: 'استودیوی سفید', exact: true }).click();
  await page.waitForTimeout(1500); await save('studio-day');

  await route('/about', '.about-opening');
  await save('about');
  await section('.apex-footer', 400);
  await save('about-footer');

  await page.setViewportSize({ width: 390, height: 844 });
  await route('/', '.cinema-hero');
  await page.locator('.cinema-selector button').first().click();
  await page.mouse.move(5, 5); await page.waitForTimeout(1100);
  const mobilePause = page.getByRole('button', { name: 'توقف اسلایدهای نمایشگاه', exact: true });
  if (await mobilePause.count()) await mobilePause.click();
  await save('mobile-home');
  await section('#collection', 80); await save('mobile-collection');
  await route('/studio?car=amg', '.turntable-studio');
  await sceneReady(); await save('mobile-studio');
  await route('/about', '.about-opening'); await save('mobile-about');
  console.log(`Screenshots saved in ${directory}`);
} finally { await browser.close(); }
