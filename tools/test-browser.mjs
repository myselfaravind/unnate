// Browser checks for the running site. Start the preview first:  MOCK_EMAIL=1 node tools/dev-server.mjs
// then:  node tools/test-browser.mjs        (needs Playwright with Chromium: npm i playwright && npx playwright install chromium)
// Checks every page at phone, tablet and desktop widths for errors, failed requests and sideways overflow,
// then routes, navigation, forms, the project viewer, film previews and reduced motion.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')); }
const BASE = process.env.BASE || 'http://localhost:8788';
const PAGES = ['/', '/clinical-websites/', '/final-year-projects/', '/work/', '/no-such-page/'];
const WIDTHS = [320, 375, 390, 430, 768, 1280, 1440, 1680];
let failures = 0;
const ok = (cond, msg) => { console.log(cond ? '  ✓' : '  ✗', msg); if (!cond) failures++; };
const browser = await chromium.launch(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {});

const scrollThrough = async page => {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await page.mouse.wheel(0, 500); await page.waitForTimeout(60); }
  await page.waitForTimeout(400);
};

console.log('Pages × widths');
for (const path of PAGES) {
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: w < 700 ? 800 : 900 }, hasTouch: w < 700, isMobile: w < 700 });
    const errs = [];
    page.on('pageerror', e => errs.push('error: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/404 \(Not Found\)/.test(m.text())) errs.push('console: ' + m.text()); });
    page.on('requestfailed', r => { if (!/\.mp4/.test(r.url())) errs.push('failed: ' + r.url()); });
    page.on('response', r => { if (r.status() >= 400 && r.url() !== BASE + path) errs.push(`${r.status()}: ${r.url()}`); });
    await page.goto(BASE + path, { waitUntil: 'load' });
    await scrollThrough(page);
    const wide = await page.evaluate(() => {
      const W = document.documentElement.clientWidth, out = [];
      if (document.documentElement.scrollWidth > W + 1) out.push('page scrollWidth ' + document.documentElement.scrollWidth);
      for (const el of document.querySelectorAll('main *, footer *')) {
        if (el.closest('.rail, .filters, .notes, .ln, svg, .v-behind, .tabbar, .eye-lens, .lens-view')) continue;
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > W + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed') {
          // ignore things clipped by an overflow-hidden ancestor
          let p = el.parentElement, clipped = false;
          while (p && p !== document.body) { const o = getComputedStyle(p); if (/(hidden|clip)/.test(o.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= W + 1 && pr.left >= -1) { clipped = true; break; } } p = p.parentElement; }
          if (!clipped) out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${Math.round(r.left)}→${Math.round(r.right)}`);
        }
      }
      return out.slice(0, 6);
    });
    ok(!errs.length && !wide.length, `${path} @${w}px ${errs.concat(wide).join(' | ')}`);
    await page.close();
  }
}

console.log('Routes');
for (const [from, status, to] of [['/final-year-projects', 301, '/final-year-projects/'], ['/clinical-websites', 301, '/clinical-websites/'], ['/work', 301, '/work/'], ['/nope', 404], ['/demos/maren-dental-studio/', 200], ['/demos/oddcart/', 200], ['/demos/tickpic-moments/', 200], ['/sitemap.xml', 200], ['/robots.txt', 200]]) {
  const r = await fetch(BASE + from, { redirect: 'manual' });
  ok(r.status === status && (!to || r.headers.get('location') === to), `${from} → ${r.status}${to ? ' ' + r.headers.get('location') : ''}`);
}

console.log('Navigation');
{
  const page = await browser.newPage({ viewport: { width: 390, height: 800 }, hasTouch: true, isMobile: true });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.click('.nav-toggle');
  ok(await page.isVisible('#nav-sheet'), 'mobile menu opens');
  ok(await page.evaluate(() => { const s = document.querySelector('#nav-sheet'), w = s.clientWidth; return getComputedStyle(s).display === 'grid' && [...s.querySelectorAll('a')].every(a => a.getBoundingClientRect().width > w * .8); }), 'menu items stack full width');
  await page.click('#nav-sheet a[href="/clinical-websites/"]');
  await page.waitForURL('**/clinical-websites/');
  ok(true, 'menu link reaches /clinical-websites/');
  await page.goBack(); await page.waitForURL(BASE + '/');
  ok(page.url() === BASE + '/', 'back button returns home');
  await page.goForward(); await page.waitForURL('**/clinical-websites/');
  ok(page.url().endsWith('/clinical-websites/'), 'forward button works');
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.keyboard.press('Tab');
  ok(await page.evaluate(() => document.activeElement.classList.contains('skip')), 'first Tab reaches “Skip to content”');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  ok(outline !== 'none', 'focused element has a visible outline');
  await page.click('.hero .btn-primary');
  await page.waitForTimeout(900);
  ok(await page.evaluate(() => document.activeElement.id === 'f-name'), '“Connect with us” moves focus to the form');
  await page.close();
}

console.log('Forms');
const formCase = async (path, fill, sentText) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + path + '#contact', { waitUntil: 'load' });
  const form = page.locator('#contact [data-form]');
  await form.locator('button[type=submit]').click();
  const errs = await form.locator('.err').count();
  ok(errs > 0, `${path}: empty submit shows ${errs} field errors`);
  ok(await page.evaluate(() => document.activeElement.getAttribute('aria-invalid') === 'true'), `${path}: focus moves to the first invalid field`);
  for (const [sel, v] of fill) await form.locator(sel).fill(v);
  await form.locator('input[type=checkbox]').first().check();
  await form.locator('button[type=submit]').click();
  await page.waitForSelector('#contact [data-view=sent]:not([hidden])', { timeout: 5000 }).catch(() => {});
  const sent = await page.isVisible('#contact [data-view=sent]');
  ok(sent, `${path}: valid submit shows the success message (server confirmed)`);
  if (sent) ok((await page.textContent('#contact [data-view=sent]')).includes(sentText), `${path}: success text is right`);
  await page.close();
};
await formCase('/', [['[name=name]', 'Test Person'], ['[name=email]', 'test@example.com'], ['[name=company]', 'Test Co'], ['[name=message]', 'A website.']], 'Thanks for reaching out');
await formCase('/clinical-websites/', [['[name=name]', 'Dr Test'], ['[name=email]', 'dr@example.com'], ['[name=clinic]', 'Test Dental'], ['[name=message]', 'A new site.']], 'Thank you');
await formCase('/final-year-projects/', [['[name=name]', 'Student'], ['[name=email]', 'student@example.com'], ['[name=message]', 'A booking system.']], 'Got it');
{
  // the server rejects: the form must say so and keep what was typed
  const page = await browser.newPage();
  await page.route('**/api/enquiry', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{"ok":false,"error":"not_configured"}' }));
  await page.goto(BASE + '/final-year-projects/#contact', { waitUntil: 'load' });
  await page.fill('#s-name', 'Student'); await page.fill('#s-email', 'student@example.com'); await page.fill('#s-msg', 'Idea');
  await page.click('#contact button[type=submit]');
  await page.waitForSelector('.form-alert:not([hidden])');
  ok(!(await page.isVisible('[data-view=sent]')) && (await page.inputValue('#s-msg')) === 'Idea', 'a failed send shows an error, not success, and keeps the text');
  await page.close();
}

console.log('Contact details and delivery');
{
  // with two addresses in config.js, both appear on the contact card and in the footer
  const page = await browser.newPage({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  await page.route('**/assets/js/config.js', r => r.fulfill({ contentType: 'text/javascript', body: "window.UNNATE_CONFIG={enquiryEndpoint:'/api/enquiry',emails:['first@example.test','second@example.test']};" }));
  const posts = [];
  await page.route('**/api/enquiry', async r => { posts.push(JSON.parse(r.request().postData())); await new Promise(z => setTimeout(z, 400)); r.fulfill({ contentType: 'application/json', body: '{"ok":true}' }); });
  for (const path of ['/', '/clinical-websites/', '/final-year-projects/']) {
    await page.goto(BASE + path, { waitUntil: 'load' });
    const card = await page.$$eval('#contact [data-direct] a', as => as.map(a => a.getAttribute('href')));
    const foot = await page.$$eval('.foot [data-connect] a[href^="mailto:"]', as => as.map(a => a.getAttribute('href')));
    ok(card.join() === 'mailto:first@example.test,mailto:second@example.test' && foot.length === 2, `${path}: both email addresses shown on the contact card and in the footer`);
  }
  await page.fill('#s-name', 'Student'); await page.fill('#s-email', 'student@example.com'); await page.fill('#s-msg', 'Idea');
  await page.click('#contact button[type=submit]'); await page.click('#contact button[type=submit]', { force: true }).catch(() => {});
  await page.waitForSelector('#contact [data-view=sent]:not([hidden])');
  ok(posts.length === 1, `a double tap sends one request (${posts.length})`);
  ok(posts[0].kind === 'student' && posts[0].page === '/final-year-projects/' && !!posts[0].title && !!posts[0].submission_id, 'the request carries the form kind, page, page title and a submission id');
  await page.close();
}
{
  const page = await browser.newPage();
  await page.goto(BASE + '/', { waitUntil: 'load' });
  ok(await page.$$eval('#contact [data-direct]', d => d.length === 0) && await page.$$eval('.foot [data-connect] a[href^="mailto:"]', a => a.length === 0), 'with no addresses configured, no empty email links are shown');
  await page.close();
}

console.log('Work, viewer and films');
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  const n = await page.locator('#work .rail .slide').count();
  const counts = await page.evaluate(() => ({ featured: UNNATE_PORTFOLIO.filter(p => p.featured).length, all: UNNATE_PORTFOLIO.length, health: UNNATE_PORTFOLIO.filter(p => (p.tags || []).includes('healthcare')).length, web: UNNATE_PORTFOLIO.filter(p => p.group === 'Websites').length }));
  ok(n === counts.featured, `homepage rail shows all ${n} featured projects`);
  const card = page.locator('#work a[data-id="solara-drinks"]');
  // Playwright's own Chromium has no H.264 decoder; real Chrome, Safari, Edge and Firefox do.
  const h264 = await page.evaluate(() => !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"'));
  await card.scrollIntoViewIfNeeded(); await card.hover();
  await page.waitForTimeout(1500);
  if (h264) {
    ok(await page.evaluate(() => { const v = document.querySelector('a[data-id="solara-drinks"] video'); return !!v && !v.paused && v.readyState >= 2; }), 'hovering a film card plays its muted preview');
    ok(await page.evaluate(() => document.querySelectorAll('.thumb video').length === 1), 'only the hovered film has loaded a preview');
  } else {
    console.log('  – film playback checks skipped: this browser cannot decode H.264 (use real Chrome: CHANNEL=chrome)');
    ok(await page.evaluate(() => document.querySelectorAll('.thumb video').length === 0), 'a preview the browser cannot play is removed, the poster stays');
  }
  await card.click();
  await page.waitForSelector('#viewer[open] video');
  if (h264) {
    await page.waitForFunction(() => document.querySelector('#viewer video').readyState >= 1, null, { timeout: 5000 }).catch(() => {});
    ok(await page.evaluate(() => document.querySelector('#viewer video').readyState >= 1), 'the viewer loads the full film');
  } else {
    await page.waitForSelector('#viewer .missing', { timeout: 5000 }).catch(() => {});
    ok(await page.isVisible('#viewer .missing'), 'a film the browser cannot play says so instead of showing a dead player');
  }
  await page.keyboard.press('Escape');
  ok(!(await page.isVisible('#viewer[open]')), 'Escape closes the viewer');
  ok(await page.evaluate(() => document.activeElement.dataset.id === 'solara-drinks'), 'focus returns to the card');
  await page.click('[data-allwork]');
  await page.waitForTimeout(600);                                     // the change runs inside a view transition
  ok(await page.locator('#work .rail .slide').count() === counts.all, `“See all our work” shows all ${counts.all} projects`);
  ok(await page.evaluate(() => [...document.querySelectorAll('img')].every(i => !/skin-in-progress|dental-clinical-creative|unnate-creatives|beauty-spa/.test(i.src))), 'no unapproved creative appears on the homepage');
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/work/#maren-dental-studio', { waitUntil: 'load' });
  await page.waitForSelector('#viewer[open]');
  ok((await page.textContent('#viewer-title')).includes('Maren'), '/work/#maren-dental-studio opens Maren directly');
  ok(await page.isVisible('#viewer a[href="/demos/maren-dental-studio/"]'), 'Maren’s viewer links to the working demo');
  ok((await page.textContent('#viewer .demo-note')).includes('placeholders'), 'Maren is labelled as a demo with placeholder content');
  await page.keyboard.press('Escape');
  await page.click('[data-filter="Websites"]');
  await page.waitForTimeout(600);
  ok(await page.locator('.rail .slide').count() === 3, 'the Websites filter shows the 3 websites');
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/clinical-websites/', { waitUntil: 'load' });
  await page.click('#mt3');
  ok(await page.isVisible('#mp3') && !(await page.isVisible('#mp1')), 'Maren screen tabs switch panels');
  await page.keyboard.press('ArrowRight');
  ok(await page.isVisible('#mp4'), 'arrow keys move between Maren tabs');
  const health = await page.evaluate(() => UNNATE_PORTFOLIO.filter(p => (p.tags || []).includes('healthcare')).length);
  ok(await page.locator('#more .rail .slide').count() === health, `the clinic rail shows the ${health} healthcare projects`);
  await page.close();
}

console.log('Reduced motion');
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  for (const path of ['/', '/clinical-websites/', '/final-year-projects/']) {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('h1, h1 *, .lede, .ctas, [data-reveal], [data-stagger] > *')].filter(e => !e.closest('.eye-lens') && getComputedStyle(e).opacity === '0').length);
    ok(hidden === 0, `${path}: with reduced motion nothing waits hidden (${hidden} hidden)`);
    await page.close();
  }
  await ctx.close();
}

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nAll browser checks passed.');
process.exit(failures ? 1 : 0);
