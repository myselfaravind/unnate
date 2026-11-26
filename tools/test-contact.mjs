// Browser checks for the one-click email contact ("Let's talk"). Start the preview first:  node tools/dev-server.mjs
// then:  node tools/test-contact.mjs        (needs Playwright with Chromium: npm i playwright && npx playwright install chromium)
// No email is sent: the buttons are mailto: links, which only open the visitor's own email app. This headless browser
// has no email app, so it reports the hand-off as an aborted request; that is expected and ignored.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')); }
const BASE = process.env.BASE || 'http://localhost:8788';
const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAIN = ['/', '/websites/', '/software/', '/pricing/', '/work/', '/process/', '/about/', '/start/', '/privacy/', '/terms/', '/qa/'];
let failures = 0;
const ok = (group, cond, msg) => { console.log(cond ? '  \u2713' : '  \u2717', msg); if (!cond) failures++; };
const browser = await chromium.launch(process.env.CHANNEL ? { channel: process.env.CHANNEL } : {});
const page = async (w = 1280, h = 900) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') p.errs.push('console: ' + m.text()); });
  p.on('requestfailed', r => { if (!r.url().startsWith('mailto:')) p.errs.push('failed: ' + r.url()); });
  p.on('response', r => { if (r.status() >= 400) p.errs.push(`${r.status()}: ${r.url()}`); });
  p.closeAll = () => ctx.close();
  return p;
};

