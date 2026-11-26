/* UNNATE — navigation, the background network, reveals, the hero demo, contacts, the QA summary
   and the project form. Everything still works, and stays readable, without JavaScript.
   The form posts to FormSubmit (https://formsubmit.co) using the addresses in config.js; success is shown
   only when FormSubmit confirms it accepted the enquiry. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.UNNATE_CONFIG || {};
  const EMAILS = (CFG.emails || []).filter(Boolean);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* navigation: firmer pill after scrolling, phone menu */
  const nav = $('[data-nav]');
  if (nav) { const on = () => nav.classList.toggle('compact', scrollY > 24); on(); addEventListener('scroll', on, { passive: true }); }
  const toggle = $('.menu-toggle'), menu = $('#menu');
  if (toggle && menu) {
    const set = open => { toggle.setAttribute('aria-expanded', String(open)); menu.classList.toggle('open', open); };
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { set(false); toggle.focus(); } });
    document.addEventListener('click', e => { if (!e.target.closest('.nav-pill')) set(false); });
  }

  /* the network: fine dotted routes, small nodes, and points that travel along them.
     It draws itself in on first load, drifts slower than the page as you scroll, and the
     points speed up a little while you scroll. Static for reduced motion; lighter on phones. */
  const network = () => {
    const cv = document.createElement('canvas');
    cv.className = 'net'; cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const GAP = 10, K = 0.42;
    let W = 0, H = 0, small = false, paths = [], nodes = [], packets = [], fade = null;
    let t0 = performance.now(), last = t0, lastDraw = 0, lastY = scrollY, energy = 0, raf = 0, built = false;
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const bez = (s, t) => { const u = 1 - t; return [u*u*u*s[0][0] + 3*u*u*t*s[1][0] + 3*u*t*t*s[2][0] + t*t*t*s[3][0], u*u*u*s[0][1] + 3*u*u*t*s[1][1] + 3*u*t*t*s[2][1] + t*t*t*s[3][1]]; };
    const sample = segs => {
      const pts = []; let need = 0;
      for (const s of segs) {
        let a = bez(s, 0);
        for (let i = 1; i <= 48; i++) {
          const b = bez(s, i / 48), dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
          let pos = 0;
          while (need <= d - pos) { pos += need; const k = d ? pos / d : 0; pts.push([a[0] + dx * k, a[1] + dy * k]); need = GAP; }
          need -= d - pos; a = b;
        }
      }
      return pts;
    };
    const addPath = (segs, delay) => {
      const dots = sample(segs);
      if (dots.length < 2) return;
      let y0 = Infinity, y1 = -Infinity;
      dots.forEach(d => { if (d[1] < y0) y0 = d[1]; if (d[1] > y1) y1 = d[1]; });
      const p = { dots, y0, y1, delay };
      paths.push(p);
      if (rnd() < (small ? 0.45 : 0.7)) packets.push({ p, s: rnd() * dots.length, v: 34 + rnd() * 40, hot: rnd() < 0.2 });
    };
    const build = () => {
      W = innerWidth; H = innerHeight; small = W < 720;
      const dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed = 11; paths = []; nodes = []; packets = [];
      const docH = document.documentElement.scrollHeight;
      const worldH = H + Math.max(0, docH - H) * K + 240;
      const step = small ? 470 : 360, cols = small ? 2 : 3;
      let prevJoints = null, lane = 0;
      for (let y = 90 + rnd() * 80; y < worldH; y += step * (0.82 + rnd() * 0.36), lane++) {
        const joints = [[-60, y + (rnd() - 0.5) * 60]];
        for (let i = 1; i < cols; i++) joints.push([W * i / cols + (rnd() - 0.5) * W * 0.12, y + (rnd() - 0.5) * step * 0.6]);
        joints.push([W + 60, y + (rnd() - 0.5) * 60]);
        const segs = [];
        for (let i = 0; i < joints.length - 1; i++) {
          const a = joints[i], b = joints[i + 1], dx = (b[0] - a[0]) * 0.46;
          segs.push([a, [a[0] + dx, a[1]], [b[0] - dx, b[1]], b]);
        }
        addPath(segs, Math.min(lane, 6) * 110);
        joints.slice(1, -1).forEach(j => nodes.push({ x: j[0], y: j[1], hot: rnd() < 0.25, ph: rnd() * 6.28 }));
        if (prevJoints && rnd() < (small ? 0.5 : 0.85)) {
          const a = prevJoints[1 + Math.floor(rnd() * (prevJoints.length - 2))], b = joints[1 + Math.floor(rnd() * (joints.length - 2))];
          const my = (b[1] - a[1]) * 0.5;
          addPath([[a, [a[0], a[1] + my], [b[0], b[1] - my], b]], Math.min(lane, 6) * 110 + 300);
        }
        prevJoints = joints;
      }
      fade = ctx.createLinearGradient(0, 0, W, 0);
      fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(small ? 0.12 : 0.2, 'rgba(0,0,0,0)');
      fade.addColorStop(0.5, `rgba(0,0,0,${small ? 0.55 : 0.72})`);
      fade.addColorStop(small ? 0.88 : 0.8, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,0)');
      built = true;
    };
    const ease = t => 1 - Math.pow(1 - t, 3);
    const draw = now => {
      raf = 0;
      if (!built) return;
      if (small && !still && now - lastDraw < 32) { raf = requestAnimationFrame(draw); return; }
      const dt = Math.min(0.064, (now - last) / 1000); last = now; lastDraw = now;
      const y = scrollY, v = Math.abs(y - lastY) / Math.max(dt, 0.001); lastY = y;
      energy += (Math.min(2.4, v / 700) - energy) * 0.08;
      const off = still ? 0 : y * K;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(40,64,194,0.16)';
      ctx.beginPath();
      for (const p of paths) {
        if (p.y1 - off < -12 || p.y0 - off > H + 12) continue;
        const k = still ? 1 : ease(clamp((now - t0 - p.delay) / 1500));
        const n = Math.floor(p.dots.length * k);
        for (let i = 0; i < n; i++) {
          const d = p.dots[i], dy = d[1] - off;
          if (dy < -4 || dy > H + 4) continue;
          ctx.moveTo(d[0] + 1.25, dy); ctx.arc(d[0], dy, 1.25, 0, 6.2832);
        }
      }
      ctx.fill();
      const intro = still ? 1 : ease(clamp((now - t0 - 500) / 900));
      for (const nd of nodes) {
        const dy = nd.y - off;
        if (dy < -20 || dy > H + 20) continue;
        const pulse = still ? 0 : Math.sin(now / 900 + nd.ph) * 0.5 + 0.5;
        ctx.globalAlpha = intro;
        ctx.strokeStyle = nd.hot ? 'rgba(255,91,31,0.35)' : 'rgba(40,64,194,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(nd.x, dy, 5 + pulse * 1.6, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = nd.hot ? 'rgba(255,91,31,0.75)' : 'rgba(40,64,194,0.5)';
        ctx.beginPath(); ctx.arc(nd.x, dy, 2.2, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!still) {
        for (const pk of packets) {
          const L = pk.p.dots.length;
          pk.s += pk.v * (1 + energy) * dt / GAP;
          if (pk.s > L + 30) pk.s = -30;
          if (now - t0 < pk.p.delay + 1500) continue;
          const i = Math.floor(pk.s);
          if (i < 0 || i >= L) continue;
          const d = pk.p.dots[i], dy = d[1] - off;
          if (dy < -20 || dy > H + 20) continue;
          const col = pk.hot ? '255,91,31' : '40,64,194';
          for (let j = 1; j <= 7; j++) {
            const t = pk.p.dots[i - j]; if (!t) break;
            ctx.fillStyle = `rgba(${col},${(0.42 * (1 - j / 8)).toFixed(3)})`;
            ctx.beginPath(); ctx.arc(t[0], t[1] - off, 1.6, 0, 6.2832); ctx.fill();
          }
          ctx.fillStyle = `rgba(${col},0.16)`;
          ctx.beginPath(); ctx.arc(d[0], dy, 6, 0, 6.2832); ctx.fill();
          ctx.fillStyle = `rgba(${col},0.9)`;
          ctx.beginPath(); ctx.arc(d[0], dy, 2.4, 0, 6.2832); ctx.fill();
        }
      }
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = fade; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      if (!still && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    let rt = 0;
    const rebuild = () => { clearTimeout(rt); rt = setTimeout(() => { build(); kick(); }, 160); };
    build(); kick();
    addEventListener('resize', rebuild);
    addEventListener('load', rebuild);
    if ('ResizeObserver' in window) { let h = document.documentElement.scrollHeight; new ResizeObserver(() => { const n = document.documentElement.scrollHeight; if (Math.abs(n - h) > 200) { h = n; rebuild(); } }).observe(document.body); }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = performance.now(); kick(); } });
  };
  if (!document.documentElement.hasAttribute('data-no-net')) network();

  /* reveals: anything already on screen is shown at once; the rest rises in as it arrives.
     Both get .in, which also starts the route animations inside them. */
  const rev = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(el => {
      if (still || el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); return; }
      el.classList.add('pre'); io.observe(el);
    });
  } else rev.forEach(el => el.classList.add('in'));

  /* contacts come from config.js only; nothing is invented */
  $$('[data-emails]').forEach(el => {
    if (!EMAILS.length) { el.hidden = true; return; }
    el.innerHTML = EMAILS.map(m => `<a href="mailto:${m}">${m}</a>`).join(el.hasAttribute('data-emails-list') ? '<br>' : ' · ');
  });
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* QA summary: numbers come from the real QA run (qa/summary.json), never typed by hand */
  const qa = $('[data-qa-summary]');
  if (qa) {
    fetch(qa.dataset.qaSrc || '/qa/summary.json').then(r => r.ok ? r.json() : null).then(d => {
      if (!d || !d.total) return;
      $$('[data-qa-pass]').forEach(el => { el.textContent = d.passed; });
      $$('[data-qa-total]').forEach(el => { el.textContent = d.total; });
      $$('[data-qa-date]').forEach(el => { el.textContent = d.date; });
    }).catch(() => {});
  }

  /* hero visual: it tilts back slightly and straightens as you scroll to it */
  const tilt = $('[data-tilt]');
  if (tilt && !still) {
    const set = () => {
      if (innerWidth <= 820) { tilt.style.setProperty('--tilt', '0'); return; }
      const r = tilt.getBoundingClientRect();
      tilt.style.setProperty('--tilt', clamp((r.top - innerHeight * 0.12) / (innerHeight * 0.75)).toFixed(3));
    };
    set(); addEventListener('scroll', set, { passive: true }); addEventListener('resize', set);
  }

  /* hero demo: figures count up; a request travels from the website form into the job list */
  const app = $('[data-hero-app]');
  if (app && !still) {
    $$('[data-count]', app).forEach(el => {
      const end = Number(el.dataset.count); let n = 0; el.textContent = '0';
      const step = () => { n += Math.max(1, Math.round(end / 12)); el.textContent = String(Math.min(n, end)); if (n < end) setTimeout(step, 55); };
      setTimeout(step, 500);
    });
    const row = $('[data-cycle]', app);
    if (row) {
      const st = $('[data-cycle-st]', row), av = $('[data-cycle-av]', row), when = $('[data-cycle-when]', row);
      const states = [
        { s: 'st-new', t: 'New', a: 'av-n', l: '–', w: 'from the website form' },
        { s: 'st-sch', t: 'Scheduled', a: 'av-j', l: 'J', w: 'Josh · tomorrow 9am' }
      ];
      let i = 0;
      setInterval(() => {
        i = (i + 1) % states.length; const x = states[i];
        st.className = `st ${x.s}`; st.textContent = x.t;
        av.className = `av ${x.a}`; av.textContent = x.l; when.textContent = x.w;
        row.classList.add('flash'); setTimeout(() => row.classList.remove('flash'), 1000);
      }, 2400);
    }
  }
  if (still) $$('svg.rt, svg.hv-rt').forEach(s => s.pauseAnimations && s.pauseAnimations());

  /* process timeline: the route fills as you read */
  const tl = $('[data-timeline]');
  if (tl && !still) {
    const fill = () => {
      const r = tl.getBoundingClientRect();
      tl.style.setProperty('--fill', clamp((innerHeight * 0.6 - r.top) / r.height).toFixed(3));
    };
    fill(); addEventListener('scroll', fill, { passive: true }); addEventListener('resize', fill);
  }

  /* project form */
  const form = $('[data-form]');
  if (!form) return;

  /* preselect from links like /start/?service=website&package=one-page */
  const q = new URLSearchParams(location.search);
  const svc = { website: 'Website Development', software: 'Custom Business Software' }[q.get('service')];
  if (svc) { const r = $$('input[name=service]', form).find(i => i.value === svc); if (r) r.checked = true; }
  const pkg = q.get('package');
  if (pkg && form.elements.package && [...form.elements.package.options].some(o => o.value === pkg)) form.elements.package.value = pkg;

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const URLISH = /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i;
  const ENDPOINT = EMAILS.length ? `https://formsubmit.co/ajax/${encodeURIComponent(String(CFG.formsubmitAlias || '').trim() || EMAILS[0])}` : '';
  const BLACKLIST = 'viagra, cialis, casino, porn, escort, payday loan, backlinks, guest post';
  const card = form.closest('[data-formcard]');
  const sentView = $('[data-view=sent]', card), formView = $('[data-view=form]', card);
  const alertBox = $('.form-alert', form), submit = $('button[type=submit]', form), label = $('[data-label]', submit);
  const idle = label.textContent;
  const contactHint = EMAILS.length ? ` You can also email ${EMAILS.join(' or ')}.` : '';

  const labelOf = el => {
    const host = (el.type === 'checkbox' || el.type === 'radio') ? el.closest('fieldset')?.querySelector('legend') : $(`label[for="${CSS.escape(el.id)}"]`, form);
    if (!host) return el.name;
    const c = host.cloneNode(true); $$('.opt', c).forEach(o => o.remove());
    return c.textContent.replace(/\s+/g, ' ').trim().replace(/[?:]$/, '');
  };
  const setError = (el, msg) => {
    const field = el.closest('.field'); if (!field) return;
    let p = $('.err', field);
    if (!msg) { p?.remove(); el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); return; }
    if (!p) { p = document.createElement('p'); p.className = 'err'; p.id = (el.id || el.name) + '-err'; field.appendChild(p); }
    p.textContent = msg;
    el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', p.id);
  };
  const validate = () => {
    const bad = [];
    $$('input:not([type=checkbox]):not([type=radio]),select,textarea', form).forEach(el => {
      if (el.closest('.hp')) return;
      const v = el.value.trim(); let msg = '';
      if (el.required && !v) msg = el.dataset.msg || 'Fill in this field.';
      else if (el.type === 'email' && v && !EMAIL.test(v)) msg = 'Enter an email address like name@business.com.';
      else if (el.name === 'website' && v && !URLISH.test(v)) msg = 'Enter a web address like yourbusiness.com, or leave it empty.';
      setError(el, msg); if (msg) bad.push(el);
    });
    $$('fieldset[data-required]', form).forEach(fs => {
      const first = $('input', fs), any = $$('input', fs).some(i => i.checked);
      const field = fs.closest('.field');
      let p = field && $('.err', field);
      if (any) { p?.remove(); fs.removeAttribute('aria-invalid'); fs.removeAttribute('aria-describedby'); return; }
      if (!p) { p = document.createElement('p'); p.className = 'err'; p.id = fs.id + '-err'; field.appendChild(p); }
      p.textContent = fs.dataset.msg || 'Choose at least one option.';
      fs.setAttribute('aria-invalid', 'true'); fs.setAttribute('aria-describedby', p.id);
      bad.push(first);
    });
    return bad;
  };
  form.addEventListener('input', () => { if ($('[aria-invalid=true]', form)) validate(); });
  form.addEventListener('change', () => { if ($('[aria-invalid=true]', form)) validate(); });

  let sending = false;
  const setSending = on => {
    sending = on; submit.setAttribute('aria-disabled', String(on));
    label.innerHTML = on ? '<span class="spinner" aria-hidden="true"></span> Sending…' : idle;
  };
  const fail = msg => { alertBox.textContent = msg; alertBox.hidden = false; alertBox.focus(); };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    alertBox.hidden = true;
    const bad = validate(); if (bad.length) { bad[0].focus(); return; }
    if (!ENDPOINT) { fail('This form cannot send yet.' + contactHint); return; }
    const fields = {};
    $$('input,select,textarea', form).forEach(el => {
      if (!el.name || el.closest('.hp') || ((el.type === 'checkbox' || el.type === 'radio') && !el.checked)) return;
      const k = labelOf(el), v = el.value.trim();
      if (el.type === 'checkbox') fields[k] = fields[k] ? `${fields[k]}, ${v}` : v;
      else fields[k] = v || '—';
    });
    const name = form.elements.name.value.trim(), biz = form.elements.business.value.trim();
    const payload = {
      _subject: `${form.dataset.subject || 'Project enquiry'} — ${biz || name}`,
      _replyto: form.elements.email.value.trim(),
      _cc: EMAILS.slice(1).join(','),
      _template: 'table',
      _captcha: 'false',
      _honey: form.elements._honey?.value || '',
      _blacklist: BLACKLIST,
      ...fields,
      Page: `${location.origin}${location.pathname}`
    };
    const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 20000);
    setSending(true);
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      let body = null; try { body = await res.json(); } catch { /* not JSON */ }
      if (res.ok && body && String(body.success) === 'true') {
        formView.hidden = true; sentView.hidden = false;
        $('h2', sentView).focus();
      } else {
        if (body && body.message) console.warn('FormSubmit:', body.message);
        fail('Your enquiry was not sent: the form service did not accept it. Nothing you typed is lost. Try again in a minute.' + contactHint);
      }
    } catch (err) {
      fail((err.name === 'AbortError' ? 'Your enquiry was not sent: the connection timed out.' : 'Your enquiry was not sent: the form service could not be reached.') + ' Nothing you typed is lost. Check your connection and try again.' + contactHint);
    } finally { clearTimeout(t); setSending(false); }
  });
})();
