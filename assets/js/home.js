/* UNNATE · homepage behaviour: the hero capsules, the process card, the walking oval,
   the services drawer, the verdict and the approach steps. Needs site.js first. */
(() => {
  'use strict';
  const { $, $$, RM, FINE, makeActor } = window.UNNATE;
  const hero = $('.hero');
  if (!hero) return;

  /* ---------- hero: one orchestrated arrival ---------- */
  let n = 0;
  $$('.hero-h .w, .hero-h .cap', hero).forEach(el => el.style.setProperty('--i', n++));
  $$('[data-rise]', hero).forEach((el, i) => el.style.setProperty('--d', i === 0 ? '0s' : (0.75 + i * 0.12) + 's'));

  /* ---------- "see": the tilted side-eye ----------
     The eye is SVG geometry (viewBox units, 558 x 252). Only the pupils move. Each pupil's target is
     computed from the pointer's position relative to that eye on screen, kept inside an ellipse fitted
     to the eye white; the eye-white clip path trims anything that slides under the lid. */
  const EYE = {
    vb: [30, 30, 500, 196],
    eyes: [
      { rest: [95.9, 94.5], c: [167, 112], rx: 64, up: 26, down: 18 },
      { rest: [310.9, 133.2], c: [384, 150], rx: 64, up: 26, down: 16 }
    ],
    soft: 160
  };
  const eyeCap = $('[data-eyes]'), eyeSvg = $('svg', eyeCap), lens = $('[data-eye-lens]', eyeCap), lensView = $('[data-lens-view]', lens);
  // the lens holds its own copy of the drawing (ids renamed so the copies never share clip paths)
  const lensCopy = eyeSvg.cloneNode(true);
  lensCopy.querySelectorAll('[id]').forEach(el => el.id += '-lens');
  lensCopy.querySelectorAll('[clip-path],[fill]').forEach(el => ['clip-path', 'fill'].forEach(k => { const v = el.getAttribute(k); if (v && v.startsWith('url(#')) el.setAttribute(k, v.replace(/\)$/, '-lens)')); }));
  lensView.appendChild(lensCopy);
  const pupils = [...$$('.pupil', eyeSvg), ...$$('.pupil', lensCopy)];
  const LZ = 2.1;
  const ps = [{ x: 0, y: 0, tx: 0, ty: 0 }, { x: 0, y: 0, tx: 0, ty: 0 }];
  const ln = { x: 0, y: 0, tx: 0, ty: 0, s: 0, ts: 0 };
  let pointer = null, eyeRaf = 0, last = 0;
  const geo = () => {
    const W = eyeCap.clientWidth, H = eyeCap.clientHeight, [vx, vy, vw, vh] = EYE.vb;
    const k = Math.max(W / vw, H / vh);
    return { W, H, k, ox: (W - vw * k) / 2 - vx * k, oy: (H - vh * k) / 2 - vy * k };
  };
  const aimEyes = () => {
    const r = eyeCap.getBoundingClientRect(), g = geo();
    EYE.eyes.forEach((e, i) => {
      const p = ps[i];
      if (!pointer) { p.tx = 0; p.ty = 0; return; }
      const sx = r.left + g.ox + e.c[0] * g.k, sy = r.top + g.oy + e.c[1] * g.k;
      const dx = pointer.x - sx, dy = pointer.y - sy, d = Math.hypot(dx, dy) || 1;
      const t = d / (d + (pointer.soft || EYE.soft));
      const ux = dx / d, uy = dy / d;
      p.tx = e.c[0] + ux * t * e.rx - e.rest[0];
      p.ty = e.c[1] + uy * t * (uy < 0 ? e.up : e.down) - e.rest[1];
    });
  };
  const placeLens = () => {
    const g = geo(), L = g.H * .82;
    lens.style.setProperty('--L', L + 'px');
    lens.style.transform = `translate(${(ln.x - L / 2).toFixed(2)}px,${(ln.y - L / 2).toFixed(2)}px) scale(${(.7 + .3 * ln.s).toFixed(3)})`;
    lens.style.opacity = ln.s.toFixed(3);
    lensView.style.width = g.W + 'px'; lensView.style.height = g.H + 'px';
    lensView.style.transform = `translate(${(L / 2 - ln.x * LZ).toFixed(2)}px,${(L / 2 - ln.y * LZ).toFixed(2)}px) scale(${LZ})`;
  };
  const eyeFrame = t => {
    const dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
    aimEyes();
    const a = 1 - Math.exp(-dt / .07), b = 1 - Math.exp(-dt / .09), c = 1 - Math.exp(-dt / .12);
    let busy = false;
    ps.forEach((p, i) => {
      p.x += (p.tx - p.x) * a; p.y += (p.ty - p.y) * a;
      if (Math.abs(p.tx - p.x) > .05 || Math.abs(p.ty - p.y) > .05) busy = true;
      const tr = `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(8.5 ${EYE.eyes[i].rest[0]} ${EYE.eyes[i].rest[1]})`;
      pupils[i].setAttribute('transform', tr); pupils[i + 2].setAttribute('transform', tr);
    });
    ln.x += (ln.tx - ln.x) * b; ln.y += (ln.ty - ln.y) * b; ln.s += (ln.ts - ln.s) * c;
    if (Math.abs(ln.tx - ln.x) > .1 || Math.abs(ln.ty - ln.y) > .1 || Math.abs(ln.ts - ln.s) > .003) busy = true;
    placeLens();
    eyeRaf = busy ? requestAnimationFrame(eyeFrame) : 0;
    if (!busy) last = 0;
  };
  const kickEyes = () => { if (!eyeRaf) eyeRaf = requestAnimationFrame(eyeFrame); };
  const lensTo = (x, y, snap) => {
    const r = eyeCap.getBoundingClientRect(), L = r.height * .82;
    ln.tx = Math.max(L * .5, Math.min(r.width - L * .5, x - r.left));
    ln.ty = Math.max(L * .5, Math.min(r.height - L * .5, y - r.top));
    if (snap || ln.s < .05) { ln.x = ln.tx; ln.y = ln.ty; }
  };
  pupils.forEach((p, i) => p.setAttribute('transform', `rotate(8.5 ${EYE.eyes[i % 2].rest[0]} ${EYE.eyes[i % 2].rest[1]})`));
  const blink = () => { eyeCap.classList.remove('blink'); void eyeCap.offsetWidth; eyeCap.classList.add('blink'); };

  if (FINE.matches) {
    addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY }; kickEyes(); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer = null; kickEyes(); });
    eyeCap.addEventListener('pointerenter', e => { lensTo(e.clientX, e.clientY, true); ln.ts = 1; kickEyes(); });
    eyeCap.addEventListener('pointermove', e => { lensTo(e.clientX, e.clientY); kickEyes(); });
    eyeCap.addEventListener('pointerleave', () => { ln.ts = 0; kickEyes(); });
    eyeCap.addEventListener('click', blink);
  } else {
    // touch: no tracking while you scroll. A tap makes the eyes look at your finger and shows the lens there.
    let tapT = 0;
    eyeCap.addEventListener('pointerdown', e => {
      pointer = { x: e.clientX, y: e.clientY, soft: 16 }; lensTo(e.clientX, e.clientY, true); ln.ts = 1; blink(); kickEyes();
      clearTimeout(tapT);
      tapT = setTimeout(() => { ln.ts = 0; pointer = null; kickEyes(); }, 1600);
    });
    // once you start reading below the headline, the eyes glance down at the text
    new IntersectionObserver(([e]) => {
      if (ln.s > .05) return;
      const r = eyeCap.getBoundingClientRect();
      pointer = e.intersectionRatio < .75 ? { x: r.left + r.width / 2, y: innerHeight * 4 } : null; kickEyes();
    }, { threshold: [0, .75, 1] }).observe($('.hero-h'));
  }
  addEventListener('resize', kickEyes);

  /* ---------- "feel": the character's expressions ---------- */
  const feel = $('[data-feel]'), fimg = $('img', feel), feelings = fimg.dataset.feelings.split(' ');
  feelings.forEach(src => { const i = new Image(); i.src = src; });       // ready before the first hover
  let fi = 0, ftimer = 0;
  const showFeeling = i => {
    fi = (i + feelings.length) % feelings.length; fimg.src = feelings[fi];
    if (!RM.matches) { feel.classList.remove('squash'); void feel.offsetWidth; feel.classList.add('squash'); }
  };
  if (FINE.matches) {
    feel.addEventListener('pointerenter', () => { clearInterval(ftimer); showFeeling(fi + 1); ftimer = setInterval(() => showFeeling(fi + 1), 950); });
    feel.addEventListener('pointerleave', () => { clearInterval(ftimer); showFeeling(0); });
  } else {
    feel.addEventListener('pointerdown', () => showFeeling(fi + 1));
  }

  /* ---------- "brand": the type in the capsule flexes its width axis ---------- */
  const brand = $('[data-brand]');
  const flex = () => { brand.classList.add('flex'); setTimeout(() => brand.classList.remove('flex'), 1100); };
  if (!FINE.matches) brand.addEventListener('pointerdown', flex);

  /* ---------- service words: DESIGN (lens), GROW (orange letter), REACH (blue letter) ---------- */
  const follow = (el, onMove, onLeave) => {
    const link = el.closest('a');
    if (FINE.matches) {
      link.addEventListener('pointermove', e => onMove(e.clientX));
      link.addEventListener('pointerleave', onLeave);
    } else {
      let sx = null, moved = false, t = 0;
      el.addEventListener('pointerdown', e => { sx = e.clientX; moved = false; clearTimeout(t); onMove(e.clientX); });
      el.addEventListener('pointermove', e => { if (sx === null) return; if (Math.abs(e.clientX - sx) > 8) moved = true; onMove(e.clientX); });
      const up = () => { sx = null; t = setTimeout(onLeave, 900); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      link.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } });
    }
  };
  const DZ = 1.75;
  const dw = $('[data-design]'), dlens = $('.dlens', dw), dclone = $('.wd-clone', dw);
  const dg = { x: 0, tx: 0, s: .6, ts: .6, raf: 0, last: 0 };
  const dLayout = () => { dg.W = dw.offsetWidth; dg.H = dw.offsetHeight; dg.D = dlens.offsetWidth; dclone.style.width = dg.W + 'px'; dclone.style.height = dg.H + 'px'; };
  const dDraw = () => {
    const cx = Math.max(dg.D / 2, Math.min(dg.W - dg.D / 2, dg.x));
    dlens.style.setProperty('--lx', (cx - dg.D / 2).toFixed(2) + 'px');
    dlens.style.setProperty('--ls', dg.s.toFixed(3));
    dclone.style.transform = `translate(${(dg.D / 2 - cx * DZ).toFixed(2)}px,${(dg.D / 2 - dg.H / 2 * DZ).toFixed(2)}px) scale(${DZ})`;
  };
  const dFrame = t => {
    const dt = dg.last ? Math.min(.05, (t - dg.last) / 1000) : .016; dg.last = t;
    dg.x += (dg.tx - dg.x) * (1 - Math.exp(-dt / .08));
    dg.s += (dg.ts - dg.s) * (1 - Math.exp(-dt / .12));
    dDraw();
    if (Math.abs(dg.tx - dg.x) > .1 || Math.abs(dg.ts - dg.s) > .002) dg.raf = requestAnimationFrame(dFrame); else { dg.raf = 0; dg.last = 0; }
  };
  const dKick = () => { if (!dg.raf) dg.raf = requestAnimationFrame(dFrame); };
  follow(dw, x => {
    if (!dw.classList.contains('lens-on')) dg.x = x - dw.getBoundingClientRect().left;
    dw.classList.add('lens-on'); dg.tx = x - dw.getBoundingClientRect().left; dg.ts = 1; dKick();
  }, () => { dw.classList.remove('lens-on'); dg.ts = .6; dKick(); });

  const letterWords = $$('[data-letters]').map(el => ({ el, ls: $$('b', el) }));
  const influence = (w, x) => {
    const span = w.el.getBoundingClientRect().width / w.ls.length * 1.25;
    let best = null, bd = 1e9;
    w.ls.forEach(b => { const r = b.getBoundingClientRect(), c = r.left + r.width / 2; const g = Math.max(0, 1 - Math.abs(x - c) / span); b.style.setProperty('--g', g.toFixed(3)); if (Math.abs(x - c) < bd) { bd = Math.abs(x - c); best = c; } });
    const er = w.el.getBoundingClientRect(); w.el.style.setProperty('--bx', (best - er.left).toFixed(1) + 'px');
  };
  const calm = w => { w.ls.forEach(b => b.style.setProperty('--g', 0)); w.el.classList.remove('on'); };
  letterWords.forEach(w => follow(w.el, x => { w.el.classList.add('on'); influence(w, x); }, () => calm(w)));
  addEventListener('resize', () => { dLayout(); dDraw(); });

  const go = () => {
    hero.classList.add('go');
    dLayout(); dDraw();
    if (RM.matches) return;
    setTimeout(flex, 1500); setTimeout(blink, 2300);
  };
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 700))]).then(() => requestAnimationFrame(go));

  /* ---------- process: the tab card, with the character changing pose per stage ---------- */
  const tabs = $$('[data-tabs] [role=tab]'), panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls'))), card = $('[data-tabcard]');
  const mascot = $('.breakout .mascot'), poses = mascot.dataset.stagePoses.split(' ');
  // the other poses are fetched only when the card is about to be seen
  new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    io.disconnect(); poses.slice(1).forEach(src => { const i = new Image(); i.decoding = 'async'; i.src = src; });
  }, { rootMargin: '400px 0px' }).observe($('[data-tabcard]'));
  const meters = $$('.meter span', card);
  const DWELL = 3800;
  let cur = 0, timer = 0, autoDone = false, autoOn = false, poseT = 0;
  const names = tabs.map(t => $('.tk', t).textContent.trim()), nextLabel = $('[data-next-label]');
  const tabbar = $('[data-tabbar]'), tabInd = $('.tab-ind', tabbar);
  const placeInd = instant => {
    const t = tabs[cur], x = t.offsetLeft + t.parentElement.offsetLeft, w = t.offsetWidth;
    if (instant) tabInd.classList.add('instant');
    tabInd.style.setProperty('--ix', x + 'px'); tabInd.style.setProperty('--iw', w + 'px');
    // drop a fillet only if it would reach the card's rounded corner
    const r = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0, cw = card.offsetWidth;
    const fil = parseFloat(getComputedStyle(tabbar).getPropertyValue('--fil')) || 14;
    tabInd.classList.toggle('no-l', x - fil < r); tabInd.classList.toggle('no-r', x + w + fil > cw - r);
    if (instant) { void tabInd.offsetWidth; tabInd.classList.remove('instant'); }
  };
  new ResizeObserver(() => placeInd(true)).observe(tabbar);
  document.fonts && document.fonts.ready.then(() => placeInd(true));
  card.style.setProperty('--dwell', DWELL + 'ms');
  const select = (i, focus) => {
    i = (i + tabs.length) % tabs.length;
    if (i === cur && !focus) return;
    cur = i;
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    placeInd();
    panels.forEach((p, k) => { p.hidden = k !== i; p.classList.toggle('enter', k === i); });
    meters.forEach((m, k) => { m.classList.toggle('on', k < i); m.classList.toggle('now', k === i); });
    if (mascot.dataset.now !== poses[i]) {
      mascot.dataset.now = poses[i];
      if (RM.matches) mascot.src = poses[i];
      else {
        clearTimeout(poseT); mascot.classList.add('out');
        poseT = setTimeout(() => { mascot.src = mascot.dataset.now; mascot.classList.remove('out', 'hop'); void mascot.offsetWidth; mascot.classList.add('hop'); }, 150);
      }
    }
    nextLabel.textContent = i === tabs.length - 1 ? 'Back to ' + names[0] : 'Next: ' + names[(i + 1) % tabs.length];
    if (focus) tabs[i].focus();
  };
  const stopAuto = () => { autoOn = false; autoDone = true; clearTimeout(timer); card.classList.remove('playing'); };
  const restartMeter = () => { card.classList.remove('playing'); void card.offsetWidth; if (autoOn && cur < tabs.length - 1) card.classList.add('playing'); };
  const tick = () => {
    if (!autoOn) return;
    if (cur >= tabs.length - 1) { stopAuto(); return; }                 // one pass, then it waits for you
    timer = setTimeout(() => { select(cur + 1); restartMeter(); tick(); }, DWELL);
  };
  $('[data-next-stage]').addEventListener('click', () => { stopAuto(); select(cur + 1); });
  tabs.forEach((t, i) => t.addEventListener('click', () => { stopAuto(); select(i); }));
  $('[data-tabs]').addEventListener('keydown', e => {
    const k = { ArrowRight: 1, ArrowLeft: -1, Home: 'h', End: 'e' }[e.key];
    if (k === undefined) return;
    e.preventDefault(); stopAuto();
    select(k === 'h' ? 0 : k === 'e' ? tabs.length - 1 : cur + k, true);
  });
  // swipe the card on touch: it follows the finger a little, then commits by direction
  let sx = null, sy = 0, sid = null;
  const pane = $('.panels', card);
  card.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; sid = e.pointerId; });
  card.addEventListener('pointermove', e => {
    if (sx === null || e.pointerId !== sid) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(e.clientY - sy)) pane.style.transform = `translateX(${dx * .35}px)`;
  });
  card.addEventListener('pointerup', e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    pane.style.transition = 'transform .45s cubic-bezier(.22,1,.36,1)'; pane.style.transform = '';
    setTimeout(() => { pane.style.transition = ''; }, 460);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - sy)) { stopAuto(); select(cur + (dx < 0 ? 1 : -1)); }
  });
  card.addEventListener('pointercancel', () => { sx = null; pane.style.transform = ''; });
  $('.process').addEventListener('focusin', e => { if (e.target.closest('[role=tab]')) stopAuto(); });
  if (!RM.matches) {
    new IntersectionObserver(([e]) => {
      if (autoDone) return;
      if (e.isIntersecting) { if (!autoOn) { autoOn = true; restartMeter(); tick(); } }
      else if (autoOn) { autoOn = false; clearTimeout(timer); card.classList.remove('playing'); }
    }, { threshold: .55 }).observe(card);
  }
  mascot.dataset.now = poses[0];
  nextLabel.textContent = 'Next: ' + names[1];
  meters[0].classList.add('now');

  /* ---------- the oval after "sit pretty": the character walks inside the glass ---------- */
  const oval = $('[data-oval]');
  if (oval) {
    const oActor = makeActor($('.actor-o', oval)), oRoot = oActor.root;
    oActor.show('stand');
    let ox = 0, dir = 1, want = false, oRaf = 0, oLast = 0, step = 0, stepT = 0, untilT = 0;
    const range = () => Math.max(0, (oval.clientWidth - oRoot.offsetWidth) / 2 - oval.clientHeight * .08);
    const R = ['step', 'hop', 'stride', 'hop'], L = ['walk-a', 'walk-b'];
    const loop = t => {
      const dt = oLast ? Math.min(.05, (t - oLast) / 1000) : .016; oLast = t;
      const lim = range(), speed = oval.clientHeight * 1.1;
      const active = want || t < untilT, goal = active ? dir * lim : 0;
      if (active && Math.abs(goal - ox) < 1) dir = -dir;
      const dx = Math.sign(goal - ox) * Math.min(Math.abs(goal - ox), speed * dt);
      ox += dx;
      const moving = Math.abs(dx) > .01;
      if (moving) { stepT += dt * 1000; if (stepT > 130) { stepT = 0; step++; } oActor.show((dx > 0 ? R : L)[step % (dx > 0 ? R : L).length]); }
      oActor.move(ox, moving ? -Math.abs(Math.sin(step * Math.PI / 2)) * oval.clientHeight * .03 : 0);
      if (moving || active) oRaf = requestAnimationFrame(loop);
      else { oRaf = 0; oLast = 0; oActor.show('stand'); oActor.move(0, 0); }
    };
    const start = () => { if (!oRaf) { oLast = 0; oRaf = requestAnimationFrame(loop); } };
    if (RM.matches) {
      oval.addEventListener('pointerenter', () => oActor.show('walk-a'));
      oval.addEventListener('pointerleave', () => oActor.show('stand'));
    } else if (FINE.matches) {
      oval.addEventListener('pointerenter', () => { want = true; dir = 1; start(); });
      oval.addEventListener('pointerleave', () => { want = false; });
    } else {
      oval.addEventListener('click', () => { dir = 1; untilT = performance.now() + 2600; start(); });
    }
  }

  /* ---------- services drawer ----------
     Sticky stacking is switched on only when every folder, at its stuck position, fits in the window,
     so no folder's content can end up hidden under the next one. A covered folder fades its contents. */
  const drawer = $('.drawer'), folders = $$('.folder', drawer);
  const WIDE = matchMedia('(min-width: 64em)');
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const fitDrawer = () => {
    drawer.classList.remove('stacking');
    if (!WIDE.matches) return;
    const top = 5.6 * rem(), stepH = 3.6 * rem();
    drawer.classList.toggle('stacking', folders.every((f, i) => top + i * stepH + f.offsetHeight <= innerHeight - 12));
  };
  fitDrawer();
  addEventListener('resize', () => { clearTimeout(fitDrawer.t); fitDrawer.t = setTimeout(fitDrawer, 150); });
  folders.forEach((f, i) => {
    if (!i) return;
    const mark = document.createElement('div'); mark.setAttribute('aria-hidden', 'true'); mark.style.cssText = 'height:0;margin:0';
    f.before(mark);
    new IntersectionObserver(([e]) => {
      const covered = drawer.classList.contains('stacking') && !e.isIntersecting && e.boundingClientRect.top < e.rootBounds.top + 1;
      folders[i - 1].classList.toggle('covered', covered);
    }, { rootMargin: `-${Math.round(rem() * (5.6 + i * 3.6) + 54)}px 0px 0px 0px` }).observe(mark);
  });

  /* ---------- verdict: the glass shows it is glass ---------- */
  const vg = $('[data-glassview]');
  if (vg && FINE.matches) {
    vg.addEventListener('pointermove', e => { const r = vg.getBoundingClientRect(); vg.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5) * -70 + 'px'); });
    vg.addEventListener('pointerleave', () => vg.style.setProperty('--px', '0px'));
  } else if (vg && !RM.matches) {
    let shift = 0, run = false, raf2 = 0;
    const drift = () => { shift = Math.min(shift + .25, 220); vg.style.setProperty('--px', -shift + 'px'); raf2 = run && shift < 220 ? requestAnimationFrame(drift) : 0; };
    new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run && !raf2) raf2 = requestAnimationFrame(drift); }).observe(vg);
    $('.v-behind', vg).style.transition = 'none';
  }

})();