console.log('Contact (one-click email)');
// one-click email ("Let's talk"). No forms on the main pages; every contact button opens the visitor's
// email app with a ready message to the studio address in config.js. Nothing is sent by the site itself.
{
  const ADDR = 'aravind@unnate.com';
  const SUBJ = {
    general: 'Project enquiry — UNNATE', website: 'Website enquiry — UNNATE', software: 'Software enquiry — UNNATE',
    'one-page': 'Enquiry: One Page website — UNNATE', 'five-pages': 'Enquiry: Five Pages website — UNNATE',
    'five-pages-written': 'Enquiry: Five Pages, Written website — UNNATE', tracker: 'Enquiry: Workflow Tracker — UNNATE',
    'operations-app': 'Enquiry: Operations App — UNNATE', 'custom-system': 'Enquiry: Custom System — UNNATE', question: 'Question — UNNATE',
  };
  const parse = href => {
    const u = new URL(href);
    return { proto: u.protocol, to: decodeURIComponent(u.pathname), subject: u.searchParams.get('subject'), body: u.searchParams.get('body'), keys: [...u.searchParams.keys()] };
  };
  const cfg = readFileSync(`${SITE}/assets/js/config.js`, 'utf8');
  ok('Contact', new RegExp(`emails:\\s*\\[\\s*'${ADDR.replace('.', '\\.')}'`).test(cfg), `config.js lists ${ADDR} first (the address every button uses)`);
  const all = [];
  for (const u of MAIN) {
    const p = await page(); await p.goto(BASE + u);
    const html = await p.content();
    ok('Contact', (await p.$$('form')).length === 0, `${u}: no form on the page`);
    ok('Contact', !/formsubmit/i.test(html) && !/href="\/start\/\?/.test(html), `${u}: no FormSubmit code and no old form links`);
    const head = await p.$$eval('header a[data-mailto]', as => as.map(a => ({ text: a.textContent.trim(), label: a.getAttribute('aria-label'), href: a.href })));
    ok('Contact', head.length === 1 && head[0].text === "Let's talk" && parse(head[0].href).subject === SUBJ.general, `${u}: header has one “Let’s talk” email button`);
    const links = await p.$$eval('a[data-mailto]', as => as.map(a => ({ text: a.textContent.replace(/\s+/g, ' ').trim(), label: a.getAttribute('aria-label') || '', href: a.href, vis: !!(a.offsetWidth || a.offsetHeight) })));
    for (const l of links) all.push({ page: u, ...l, ...parse(l.href) });
    ok('Contact', links.every(l => l.label.toLowerCase().startsWith(l.text.toLowerCase()) && /email/i.test(l.label)), `${u}: every email button's spoken name starts with its visible words and says it opens an email (${links.length})`);
    const old = await p.$$eval('a', as => as.filter(a => !a.hasAttribute('data-mailto') && /^(start a( website| software)? project|choose |connect with us)/i.test(a.textContent.trim())).map(a => a.textContent.trim()));
    ok('Contact', old.length === 0, `${u}: no call to action still points at a form` + (old.length ? ` (${old.join(', ')})` : ''));
    await p.closeAll();
  }
  const bad = all.filter(l => l.proto !== 'mailto:' || l.to !== ADDR || !Object.values(SUBJ).includes(l.subject) || l.keys.join() !== 'subject,body');
  ok('Contact', all.length > 0 && bad.length === 0, `all ${all.length} email buttons go to ${ADDR} with a known subject and a message` + (bad.length ? ` (${bad.slice(0, 2).map(b => b.page + ' ' + b.text).join(', ')})` : ''));
  const bodyOk = l => l.subject === SUBJ.question ? l.body === 'Hi UNNATE,\r\n\r\nI have a quick question:\r\n\r\n'
    : /^Hi UNNATE,\r\n\r\nI'm interested in .+\. I'd like to know how you could help my business\.\r\n\r\nLet's talk!$/.test(l.body);
  ok('Contact', all.every(bodyOk), 'every message starts “Hi UNNATE,” and has the agreed wording, with proper line breaks');
  const pr = all.filter(l => l.page === '/websites/' || l.page === '/software/');
  for (const [text, key] of [['Choose One Page', 'one-page'], ['Choose Five Pages', 'five-pages'], ['Choose Written', 'five-pages-written'], ['Start with a Tracker', 'tracker'], ['Scope an Operations App', 'operations-app'], ['Talk about a Custom System', 'custom-system']]) {
    const l = pr.find(x => x.text.startsWith(text));
    ok('Contact', !!l && l.subject === SUBJ[key] && l.body.includes(SUBJ[key].replace(/^Enquiry: | — UNNATE$/g, '').replace(/ website$/, '')), `${l ? l.page : '?'}: package button “${text}” opens an email about that package`);
  }
  ok('Contact', all.some(l => l.page === '/websites/' && l.subject === SUBJ.website) && all.some(l => l.page === '/software/' && l.subject === SUBJ.software), 'websites and software pages ask about their own service');
  ok('Contact', all.some(l => l.page === '/' && l.text.startsWith('Ask us something else') && l.subject === SUBJ.question), 'home: “Ask us something else” opens a short question email');
  // /start/: the preview matches what opens
  const s = await page(); await s.goto(BASE + '/start/');
  const prev = await s.$$eval('.mail-preview .mp-row', r => r.map(x => x.textContent.replace(/\s+/g, ' ').trim()));
  ok('Contact', prev.some(t => t.includes(ADDR)) && prev.some(t => t.includes(SUBJ.general)), '/start/: the preview shows the real address and subject');
  ok('Contact', (await s.textContent('.mail-preview')).includes("I'd like to know how you could help my business"), '/start/: the preview shows the real message');
  // keyboard: Tab reaches the big button, it has a visible focus ring, Enter activates it
  await s.evaluate(() => { window.__go = []; document.addEventListener('click', e => { const a = e.target.closest('a[data-mailto]'); if (a) window.__go.push(a.href); }, true); });
  const big = s.locator('.talk-card a[data-mailto]');
  await big.focus();
  const ring = await big.evaluate(a => { const c = getComputedStyle(a); return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2; });
  ok('Contact', ring, '/start/: the email button shows a focus ring for keyboard users');
  await s.keyboard.press('Enter'); await s.waitForTimeout(300);
  const went = await s.evaluate(() => window.__go);
  ok('Contact', went.length === 1 && parse(went[0]).subject === SUBJ.general, 'Enter on the email button opens the ready email');
  ok('Contact', s.url() === BASE + '/start/' && s.errs.length === 0, 'opening the email leaves the page where it was, with no errors');
  // fallback: no email app (the page keeps focus) → a note with the address and a copy button appears
  await s.waitForSelector('.mail-toast.on', { timeout: 4000 }).catch(() => {});
  ok('Contact', await s.isVisible('.mail-toast.on') && (await s.textContent('.mail-toast')).includes(ADDR) && (await s.getAttribute('.mail-toast', 'role')) === 'status', 'no email app: a note shows the address (announced to screen readers)');
  await s.keyboard.press('Escape'); await s.waitForTimeout(400);
  ok('Contact', !(await s.isVisible('.mail-toast.on')), 'Escape closes the note');
  await s.closeAll();
  // an email app did open (the page lost focus) → no note
  const t = await page(); await t.goto(BASE + '/pricing/');
  await t.evaluate(() => document.querySelector('a[data-mailto]').addEventListener('click', () => setTimeout(() => dispatchEvent(new Event('blur')), 200)));
  await t.click('header a[data-mailto]'); await t.waitForTimeout(2200);
  ok('Contact', !(await t.isVisible('.mail-toast.on')), 'when the email app opens, no note appears');
  await t.closeAll();
  // copy buttons (clipboard permission granted, as a browser does after a click)
  for (const [w, mob] of [[1280, false], [390, true]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 860 }, isMobile: mob, hasTouch: mob, permissions: ['clipboard-read', 'clipboard-write'] });
    const c = await ctx.newPage(); await c.goto(BASE + '/');
    const btn = c.locator('[data-mailhint] .copy').first();
    ok('Contact', (await btn.getAttribute('aria-label'))?.includes(ADDR), `${w}px: the copy button names the address it copies`);
    mob ? await btn.tap() : await btn.click();
    await c.waitForTimeout(200);
    ok('Contact', (await c.evaluate(() => navigator.clipboard.readText())) === ADDR && (await btn.textContent()).trim() === 'Copied', `${w}px: Copy puts ${ADDR} on the clipboard and says “Copied”`);
    const hero = c.locator('main a[data-mailto]').first(); const box = await hero.boundingBox();
    ok('Contact', box && box.height >= 44 && box.x >= 0 && box.x + box.width <= w, `${w}px: the first email button is fully on screen and at least 44px tall (${box && Math.round(box.height)}px)`);
    const cb = await btn.boundingBox();
    ok('Contact', cb && cb.height >= 24 && cb.width >= 24, `${w}px: the copy button is a comfortable target (${cb && Math.round(cb.width)}×${cb && Math.round(cb.height)}px)`);
    await c.goto(BASE + '/start/'); await c.click('.talk-card a[data-mailto]');
    await c.waitForSelector('.mail-toast.on', { timeout: 4000 }).catch(() => {});
    await c.click('.mail-toast .copy'); await c.waitForTimeout(200);
    ok('Contact', (await c.evaluate(() => navigator.clipboard.readText())) === ADDR, `${w}px: the note's copy button works too`);
    await c.click('.mail-toast .mt-x'); await c.waitForTimeout(400);
    ok('Contact', !(await c.isVisible('.mail-toast.on')), `${w}px: the note closes with its × button`);
    await ctx.close();
  }
  // the site no longer talks to any form service
  const hp = await page(); const h = (await hp.request.get(BASE + '/')).headers()['content-security-policy'] || ''; await hp.closeAll();
  ok('Contact', /connect-src 'self';/.test(h) && !h.includes('formsubmit'), 'Content-Security-Policy no longer allows a form service');
}

await browser.close();
console.log(failures ? `\n${failures} failure(s)` : '\nAll contact checks passed.');
process.exit(failures ? 1 : 0);
