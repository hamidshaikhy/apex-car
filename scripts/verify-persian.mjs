import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
const base = process.env.APEX_PREVIEW_URL || 'http://localhost:5173';
const cars = JSON.parse(readFileSync('src/data/vehicles.json', 'utf8'));
mkdirSync('docs/qa', { recursive: true });
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
  headless: true,
  args: ['--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
const errors = [],
  checks = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text().slice(0, 1000));
});
const pass = (n) => {
  checks.push(n);
  console.log('PASS ' + n);
};
const loaded = () =>
  page.waitForFunction(() => !document.querySelector('.experience-loader'), null, {
    timeout: 180000,
  });
const studioReady = async () => {
  await page.locator('.turntable-canvas canvas').waitFor({ timeout: 120000 });
  await page.waitForFunction(
    () => document.querySelector('.turntable-zoom button')?.disabled === false,
    null,
    { timeout: 180000 },
  );
  await loaded();
};
const noOverflow = async () =>
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    'horizontal page overflow',
  );
try {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: 'docs/qa/loading.png' });
  await loaded();
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.equal(await page.locator('html').getAttribute('lang'), 'fa');
  assert.equal(await page.locator('.cinema-selector button').count(), 4);
  assert.equal(await page.locator('.cinema-copy p,.cinema-copy button').count(), 0);
  for (const [width, height] of [
    [1366, 768],
    [1536, 664],
    [1920, 900],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(120);
    const b = await page.locator('.cinema-hero').boundingBox();
    assert(Math.abs(b.height - height) < 2);
    const track = await page
      .locator('.cinema-selector .active .selector-progress-track')
      .boundingBox();
    assert(track.y + track.height < height);
    await noOverflow();
  }
  pass('Persian/RTL layout, English names/numbers and four hero slides fit three laptop viewports');
  const initial = await page.locator('.cinema-selector .active').getAttribute('aria-label');
  await page.waitForFunction(
    (name) =>
      document.querySelector('.cinema-selector .active')?.getAttribute('aria-label') !== name,
    initial,
    { timeout: 15000 },
  );
  await page.locator('.cinema-slideshow-toggle').click();
  const before = await page
    .locator('.active .selector-progress-fill')
    .evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(400);
  assert.equal(
    await page
      .locator('.active .selector-progress-fill')
      .evaluate((e) => getComputedStyle(e).transform),
    before,
  );
  await page.locator('.cinema-selector button').last().click();
  await page.waitForFunction(
    () => document.querySelector('.cinema-copy h1')?.textContent === 'M4 Competition',
  );
  pass(
    'Hero advances automatically, pauses its eased timeline and synchronizes the large car name',
  );
  await page.locator('.cinema-selector button').first().click();
  await page.mouse.move(10, 10);
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'docs/qa/home-desktop.png' });
  await page.getByRole('button', { name: 'BMW', exact: true }).click();
  await page.locator('.car-card').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('#collection .car-card').count(), 1);
  assert.equal(
    await page.locator('.car-card').evaluate((e) => Number(getComputedStyle(e).opacity)),
    1,
  );
  await page.screenshot({ path: 'docs/qa/collection-reveal.png' });
  await page.getByRole('button', { name: 'ذخیرهٔ BMW M4 Competition', exact: true }).click();
  await page.getByRole('link', { name: 'دیدن BMW M4 Competition', exact: true }).click();
  await page.locator('.vehicle-subnav a[href="#specifications"]').click();
  assert(page.url().includes('#/cars/bmw'));
  await page.getByRole('tab', { name: 'ابعاد و وزن', exact: false }).click();
  await page.waitForFunction(() =>
    document.querySelector('#technical-panel')?.textContent.includes('1,725'),
  );
  await page.getByRole('button', { name: 'ثبت درخواست نمایشی', exact: false }).first().click();
  assert(await page.locator('.enquiry-dialog').evaluate((e) => e.open));
  await page.getByLabel('نام شما', { exact: true }).fill('Hamid');
  await page.getByLabel('ایمیل', { exact: true }).fill('hamid@example.com');
  await page.locator('.checkbox-label input').check();
  await page.getByRole('button', { name: 'ساخت درخواست نمایشی', exact: true }).click();
  assert(await page.getByRole('button', { name: 'دریافت فایل درخواست', exact: false }).isVisible());
  await page.getByRole('button', { name: 'بستن درخواست', exact: true }).click();
  await page.locator('.vehicle-subnav a[href="#gallery"]').click();
  await page.locator('.gallery-main').click();
  assert(await page.locator('.gallery-lightbox').evaluate((e) => e.open));
  await page.keyboard.press('Escape');
  await page.locator('#performance').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'docs/qa/performance-dials.png' });
  await page.screenshot({ path: 'docs/qa/detail-desktop.png', fullPage: true });
  pass('Scroll-revealed cards, filtering, save, detailed specifications, enquiry and gallery work');
  await page.goto(base + '/#/about');
  await loaded();
  await page.locator('.about-opening').waitFor();
  await noOverflow();
  assert.equal(await page.locator('footer img').count(), 0);
  await page.screenshot({ path: 'docs/qa/about-desktop.png', fullPage: true });
  pass('About page is redesigned and the approved footer contains no repeated vehicle photograph');
  await page.goto(base + '/#/studio?car=revuelto');
  await studioReady();
  for (const [width, height] of [
    [1366, 768],
    [1920, 900],
    [1536, 664],
  ]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(200);
    assert(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1));
    await noOverflow();
    const bounds = await page.locator('.turntable-studio').boundingBox();
    assert(Math.abs(bounds.y + bounds.height - height) < 2);
    const canvas = await page.locator('.turntable-canvas').boundingBox();
    assert(Math.abs(canvas.height - bounds.height) < 2, '3D display height was reduced');
  }
  const rail = page.locator('.turntable-cars');
  const metrics = await rail.evaluate((e) => ({
    width: e.clientWidth,
    total: e.scrollWidth,
    item: e.querySelector('button').getBoundingClientRect().width,
  }));
  assert(metrics.item >= 170);
  assert(metrics.total > metrics.width);
  assert(metrics.width > 1000);
  await page.getByRole('button', { name: 'ماشین‌های بعدی', exact: true }).click();
  await page.waitForTimeout(500);
  assert(Math.abs(await rail.evaluate((e) => e.scrollLeft)) > 100);
  await rail.hover();
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(200);
  assert.equal(await page.evaluate(() => scrollY), 0);
  pass(
    'Studio keeps its original full canvas height; large full-width thumbnails scroll horizontally',
  );
  await page.setViewportSize({ width: 1366, height: 768 });
  const railBox = await rail.boundingBox();
  const railBeforeDrag = await rail.evaluate((e) => e.scrollLeft);
  const selectedBeforeDrag = await page.locator('.turntable-cars .active').innerText();
  await page.mouse.move(railBox.x + railBox.width * 0.45, railBox.y + 30);
  await page.mouse.down();
  await page.mouse.move(railBox.x + railBox.width * 0.45 + 240, railBox.y + 30, { steps: 15 });
  await page.mouse.up();
  assert(Math.abs((await rail.evaluate((e) => e.scrollLeft)) - railBeforeDrag) > 150);
  assert.equal(await page.locator('.turntable-cars .active').innerText(), selectedBeforeDrag);
  pass('Dragging vehicle thumbnails with a mouse scrolls the rail without selecting a car');
  for (const car of cars) {
    const button = page.locator('.turntable-cars button').filter({ hasText: car.shortName });
    await button.click();
    await studioReady();
    await page.waitForTimeout(900);
    assert.equal(await page.locator('.turntable-fallback').count(), 0);
    await page.screenshot({ path: `docs/qa/studio-${car.id}-dark.png` });
    await page.getByRole('button', { name: 'جلو', exact: true }).click();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `docs/qa/lights-${car.id}-front.png` });
    await page.getByRole('button', { name: 'پشت', exact: true }).click();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `docs/qa/lights-${car.id}-rear.png` });
    await page.getByRole('button', { name: 'سه‌ربع', exact: true }).click();
    if (car.id === 'mustang') {
      await page.getByRole('button', { name: 'پشت', exact: true }).click();
      await page.waitForTimeout(1800);
      await page.screenshot({ path: 'docs/qa/mustang-rear.png' });
      await page.getByRole('button', { name: 'سه‌ربع', exact: true }).click();
    }
    pass(car.name + ' renders in the 360 studio');
  }
  await page.getByRole('button', { name: 'استودیوی سفید', exact: true }).click();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('html').getAttribute('data-studio-theme'), 'day');
  await page.screenshot({ path: 'docs/qa/studio-day.png' });
  await page.locator('.color-swatches button').last().click();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'چرخش خودکار', exact: true }).click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'توقف چرخش', exact: true }).click();
  await page.keyboard.press('h');
  assert(
    await page
      .locator('.turntable-studio')
      .evaluate((e) => e.classList.contains('is-presentation')),
  );
  await page.screenshot({ path: 'docs/qa/presentation.png' });
  const returnButton = page.getByRole('button', { name: 'نمایش کنترل‌ها (H)', exact: true });
  assert.equal(await returnButton.evaluate((e) => getComputedStyle(e).opacity), '1');
  await returnButton.click();
  assert(
    !(await page
      .locator('.turntable-studio')
      .evaluate((e) => e.classList.contains('is-presentation'))),
  );
  pass('Neutral white studio, paint switching, rotation and H recording mode work');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(900);
  await noOverflow();
  assert(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1));
  await page.screenshot({ path: 'docs/qa/studio-mobile.png' });
  await page.getByRole('link', { name: 'نمایشگاه APEX', exact: true }).click();
  await loaded();
  assert.notEqual(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await noOverflow();
  await page.screenshot({ path: 'docs/qa/home-mobile.png' });
  await page.getByRole('button', { name: 'باز کردن منو', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'منوی اصلی' })
    .getByRole('link', { name: 'مجموعه', exact: true })
    .click();
  await page.getByRole('textbox', { name: 'جست‌وجوی ماشین', exact: true }).fill('Senna');
  assert.equal(await page.locator('.car-card').count(), 1);
  await page.locator('.car-card').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'docs/qa/collection-mobile.png' });
  await page.goto(base + '/#/about');
  await page.locator('.about-opening').waitFor();
  await noOverflow();
  await page.screenshot({ path: 'docs/qa/about-mobile.png', fullPage: true });
  pass(
    'Mobile studio, restored page scrolling, navigation, English-name search and About layout work',
  );
  assert.equal(errors.length, 0, JSON.stringify(errors));
  writeFileSync(
    'docs/qa/results.json',
    JSON.stringify(
      {
        checks,
        errors,
        renderer: 'Brave headless / software WebGL. Physical GPU frame rate not measured.',
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: checks.length, errors }));
} catch (e) {
  await page.screenshot({ path: 'docs/qa/failure.png' }).catch(() => {});
  console.log(JSON.stringify({ checks, errors, failure: e.message }));
  throw e;
} finally {
  await browser.close();
}
