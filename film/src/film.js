/* UNNATE.COM — brand film.
   Every frame is a pure function of time: seek(t) lays out the whole world for that instant,
   so the film renders frame-accurately and identically every time. 1080×1920, 30fps, 24s. */
'use strict';
const W = 1080, H = 1920, FPS = 30, DUR = 24;
const $ = (id) => document.getElementById(id);

/* ---------------------------------------------------------------- maths */
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: (t) => t,
  inQ: (t) => t * t, outQ: (t) => 1 - (1 - t) ** 2, ioQ: (t) => (t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2),
  inC: (t) => t ** 3, outC: (t) => 1 - (1 - t) ** 3, ioC: (t) => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  outQuint: (t) => 1 - (1 - t) ** 5, ioQuint: (t) => (t < .5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),
  inExpo: (t) => (t <= 0 ? 0 : 2 ** (10 * t - 10)), outExpo: (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t)),
  ioSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  outBackS: (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2,
  inBack: (t) => 2.70158 * t ** 3 - 1.70158 * t * t,
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-9 * t) * Math.sin((t * 9 - .75) * (2 * Math.PI) / 3) + 1),
};
const P = (t, a, b, e = E.lin) => e(clamp((t - a) / (b - a)));
/* keyframe track: [[time, value, easeToNext], ...] — numbers or arrays */
function K(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0, e = E.ioC] = keys[i], [t1, v1] = keys[i + 1];
    if (t <= t1) {
      const p = e((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], p)) : lerp(v0, v1, p);
    }
  }
  return keys[keys.length - 1][1];
}
const ring = (t, t0, amp, freq = 3, decay = 7) => (t < t0 ? 0 : amp * Math.exp(-decay * (t - t0)) * Math.sin(2 * Math.PI * freq * (t - t0)));
const bez = (a, c, b, p) => (1 - p) ** 2 * a + 2 * (1 - p) * p * c + p * p * b;
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* place an element: (x,y) is where its (ax,ay) anchor lands; scale/rotate happen about that anchor */
function put(el, { x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, o = 1, ax = .5, ay = .5, ry = 0, persp = 0, blur = 0 } = {}) {
  if (o <= .002) { el.style.display = 'none'; return; }
  el.style.display = '';
  const p3 = persp ? `perspective(${persp}px) rotateY(${ry}deg) ` : '';
  el.style.transform = `translate(${x}px,${y}px) ${p3}rotate(${r}deg) scale(${s * sx},${s * sy}) translate(${-ax * 100}%,${-ay * 100}%)`;
  el.style.opacity = o;
  el.style.filter = blur > .1 ? `blur(${blur.toFixed(1)}px)` : '';
}
const hide = (el) => (el.style.display = 'none');

/* ---------------------------------------------------------------- media */
const MEDIA = '../build/media/';
const CREATIVES = ['beauty-spa', 'dental-care', 'skin-in-progress', 'fresh-skin', 'dental-clinical-creative', 'unnate-creatives'].map((n) => MEDIA + 'cr-' + n + '.jpg');
const STILLS = ['crave-burgers-ad', 'neuva', 'pearl-medspa', 'neuva-biwali', 'solara-drinks'].map((n) => MEDIA + 'still-' + n + '.jpg');
const SITES = ['maren-dental-studio-desk', 'oddcard-desk', 'tickpic-moments-desk', 'oddcard-mob', 'tickpic-moments-mob'].map((n) => MEDIA + n + '.jpg');
const frame = (set, i) => MEDIA + set + '/' + String(i).padStart(3, '0') + '.jpg';
const N_CRAVE = 66, N_SOLARA = 132;

/* ---------------------------------------------------------------- the character */
const POSES = Object.keys(window.META);
function makeActor(el) {
  const imgs = {};
  for (const p of POSES) {
    const im = new Image(); im.src = 'poses/' + p + '.png'; im.decoding = 'sync';
    im.style.width = META[p].w + 'px'; im.style.height = META[p].h + 'px';
    el.appendChild(im); imgs[p] = im;
  }
  return { el, imgs, cur: null };
}
const actor = makeActor($('actor')), ghost1 = makeActor($('ghost1')), ghost2 = makeActor($('ghost2'));
/* draw a pose with its head centred on x and its feet on y; size = head width in px */
function act(A, pose, { x = 0, y = 0, size = 240, flip = false, r = 0, o = 1, sx = 1, sy = 1 } = {}) {
  if (!pose || o <= .002) { A.el.style.display = 'none'; return; }
  A.el.style.display = '';
  if (A.cur !== pose) { if (A.cur) A.imgs[A.cur].style.display = 'none'; A.imgs[pose].style.display = 'block'; A.cur = pose; }
  const m = META[pose], k = size / m.hw;
  A.imgs[pose].style.transform = `translate(${x}px,${y}px) rotate(${r}deg) scale(${k * sx * (flip ? -1 : 1)},${k * sy}) translate(${-m.hx}px,${-m.fy}px)`;
  A.el.style.opacity = o;
}
/* run cycle (Action Sheet 1): stride, run, and the mirrored return strides */
const RUN_R = [['a2', false], ['a3', false], ['a8', true], ['a7', true]];
const runPose = (t, fps = 11) => RUN_R[Math.floor(t * fps) % 4];

/* ---------------------------------------------------------------- the floor of sameness */
const COLS = 7, ROWS = 13, PX = 340, PY = 420;
const floor = $('floor'), cards = [];
const P_C = [1190, 3570];      // impact point (character)
const P_T = [1530, 2730];      // where the kicked "UN" lands
const T_CARD = [4, 6];         // the card the camera dives into
(function buildFloor() {
  const backs = [...CREATIVES, ...STILLS, SITES[1], SITES[2], MEDIA + 'shot-home.webp', MEDIA + 'shot-svc.webp', SITES[3], SITES[4], 'TILE_O', 'TILE_I'];
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const c = document.createElement('div'); c.className = 'card';
    const cx = PX / 2 + i * PX, cy = PY / 2 + j * PY;
    let b = backs[(i * 5 + j * 3 + (j >> 1)) % backs.length];
    if (i === T_CARD[0] && j === T_CARD[1]) b = SITES[0];
    if (i === 4 && j === 4) b = CREATIVES[3];
    let back;
    if (b === 'TILE_O') back = `<div class="face back tile" style="background:var(--orange)"><img src="poses/b1.png" style="width:70%;height:auto;object-fit:contain"></div>`;
    else if (b === 'TILE_I') back = `<div class="face back tile serif" style="background:var(--ink);color:#fff;font-family:Instrument;font-style:italic;font-weight:400;font-size:92px">Hello.</div>`;
    else back = `<div class="face back"><img src="${b}"></div>`;
    c.innerHTML = `<div class="face front"><i class="t1"></i><i class="t2"></i><i class="im"></i><b>Your Business</b><i class="l1"></i><i class="l2"></i><i class="bt"></i></div>${back}`;
    floor.appendChild(c);
    cards.push({ el: c, cx, cy, i, j, dT: Math.hypot(cx - P_T[0], cy - P_T[1]), dC: Math.hypot(cx - P_C[0], cy - P_C[1]) });
  }
  floor.style.width = COLS * PX + 'px'; floor.style.height = ROWS * PY + 'px';
})();
const TCX = PX / 2 + T_CARD[0] * PX, TCY = PY / 2 + T_CARD[1] * PY;
const FL = { fx: 0, fy: 0, a: 0, s: 1, Yc: 0, d: 1600 };
function floorCam(t) {
  FL.fx = K(t, [[0, P_C[0]], [1.2, P_C[0], E.ioC], [2.6, 1602], [5.85, 1640, E.ioQuint], [7.2, TCX]]);
  FL.fy = K(t, [[0, P_C[1]], [5.85, P_C[1], E.ioQuint], [7.2, TCY]]);
  FL.a = K(t, [[0, 50], [1.2, 50, E.ioC], [2.6, 64], [5.85, 64, E.ioQuint], [7.2, 0]]);
  FL.s = K(t, [[0, 1.2], [.38, 1.3, E.lin], [1.2, 1.3, E.ioC], [2.6, .8, E.lin], [5.85, .83, E.ioQuint], [7.2, 1000 / 300]]);
  FL.Yc = K(t, [[0, 1240], [1.2, 1240, E.ioC], [2.6, 1420], [5.85, 1420, E.ioQuint], [7.2, 1040]]);
}
/* screen projection of a floor point — keeps standing objects glued to the floor while the camera moves */
function proj(px, py) {
  const a = FL.a * Math.PI / 180, X = FL.s * (px - FL.fx), Yr = FL.s * (py - FL.fy);
  const z = Yr * Math.sin(a), k = FL.d / (FL.d - z);
  return { x: 540 + X * k, y: FL.Yc + Yr * Math.cos(a) * k, k: k * FL.s };
}
function drawFloor(t) {
  const on = t < 7.25;
  $('floorWrap').style.display = on ? '' : 'none';
  if (!on) return;
  floor.style.transform = `translate(540px,${FL.Yc}px) rotateX(${FL.a}deg) scale(${FL.s}) translate(${-FL.fx}px,${-FL.fy}px)`;
  $('floorWrap').style.perspectiveOrigin = `540px ${FL.Yc}px`;
  const T1 = .38;
  for (const c of cards) {
    // hook: shock ring from the impact
    let z = 0, tilt = 0;
    if (t > T1) {
      const tau = t - T1, front = c.dC - 2300 * tau;
      z = 120 * Math.exp(-2.6 * tau) * Math.exp(-((front / 240) ** 2));
      if (c.dC < 260) z -= 40 * Math.exp(-5 * tau);
      tilt = 10 * Math.exp(-3 * tau) * Math.exp(-((front / 300) ** 2));
    }
    // transformation: the flip wave from where "UN" lands
    const fs = 5.0 + c.dT / 2300;
    const fp = P(t, fs, fs + .5, E.outBackS);
    z += 70 * Math.sin(Math.PI * clamp((t - fs) / .5));
    c.el.style.opacity = (c.i === T_CARD[0] && c.j === T_CARD[1]) ? 1 : 1 - P(t, 6.8, 7.12);
    c.el.style.transform = `translate3d(${c.cx - 150}px,${c.cy - 190}px,${z.toFixed(1)}px) rotateX(${tilt.toFixed(2)}deg) rotateY(${(fp * 180).toFixed(2)}deg)`;
  }
}

/* ---------------------------------------------------------------- fx canvas */
const fx = $('fx').getContext('2d');
function dust(cx, cy, t, t0, { n = 14, spread = 260, r0 = 40, r1 = 170, life = 1.1, seed = 7, flat = .55 } = {}) {
  const tau = t - t0; if (tau < 0 || tau > life) return;
  const R = rng(seed), p = tau / life;
  for (let i = 0; i < n; i++) {
    const ang = R() * Math.PI * 2, dist = (.25 + R() * .75) * spread, sz = lerp(r0, r1, E.outC(p)) * (.6 + R() * .6);
    const x = cx + Math.cos(ang) * dist * E.outC(p) * 1.0, y = cy + Math.sin(ang) * dist * E.outC(p) * flat - 50 * p - sz * .3;
    const a = (1 - E.inQ(p)) * (.55 + R() * .35);
    const g = fx.createRadialGradient(x - sz * .25, y - sz * .3, sz * .1, x, y, sz);
    g.addColorStop(0, `rgba(250,244,236,${a})`); g.addColorStop(.6, `rgba(236,224,207,${a * .85})`); g.addColorStop(1, 'rgba(236,224,207,0)');
    fx.fillStyle = g; fx.beginPath(); fx.arc(x, y, sz, 0, 7); fx.fill();
  }
}
function debris(cx, cy, t, t0, { n = 22, seed = 3, col = ['#8B5A3C', '#B0B8C2', '#6E7B8B'], power = 1 } = {}) {
  const tau = t - t0; if (tau < 0 || tau > 1.2) return;
  const R = rng(seed);
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI * (.08 + R() * .84), v = (500 + R() * 900) * power, sz = 5 + R() * 11;
    const x = cx + Math.cos(ang) * v * tau, y = cy + Math.sin(ang) * v * tau + 1900 * tau * tau;
    fx.save(); fx.translate(x, y); fx.rotate(tau * (R() * 14 - 7)); fx.globalAlpha = clamp(1.2 - tau);
    fx.fillStyle = col[i % col.length]; fx.beginPath(); fx.moveTo(-sz, -sz * .4); fx.lineTo(sz * .2, -sz); fx.lineTo(sz, sz * .5); fx.lineTo(-sz * .3, sz * .8); fx.closePath(); fx.fill(); fx.restore();
  }
}
function shock(cx, cy, t, t0, { r1 = 700, flat = .3, col = '255,255,255', w = 8, life = .55 } = {}) {
  const p = (t - t0) / life; if (p < 0 || p > 1) return;
  const r = r1 * E.outC(p);
  fx.save(); fx.strokeStyle = `rgba(${col},${(1 - p) * .9})`; fx.lineWidth = w * (1 - p) + 1;
  fx.beginPath(); fx.ellipse(cx, cy, r, r * flat, 0, 0, 7); fx.stroke(); fx.restore();
}
function sparks(cx, cy, t, t0, { n = 10, len = 90, r0 = 60, r1 = 210, col = '#F84608', life = .4, seed = 11, w = 7 } = {}) {
  const p = (t - t0) / life; if (p < 0 || p > 1) return;
  const R = rng(seed);
  fx.save(); fx.strokeStyle = col; fx.lineCap = 'round'; fx.lineWidth = w * (1 - p * .6);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + R() * .3, d0 = lerp(r0, r1, E.outC(p)), d1 = d0 + len * (1 - p);
    fx.globalAlpha = 1 - E.inQ(p);
    fx.beginPath(); fx.moveTo(cx + Math.cos(a) * d0, cy + Math.sin(a) * d0); fx.lineTo(cx + Math.cos(a) * d1, cy + Math.sin(a) * d1); fx.stroke();
  }
  fx.restore();
}

/* ---------------------------------------------------------------- copy helpers */
const cap = $('cap');
const CAPS = [[7.3, 'on your website.'], [9.15, 'in every feed.'], [11.8, 'in motion.'], [12.95, 'in every campaign.'], [15.35, '']];
cap.innerHTML = CAPS.map(([, s]) => `<div class="mask" style="position:absolute;left:0;right:0;top:0;height:120px"><span>${s}</span></div>`).join('');
const capEls = [...cap.children];
function maskIn(el, t, t0, { d = .45, out = null, dOut = .3, dy = 1.05 } = {}) {
  const sp = el.firstElementChild;
  const pin = P(t, t0, t0 + d, E.outQuint);
  const pout = out == null ? 0 : P(t, out, out + dOut, E.inC);
  sp.style.transform = `translateY(${((1 - pin) * dy - pout * dy) * 100}%)`;
  return pin > 0 && pout < 1;
}

/* ---------------------------------------------------------------- 2D tiles & formats */
function mkTile(src, cls = '') {
  const d = document.createElement('div'); d.className = 'abs tilep shadowed ' + cls;
  d.innerHTML = src ? `<img src="${src}">` : '';
  $('tiles').appendChild(d); return d;
}
function size(el, w, h, r) { el.style.width = w + 'px'; el.style.height = h + 'px'; if (r != null) el.style.borderRadius = r + 'px'; }
const GRID = [];   // the social grid (3x3), index 4 is the hero post
const gridSrc = [CREATIVES[0], STILLS[1], CREATIVES[2], CREATIVES[5], CREATIVES[3], CREATIVES[4], STILLS[3], CREATIVES[1], STILLS[2]];
for (let i = 0; i < 9; i++) GRID.push(mkTile(gridSrc[i]));
/* campaign formats + the extra board pieces */
const F = {
  bill: mkTile(STILLS[3], 'bill'), story: mkTile(CREATIVES[0]), square: mkTile(CREATIVES[1]),
  poster: mkTile(CREATIVES[2]), banner: mkTile(null), site: mkTile(SITES[1]), phone: mkTile(SITES[4]),
};
F.story.insertAdjacentHTML('afterbegin', '<div class="storybars"><i></i><i></i><i></i></div>');
F.banner.style.background = 'var(--ink)';
F.banner.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:space-between;padding:0 30px;color:#fff;font:800 50px Bricolage;font-stretch:75%;letter-spacing:-.01em">Book your visit<em style="font-style:normal;font:700 22px Bricolage;background:var(--orange);padding:14px 24px;border-radius:30px">Learn more</em></div>';
F.bill.insertAdjacentHTML('beforeend', '');

/* feed inside the phone */
(function buildFeed() {
  const names = ['Aurea Spa', 'Slow Growth Co', 'Skin Clinic', 'Freshskin'];
  const imgs = [CREATIVES[0], CREATIVES[1], CREATIVES[2], CREATIVES[3]];
  let h = `<img src="${SITES[0].replace('desk', 'mob')}" style="display:block;width:470px;height:1017px;object-fit:cover;margin-top:-18px">`;
  imgs.forEach((s, i) => { h += `<div class="post"><div class="ph"><i></i><span>${names[i]}<br><s>Sponsored</s></span></div><img src="${s}"><div class="pa"><i></i><i></i><i></i></div></div>`; });
  $('feed').innerHTML = h;
})();
const POST_IMG_CENTER = 999 + 3 * 706 + 58 + 294; // fresh-skin post image centre inside the feed

/* ---------------------------------------------------------------- lockup geometry (final card) */
const LK = {};
function layoutLockup() {
  const wmW = 620, wmH = wmW * 662 / 2180, base = 1000;
  const com = $('com'); com.style.fontSize = '150px';
  const comW = com.getBoundingClientRect().width;
  const dotD = 34, g1 = 12, g2 = 12;
  const total = wmW + g1 + dotD + g2 + comW, x0 = (W - total) / 2;
  Object.assign(LK, { wmW, wmH, base, x0, dotD, comW, dotX: x0 + wmW + g1 + dotD / 2, dotY: base - dotD / 2 - 4, comX: x0 + wmW + g1 + dotD + g2 });
  const wc = $('wmClip'); wc.style.left = x0 + 'px'; wc.style.top = (base - wmH - 40) + 'px'; wc.style.width = wmW + 'px'; wc.style.height = (wmH + 40) + 'px';
  const wm = $('wm'); wm.style.width = wmW + 'px'; wm.style.height = wmH + 'px'; wm.style.top = '40px';
  const cc = $('comClip'); cc.style.left = LK.comX + 'px'; cc.style.top = (base - 160) + 'px'; cc.style.width = (comW + 20) + 'px'; cc.style.height = (160 + 25) + 'px';
  com.style.bottom = '0px';
}

/* ================================================================ SEEK */
const grain = $('grain').getContext('2d');
(function makeGrain() {
  const id = grain.createImageData(1208, 2048), R = rng(42);
  for (let i = 0; i < id.data.length; i += 4) { const v = 120 + (R() - .5) * 230; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  grain.putImageData(id, 0, 0);
})();

let unW = 0;
function seek(t) {
  const pending = [];
  fx.clearRect(0, 0, W, H);
  const R = rng(Math.floor(t * FPS / 2) + 1);
  $('grain').style.transform = `translate(${Math.floor(R() * 64) - 32}px,${Math.floor(R() * 64) - 32}px)`;

  /* ---------- background world colour */
  const toPaper = P(t, 5.0, 6.0, E.ioQ);
  const skyOn = P(t, 15.35, 16.1, E.ioQ) * (1 - P(t, 18.25, 18.8, E.ioQ));
  $('bg').style.background = `rgb(${lerp(231, 241, toPaper)},${lerp(234, 247, toPaper)},${lerp(238, 253, toPaper)})`;
  $('sky').style.opacity = skyOn;
  $('sky').style.background = 'linear-gradient(180deg,#5FA6EA 0%,#9CCBF3 38%,#DCEEFB 75%,#F1F7FD 100%)';
  if (skyOn > 0) {
    const cl = [...document.querySelectorAll('#sky .cl')];
    const dr = (t - 15.3) * 40;
    put(cl[0], { x: 300 + dr, y: 1640, o: .95 }); put(cl[1], { x: 940 - dr * .6, y: 330, o: .9 });
    put(cl[2], { x: 120 + dr * .8, y: 560, o: .8 }); put(cl[3], { x: 900 - dr * .4, y: 1880, o: .9 });
  }

  /* ---------- camera (screen space: shake + push) */
  let cs = 1, cx = 540, cy = 960, shx = 0, shy = 0;
  shx += ring(t, .38, 22, 9, 9) + ring(t, 19.35, 16, 9, 10) + ring(t, 8.55, 6, 8, 12);
  shy += ring(t, .40, 30, 7.5, 8) + ring(t, 19.37, 20, 8, 9) + ring(t, 8.57, 9, 8, 12) + ring(t, 4.24, 6, 9, 14);
  const push = K(t, [[3.3, 1], [4.2, 1.2, E.lin], [4.24, 1.2, E.outExpo], [4.85, 1]]);
  const pushX = 420, pushY = 1320;
  const endPush = 1 + .025 * P(t, 21, 24, E.ioSine);
  cs = push * endPush * (1 + .035 * Math.exp(-7 * Math.max(0, t - .38)) * (t > .38));
  $('cam').style.transformOrigin = t < 6 ? `${pushX}px ${pushY}px` : '540px 900px';
  $('cam').style.transform = `translate(${shx}px,${shy}px) scale(${cs})`;
  $('flash').style.opacity = .55 * (1 - P(t, .38, .5)) * (t >= .38) + .35 * (1 - P(t, 19.35, 19.47)) * (t >= 19.35);

  /* ---------- the floor */
  floorCam(t); drawFloor(t);
  const fogA = 1 - P(t, 5.9, 6.7);
  $('fog').style.display = fogA > 0 ? '' : 'none';
  const bgc = $('bg').style.background;
  $('fog').style.background = `linear-gradient(180deg,${bgc} 0%,${bgc} 62%,transparent 80%)`;
  $('fog').style.opacity = fogA * P(t, 1.2, 2.4);

  /* ---------- HOOK: falling → smash (Action Sheet 3) */
  const T1 = .38;
  const pc = proj(P_C[0], P_C[1]);
  let pose = null, ax = 0, ay = 0, asz = 240, aflip = false, ar = 0, ao = 1, asx = 1, asy = 1;
  act(ghost1, null); act(ghost2, null);
  if (t < T1) {
    const p = t / T1, y = lerp(720, pc.y, E.inQ(p)), sz = lerp(560, 240 * pc.k, p);
    pose = 'c2x'; ax = 540; ay = y; asz = sz; asy = 1 + .1 * p; asx = 1 - .04 * p;
    const yp = lerp(720, pc.y, E.inQ(Math.max(0, p - .12)));
    act(ghost1, 'c2x', { x: 540, y: yp, size: sz, o: .28 * p });
    act(ghost2, 'c2x', { x: 540, y: lerp(720, pc.y, E.inQ(Math.max(0, p - .24))), size: sz, o: .14 * p });
    // growing contact shadow
    fx.save(); fx.fillStyle = `rgba(12,36,71,${.22 * p})`; fx.beginPath(); fx.ellipse(pc.x, pc.y, 40 + 150 * p, (40 + 150 * p) * .28, 0, 0, 7); fx.fill(); fx.restore();
  } else if (t < 1.25) {
    const tau = t - T1;
    pose = 'c3'; ax = pc.x; ay = pc.y + 6; asz = 240 * pc.k * (1 + .03 * E.outC(clamp(tau / .8)));
    asy = 1 - .08 * Math.exp(-14 * tau); asx = 1 + .05 * Math.exp(-14 * tau);
  } else if (t < 3.55) {
    pose = 'b1'; ax = pc.x; ay = pc.y; asz = 240 * pc.k; aflip = true;
  }
  shock(pc.x, pc.y, t, T1, { r1: 900, flat: .42 });
  debris(pc.x, pc.y - 20, t, T1, { n: 26, power: 1 });
  dust(pc.x, pc.y, t, 1.0, { n: 16, spread: 230, r0: 70, r1: 190, life: 1.0, seed: 5 });

  /* ---------- PROBLEM: "ONLINE." / "but UNSEEN." */
  const online = $('online');
  if (t > 1.7 && t < 4.9) {
    put(online, { x: 540, y: 600 + 26 * P(t, 1.75, 4.8), ay: .5, o: 1 - P(t, 4.3, 4.7) });
    maskIn(online, t, 1.85, { d: .5, out: 4.25, dOut: .4 });
  } else hide(online);
  const but = $('but');
  if (t > 2.6 && t < 4.6) {
    const pw = proj(1339.5, P_C[1]);
    put(but, { x: pw.x + 6, y: pw.y - 205 * (pw.k / .8), ax: 0, ay: 1, s: pw.k / .8, o: 1 - P(t, 4.2, 4.45) });
    maskIn(but, t, 2.75, { d: .4 });
  } else hide(but);

  /* UNSEEN — letters standing on the floor */
  const un = $('un'), seen = $('seen');
  if (!unW) { un.style.display = ''; unW = un.getBoundingClientRect().width; }
  const pw = proj(1339.5, P_C[1]), wk = pw.k / .8;
  const rise = (i, t0) => { const p = P(t, t0 + i * .055, t0 + i * .055 + .45, E.outBack); return `translateY(${(1 - p) * 30}%) scaleY(${p})`; };
  if (t > 2.85 && t < 5.1) {
    [...un.children].forEach((s, i) => (s.style.transform = rise(i, 2.95)));
    if (t < 4.24) put(un, { x: pw.x, y: pw.y, ax: 0, ay: .86, s: wk });
    else {
      // the kick: "UN" is launched in a high lob into the back of the world
      const p = P(t, 4.24, 5.0), pt = proj(P_T[0], P_T[1]);
      const sx0 = pw.x + unW * wk / 2, sy0 = pw.y - 100 * wk;
      const x = bez(sx0, (sx0 + pt.x) / 2 + 60, pt.x, E.outQ(p)), y = bez(sy0, 140, pt.y - 40, p);
      put(un, { x, y, s: wk * lerp(1, pt.k / .8 * .55, E.inQ(p)), r: -620 * E.outQ(p), o: 1 - P(t, 4.97, 5.03) });
    }
  } else hide(un);
  if (t > 2.85 && t < 6.5) {
    [...seen.children].forEach((s, i) => (s.style.transform = rise(i + 2, 2.95)));
    const close = P(t, 4.3, 4.9, E.outElastic);
    const sx = pw.x + unW * wk * (1 - close), sy = pw.y;
    const h = P(t, 5.62, 6.4, E.ioQuint);
    const sw = seen.getBoundingClientRect ? 0 : 0;
    // travel from the floor to the sticky header
    const hx = lerp(sx, 540, h), hy = lerp(sy, 235, h);
    put(seen, { x: hx, y: hy, ax: lerp(0, .5, h), ay: lerp(.86, .86, h), s: lerp(wk, .66, h) });
  } else hide(seen);
  shock(proj(P_T[0], P_T[1]).x, proj(P_T[0], P_T[1]).y, t, 5.0, { r1: 520, flat: .45, col: '248,70,8', w: 10, life: .6 });
  sparks(proj(P_T[0], P_T[1]).x, proj(P_T[0], P_T[1]).y - 10, t, 5.0, { n: 9, r0: 20, r1: 150, len: 60, life: .35, w: 6 });
  sparks(pw.x + 60 * wk, pw.y - 110 * wk, t, 4.24, { n: 8, r0: 30, r1: 170, len: 70, life: .3, w: 7, seed: 4 });

  /* the kick itself — Action Sheet 2, mirrored so it swings into the word */
  if (t >= 3.55 && t < 5.55) {
    const seq = [[3.55, 'b2'], [3.72, 'b3'], [3.88, 'b4'], [4.2, 'b5'], [4.5, 'b6']];
    for (const [s0, p] of seq) if (t >= s0) pose = p;
    ax = pc.x; ay = pc.y; asz = 240 * pc.k; aflip = true;
    if (pose === 'b4') { ax -= 10 * P(t, 3.88, 4.2, E.outQ); asy = 1 - .025 * P(t, 3.88, 4.2); }
    if (pose === 'b5') { ax += 12; }
    if (pose === 'b6') { asy = 1 + .04 * ring(t, 4.5, 1, 3, 6); }
  }
  /* run into depth, leap into the card (Action Sheet 1) */
  if (t >= 5.55 && t < 6.5) {
    const p = P(t, 5.55, 6.15, E.ioQ);
    const fxp = lerp(P_C[0], TCX, p), fyp = lerp(P_C[1], TCY + 220, p);
    const q = proj(fxp, fyp);
    if (t < 6.15) { const [ps, fl] = runPose(t - 5.55, 12); pose = ps; aflip = fl; ax = q.x; ay = q.y; asz = 240 * q.k; }
    else {
      const j = P(t, 6.15, 6.42), qt = proj(TCX, TCY);
      pose = j < .5 ? 'a6' : 'a4'; ax = lerp(q.x, qt.x, j); ay = lerp(q.y, qt.y, j) - Math.sin(Math.PI * j) * 160 * q.k;
      asz = 240 * lerp(q.k, qt.k, j) * (1 - .9 * P(t, 6.36, 6.46, E.inC)); ao = 1 - P(t, 6.4, 6.47);
      if (t > 6.38) { fx.save(); const r = 30 + 160 * P(t, 6.38, 6.8, E.outC); fx.strokeStyle = `rgba(248,70,8,${1 - P(t, 6.38, 6.8)})`; fx.lineWidth = 6; fx.beginPath(); fx.ellipse(qt.x, qt.y, r * qt.k * 1.4, r * qt.k * .9, 0, 0, 7); fx.stroke(); fx.restore(); }
    }
  }

  /* ---------- DEVICE: card → website → (stomp) → phone → feed */
  const dev = $('device');
  if (t >= 7.2 && t < 10.4) {
    const mA = P(t, 7.2, 7.62, E.outBackS), mB = P(t, 8.55, 9.05, E.outBack);
    let w = lerp(1000, 470, mB), h = lerp(lerp(1267, 677, mA), 980, mB), r = lerp(lerp(60, 28, mA), 64, mB);
    const sq = ring(t, 8.55, .05, 4, 9);
    const chromeO = P(t, 7.3, 7.5) * (1 - P(t, 8.55, 8.75));
    size(dev, w, h, r);
    const pop = P(t, 9.95, 10.35, E.inBack);
    put(dev, { x: 540, y: 1040 + 500 * pop, ax: .5, ay: .5, sx: 1 + sq * .6, sy: 1 - sq, s: 1 - .25 * pop, o: 1 - P(t, 10.05, 10.35) });
    dev.querySelector('.chrome').style.opacity = chromeO;
    dev.querySelector('.scr').style.top = 52 * chromeO + 'px';
    const dk = $('dDesk'), mb = $('dMob');
    dk.style.opacity = 1 - P(t, 8.6, 8.85);
    mb.style.opacity = P(t, 8.6, 8.85) * (t < 9.06 ? 1 : 0);
    dk.style.transform = `scale(${1 + .04 * P(t, 7.2, 8.6)})`;
    $('notch').style.opacity = P(t, 8.85, 9.05);
    const feed = $('feed');
    feed.style.display = t >= 9.05 ? '' : 'none';
    const sc = P(t, 9.1, 9.9, E.outQuint), scroll = (POST_IMG_CENTER - 490) * sc;
    const vel = (POST_IMG_CENTER - 490) * (P(t + 1 / 30, 9.1, 9.9, E.outQuint) - sc) * 30;
    feed.style.transform = `translateY(${-scroll}px)`;
    feed.style.filter = Math.abs(vel) > 600 ? `blur(${Math.min(10, Math.abs(vel) / 900).toFixed(1)}px)` : '';
    const hp = feed.querySelectorAll('.post img')[3];
    hp.style.opacity = t > 9.98 ? 0 : 1;
    // character runs along the top of the browser, crouches, jumps and stomps it into a phone
    const top = 1040 - h / 2 * (1 - sq);
    if (t >= 7.28 && t < 7.95) { const [ps, fl] = runPose(t, 12); pose = ps; aflip = fl; ax = lerp(-120, 560, P(t, 7.28, 7.95, E.outQ)); ay = top; asz = 200; ao = 1; }
    else if (t >= 7.95 && t < 8.08) { pose = 'a5'; ax = 560; ay = top; asz = 200; ao = 1; }
    else if (t >= 8.08 && t < 8.55) {
      const j = P(t, 8.08, 8.55); pose = j < .45 ? 'a6' : 'a4'; ax = 560; asz = 200; ao = 1;
      ay = top - 300 * (1 - (2 * j - 1) ** 2) - (j < .5 ? 0 : 0);
    } else if (t >= 8.55 && t < 10.0) {
      pose = t < 8.75 ? 'b1' : 'a1'; ax = 560; ay = top; asz = 200 * lerp(1, .9, P(t, 8.55, 9.05)); ao = 1;
      if (t < 8.75) { asy = 1 - .08 * Math.exp(-12 * (t - 8.55)); }
    } else if (t >= 10.0 && t < 10.42) {
      const j = P(t, 10.0, 10.42); pose = j < .5 ? 'a6' : 'a4'; asz = 180; ao = 1; aflip = true;
      ax = lerp(560, 250, j); ay = lerp(1040 - 490, 531, j) - 220 * Math.sin(Math.PI * j);
      aflip = true;
    }
  } else hide(dev);

  /* ---------- SOCIAL GRID → the hero post flips into a video */
  const gx = (i) => 540 + ((i % 3) - 1) * 290, gy = (i) => 1060 + (Math.floor(i / 3) - 1) * 360;
  const vid = $('vid');
  if (t >= 9.97 && t < 11.9) {
    const out = P(t, 11.05, 11.6, E.inC);
    GRID.forEach((g, i) => {
      if (i === 4) {
        // pops out of the phone
        const p = P(t, 9.97, 10.5, E.outBack);
        const flip = P(t, 10.78, 11.05, E.ioC);
        size(g, 270, 338, 16);
        put(g, { x: 540, y: lerp(1040, gy(4), p), s: lerp(470 / 270, 1, p) * (1 + .12 * Math.sin(Math.PI * P(t, 9.97, 10.35))), ry: flip * 90, persp: 1200, o: flip < .5 ? 1 : 0 });
        return;
      }
      const d0 = .05 + i * .035 + (i > 4 ? -.035 : 0);
      const p = P(t, 10.0 + d0, 10.55 + d0, E.outBack);
      const ox = gx(i) - 540, oy = gy(i) - 1060;
      size(g, 270, 338, 16);
      put(g, { x: lerp(540, gx(i), p) + ox * 1.4 * out, y: lerp(1040, gy(i), p) + oy * 1.4 * out, s: lerp(.4, 1, p) * (1 + .8 * out), r: lerp((i % 2 ? 8 : -8), 0, p), o: P(t, 10 + d0, 10.15 + d0) * (1 - out) });
    });
    // run across the top of the grid (Action Sheet 1)
    if (t >= 10.42 && t < 11.3) {
      if (t < 10.52) { pose = 'a1'; ax = 250; ay = 531; asz = 180; ao = 1; asy = 1 - .06 * Math.exp(-14 * (t - 10.42)); aflip = false; }
      else { const [ps, fl] = runPose(t, 12); pose = ps; aflip = fl; ax = lerp(250, 1240, P(t, 10.52, 11.3, E.inQ)); ay = 531; asz = 180; ao = 1; }
    }
  } else GRID.forEach(hide);

  /* ---------- VIDEO: real client work, full-bleed, swipe, then framed as an ad */
  const ad = $('ad');
  if (t >= 10.9 && t < 18.8) {
    const vA = $('vA'), vB = $('vB');
    const ci = clamp(Math.floor((t - 10.9) * 30) + 1, 1, N_CRAVE), si = clamp(Math.floor((t - 12.3) * 30) + 1, 1, N_SOLARA);
    if (t < 12.6) { vA.src = frame('crave', ci); pending.push(vA); }
    if (t >= 12.3) { vB.src = frame('solara', si); pending.push(vB); }
    const sw = P(t, 12.3, 12.56, E.ioC);
    vA.style.transform = `translateY(${-100 * sw}%)`; vA.style.display = t < 12.6 ? '' : 'none';
    vB.style.transform = `translateY(${100 - 100 * sw}%)`; vB.style.display = t >= 12.3 ? '' : 'none';
    const swBlur = Math.sin(Math.PI * sw) * 14;
    vid.style.filter = swBlur > .5 ? `blur(${swBlur.toFixed(1)}px)` : '';
    // geometry: flip-in (300×375) → full-bleed → ad media (620×775) → shrunk in campaign → board slot
    const flipIn = P(t, 10.92, 11.05, E.outC);
    const grow = P(t, 11.05, 11.75, E.ioQuint);
    const pull = P(t, 12.6, 13.35, E.ioQuint);
    const shrink = P(t, 13.45, 13.95, E.ioC);
    const toBoard = P(t, 15.45, 16.15, E.ioQuint);
    const implode = P(t, 18.25, 18.7, E.inBack);
    let vw = lerp(lerp(270, 1080, grow), 620, pull), vh = lerp(lerp(338, 1920, grow), 775, pull);
    let vx = 540, vy = lerp(lerp(1060, 960, grow), 994, pull);
    let adS = lerp(1080 / 620, 1, pull) * lerp(1, .74, shrink);
    const bS = .52;
    adS = lerp(adS, bS, toBoard);
    const adCx = lerp(540, 855, toBoard), adCy = lerp(1000, 1345, toBoard);
    if (t >= 12.6) { vw = 620 * adS; vh = lerp(1920, 775 * adS, pull); vx = adCx; vy = lerp(960, adCy + (994 - 1000) * adS, pull); }
    const rad = lerp(lerp(16, 0, grow), 0, pull);
    size(vid, vw, vh, rad);
    const ip = (k) => lerp(k, 540, implode);
    put(vid, { x: ip(vx), y: lerp(vy, 960, implode), ax: .5, ay: .5, ry: (1 - flipIn) * -90, persp: 1200, s: 1 - implode, r: implode * 30, o: 1 });
    $('vbar').style.opacity = grow * (1 - pull);
    $('vbar').firstElementChild.style.width = 100 * P(t, 10.9, 12.6) + '%';
    if (t >= 12.6) {
      size(ad, 620, 955, 22);
      put(ad, { x: ip(adCx), y: lerp(adCy, 960, implode), s: adS * (1 - implode), r: implode * 30, o: 1 });
      const ign = P(t, 16.55, 16.8);
      ad.style.boxShadow = `0 40px 80px -30px rgba(12,36,71,.45),0 0 0 ${(ign * 10).toFixed(1)}px rgba(248,70,8,${ign})`;
    } else hide(ad);
  } else { hide(vid); hide(ad); }

  /* ---------- CAMPAIGN: the ad multiplies into formats around the camera, then the board */
  const orbit = K(t, [[13.5, -1], [15.5, 1, E.ioSine]]);
  const toBoard = P(t, 15.45, 16.15, E.ioQuint), implode = P(t, 18.25, 18.7, E.inBack);
  const FM = [
    // name, w,h, ring x,y,depthScale, ry, delay, board rect [x,y,w,h]
    ['bill', 640, 360, 330, 560, .82, 16, 0, [60, 1190, 285, 160]],
    ['square', 330, 330, 880, 640, .9, -18, .06, [60, 875, 285, 285]],
    ['story', 290, 516, 165, 1180, .95, 22, .12, [375, 875, 285, 507]],
    ['poster', 330, 495, 905, 1250, .88, -20, .18, null],
    ['banner', 700, 128, 540, 1490, 1, 0, .24, [60, 1412, 600, 110]],
  ];
  if (t >= 13.45 && t < 18.8) {
    FM.forEach(([n, w, h, rx, ry0, ds, rot, dl, br], idx) => {
      const el = F[n];
      const p = P(t, 13.5 + dl, 14.1 + dl, E.outBack);
      const ox = rx + orbit * 70 * (1 - ds) * 6, oy = ry0;
      let x = lerp(540, ox, p), y = lerp(1000, oy, p), s = lerp(.2, ds, p), ryy = lerp(0, rot + orbit * 8, p), ww = w, hh = h, o = P(t, 13.5 + dl, 13.62 + dl);
      if (br) {
        x = lerp(x, br[0] + br[2] / 2, toBoard); y = lerp(y, br[1] + br[3] / 2, toBoard);
        ww = lerp(w, br[2], toBoard); hh = lerp(h, br[3], toBoard); s = lerp(s, 1, toBoard); ryy = lerp(ryy, 0, toBoard);
      } else { o *= 1 - P(t, 15.45, 15.8); x += 400 * P(t, 15.45, 15.9, E.inC); }
      size(el, ww, hh, n === 'banner' ? 14 : 16);
      const ign = P(t, 16.3 + idx * .08, 16.55 + idx * .08);
      el.style.boxShadow = `0 40px 80px -30px rgba(12,36,71,.45),0 0 0 ${(ign * 8).toFixed(1)}px rgba(248,70,8,${ign})`;
      const breathe = 1 + .012 * Math.sin(Math.PI * 2 * P(t, 16.9, 17.9)) * (t > 16.9);
      put(el, { x: lerp(x, 540, implode), y: lerp(y, 960, implode), s: s * breathe * (1 - implode), ry: ryy, persp: 1400, r: implode * (idx % 2 ? -40 : 40), o });
      el.style.zIndex = Math.round(ds * 10);
    });
  } else FM.forEach(([n]) => hide(F[n]));
  // site + phone join the system for the board
  [['site', [60, 470, 600, 375], -700, 0], ['phone', [690, 470, 330, 600], 1500, 1]].forEach(([n, br, fromX, idx]) => {
    const el = F[n];
    if (t < 15.45 || t >= 18.8) return hide(el);
    const p = P(t, 15.5 + idx * .08, 16.2 + idx * .08, E.outBackS);
    size(el, br[2], br[3], n === 'phone' ? 34 : 16);
    const ign = P(t, 16.2 + idx * .12, 16.45 + idx * .12);
    el.style.boxShadow = `0 40px 80px -30px rgba(12,36,71,.45),0 0 0 ${(ign * 8).toFixed(1)}px rgba(248,70,8,${ign})`;
    const breathe = 1 + .012 * Math.sin(Math.PI * 2 * P(t, 16.9, 17.9)) * (t > 16.9);
    put(el, { x: lerp(lerp(fromX, br[0] + br[2] / 2, p), 540, implode), y: lerp(br[1] + br[3] / 2, 960, implode), s: breathe * (1 - implode), r: implode * (idx ? 40 : -40), o: P(t, 15.5, 15.7) });
  });
  /* leap across the campaign (Action Sheet 3) */
  if (t >= 14.25 && t < 15.15) {
    const p = P(t, 14.25, 15.15, E.ioQ);
    pose = 'c1x'; ax = bez(-180, 420, 1300, p); ay = bez(1560, 300, 640, p); asz = 270; aflip = false; ao = 1; ar = lerp(6, -4, p);
  }

  /* ---------- connections on the board */
  const lines = $('lines');
  const lp = P(t, 16.0, 16.7, E.outC) * (1 - P(t, 18.2, 18.45));
  if (lp > 0) {
    if (!lines.childElementCount) {
      const segs = ['M360 845 V875', 'M660 657 H690', 'M345 1017 H375', 'M202 1160 V1190', 'M202 1350 V1412', 'M660 1250 H690', 'M855 1070 V1100', 'M660 1467 H690'];
      lines.innerHTML = segs.map((d) => `<path d="${d}" pathLength="1"/>`).join('') +
        [[360, 860], [675, 657], [360, 1017], [202, 1175], [202, 1381], [675, 1250], [855, 1085], [675, 1467]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#F84608"/>`).join('');
    }
    lines.style.display = '';
    [...lines.querySelectorAll('path')].forEach((p) => { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = 1 - lp; });
    [...lines.querySelectorAll('circle')].forEach((c, i) => c.setAttribute('r', 9 * P(t, 16.2 + i * .06, 16.45 + i * .06, E.outBack) * (1 - P(t, 18.2, 18.4))));
  } else lines.style.display = 'none';

  /* character on the board: walks in, stands, crouches, launches (Action Sheet 1) */
  if (t >= 15.85 && t < 18.3) {
    if (t < 16.45) { const [ps, fl] = runPose(t, 12); pose = ps; aflip = fl; ax = lerp(-140, 855, P(t, 15.85, 16.45, E.outQ)); }
    else if (t < 17.85) { pose = 'a1'; ax = 855; }
    else if (t < 18.02) { pose = 'a5'; ax = 855; }
    else { pose = 'a6'; ax = 855; }
    ay = 470 - (t >= 18.02 ? 1100 * E.inQ(P(t, 18.02, 18.3)) : 0);
    asz = 170; ao = 1; ar = 0; asx = 1; asy = t >= 18.02 ? 1 + .12 * P(t, 18.02, 18.12) : 1;
    if (t >= 17.85 && t < 18.02) asy = 1 - .05 * P(t, 17.85, 18.0);
  }

  /* ---------- copy: sticky "SEEN." + running caption */
  const seenWhite = P(t, 11.5, 11.75) * (1 - P(t, 12.3, 12.42));
  [...seen.children].forEach((sp, i) => {
    const f = P(t, 4.26 + i * .05, 4.4 + i * .05);
    sp.style.color = f <= 0 ? '' : seenWhite > .5 ? '#fff' : `rgba(248,70,8,${lerp(.42, 1, f)})`;
    sp.style.textShadow = seenWhite > .5 ? '0 4px 30px rgba(0,0,0,.35)' : '';
  });
  if (t >= 6.4 && t < 15.7) {
    const ex = P(t, 15.3, 15.65, E.inC);
    put(seen, { x: 540, y: 235 - 420 * ex, ax: .5, ay: .86, s: .66 });
    seen.style.textShadow = '';
  } else if (t >= 6.5) hide(seen);
  cap.style.display = t > 7.2 && t < 15.8 ? '' : 'none';
  cap.style.color = seenWhite > .5 ? '#fff' : 'var(--ink)';
  cap.style.transform = 'translate(0px,1640px)'; cap.style.width = '1080px';
  capEls.forEach((el, i) => { const t0 = CAPS[i][0], t1 = CAPS[i + 1] ? CAPS[i + 1][0] - .2 : 99; el.style.display = maskIn(el, t, t0 + .02, { d: .5, out: t1, dOut: .2 }) ? '' : 'none'; });

  /* ---------- NOT PIECES. / A presence. */
  const n1 = $('n1'), n2 = $('n2');
  if (t > 16.0 && t < 18.5) { put(n1, { x: 540, y: 205, ay: .5 }); maskIn(n1, t, 16.1, { d: .5, out: 18.15, dOut: .3 }); } else hide(n1);
  if (t > 16.9 && t < 18.5) { put(n2, { x: 540, y: 1735, ay: .5 }); maskIn(n2, t, 17.0, { d: .5, out: 18.15, dOut: .3 }); } else hide(n2);

  /* ---------- BRAND: implode → the dot → fall & smash → UNNATE rises → hop → .COM → CTA */
  const dot = $('dot');
  if (t >= 18.55) {
    const pop = P(t, 18.55, 18.8, E.outBack);
    const mv = P(t, 18.95, 19.3, E.ioC);
    const d = lerp(lerp(0, 52, pop), LK.dotD, mv);
    const x = lerp(540, LK.dotX, mv), y = lerp(960, LK.dotY, mv) - 120 * Math.sin(Math.PI * mv) + ring(t, 19.3, 10, 4, 10);
    size(dot, d, d, d / 2); put(dot, { x, y });
  } else hide(dot);
  // the fall (Action Sheet 3) — reprise of the opening, now it builds instead of breaking
  const LX = LK.x0 + 300, LB = LK.base, PX2 = LK.x0 + LK.wmW * .8, PY2 = LK.base - LK.wmH - 4;
  if (t >= 19.02 && t < 19.35) {
    const p = P(t, 19.02, 19.35, E.inQ);
    pose = 'c2x'; ax = LX; ay = lerp(-150, LB + 4, p); asz = 230; aflip = false; ao = 1; ar = 0; asx = 1; asy = 1 + .1 * p;
    act(ghost1, 'c2x', { x: LX, y: lerp(-150, LB, Math.max(0, p - .14)), size: 230, o: .25 });
  } else if (t >= 19.35 && t < 19.72) {
    const tau = t - 19.35;
    pose = 'c3'; ax = LX; ay = LB + 6; asz = 230; aflip = false; ao = 1; ar = 0; asx = 1 + .05 * Math.exp(-14 * tau); asy = 1 - .08 * Math.exp(-14 * tau);
  } else if (t >= 19.72 && t < 20.25) {
    const j = P(t, 19.72, 20.25);
    pose = j < .5 ? 'a6' : 'a4'; aflip = false; ao = 1; ar = lerp(-6, 4, j); asx = 1; asy = 1;
    ax = lerp(LX, PX2, j); ay = lerp(LB, PY2, j) - 330 * Math.sin(Math.PI * j); asz = 210;
  } else if (t >= 20.25) {
    pose = t < 20.42 ? 'a1' : 'hero'; ax = PX2; ay = PY2; aflip = false; ao = 1; ar = 0; asx = 1;
    asy = t < 20.42 ? 1 - .07 * Math.exp(-14 * (t - 20.25)) : 1 + .015 * ring(t, 20.42, 1, 3, 6);
    asz = t < 20.42 ? 210 : 215;
  }
  shock(LX, LB + 4, t, 19.35, { r1: 640, flat: .14, col: '248,70,8', w: 5, life: .45 });
  debris(LX, LB - 10, t, 19.35, { n: 18, seed: 9, col: ['#F84608', '#C93800', '#8B5A3C'], power: .9 });
  dust(LX, LB, t, 19.62, { n: 18, spread: 320, r0: 70, r1: 200, life: 1.0, seed: 21, flat: .3 });
  sparks(770, 1505 - 120, t, 20.25, { n: 0 });
  // the wordmark rises out of the ground (exact supplied geometry — moved, never reshaped)
  const wm = $('wm'), wmc = $('wmClip');
  if (t >= 19.38) {
    wmc.style.display = '';
    const p = P(t, 19.38, 19.95, E.outBack);
    wm.style.transform = `translateY(${(1 - p) * (LK.wmH + 30)}px)`;
  } else wmc.style.display = 'none';
  const comc = $('comClip');
  if (t >= 20.25) {
    comc.style.display = '';
    [...$('com').children].forEach((s, i) => { const p = P(t, 20.27 + i * .06, 20.7 + i * .06, E.outBack); s.style.transform = `translateY(${(1 - p) * 120}%)`; });
  } else comc.style.display = 'none';
  // the hero pose's "!" lands as .COM clicks in
  const c1 = $('cta1'), c2 = $('cta2');
  if (t >= 20.8) { put(c1, { x: 540, y: 1150, ay: .5 }); maskIn(c1, t, 20.85, { d: .55 }); } else hide(c1);
  if (t >= 21.0) { put(c2, { x: 540, y: 1280, ay: .5 }); maskIn(c2, t, 21.05, { d: .6 }); } else hide(c2);

  /* ---------- commit the character */
  act(actor, pose, { x: ax, y: ay, size: asz, flip: aflip, r: ar, o: pose ? ao : 0, sx: asx, sy: asy });
  // the character sits behind the device while it is being stomped into shape, otherwise on top
  $('actor').style.zIndex = 5;

  return Promise.all(pending.map((im) => (im.complete ? Promise.resolve() : im.decode().catch(() => {}))));
}

/* ================================================================ boot */
window.FILM = { W, H, FPS, DUR };
window.seek = seek;
window.ready = (async () => {
  await document.fonts.load('800 100px Bricolage'); await document.fonts.load('italic 100px Instrument'); await document.fonts.ready;
  $('un').innerHTML = 'UN'.split('').map((c) => `<span style="display:inline-block;transform-origin:50% 86%">${c}</span>`).join('');
  $('seen').innerHTML = 'SEEN.'.split('').map((c) => `<span style="display:inline-block;transform-origin:50% 86%">${c}</span>`).join('');
  layoutLockup();
  const imgs = [...document.images];
  await Promise.all(imgs.map((im) => (im.complete ? Promise.resolve() : new Promise((r) => { im.onload = im.onerror = r; }))));
  // warm the video frames so every seek is decode-ready
  const warm = [];
  for (let i = 1; i <= N_CRAVE; i++) { const im = new Image(); im.src = frame('crave', i); warm.push(im.decode().catch(() => {})); }
  for (let i = 1; i <= N_SOLARA; i++) { const im = new Image(); im.src = frame('solara', i); warm.push(im.decode().catch(() => {})); }
  await Promise.all(warm);
  await seek(0);
  return true;
})();
