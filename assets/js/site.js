/* UNNATE · shared behaviour for every page. No libraries.
   Navigation, reveals, the character, enquiry forms, tab sets, the reading timeline,
   the landing-page hero and footer links. Page-specific code lives in home.js and work.js. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const doc = document.documentElement;
  const CFG = window.UNNATE_CONFIG || {};
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const FINE = matchMedia('(hover: hover) and (pointer: fine)');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const behavior = () => (RM.matches ? 'auto' : 'smooth');
  const U = window.UNNATE = { $, $$, esc, RM, FINE, CFG, behavior };

  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- verified contact links only (assets/js/config.js) ---------- */
  const EMAILS = (Array.isArray(CFG.emails) ? CFG.emails : [CFG.emails]).map(e => String(e || '').trim()).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e));
  const links = EMAILS.map(e => ({ kind: 'email', href: `mailto:${e}`, text: e }));
  if (CFG.instagram) links.push({ kind: 'social', href: CFG.instagram, text: 'Instagram', ext: true });
  if (CFG.linkedin) links.push({ kind: 'social', href: CFG.linkedin, text: 'LinkedIn', ext: true });
  const ext = l => l.ext ? ' target="_blank" rel="noopener"' : '';
  const newTab = l => l.ext ? '<span class="vh"> (opens in a new tab)</span>' : '';
  $$('[data-connect]').forEach(ul => {
    ul.innerHTML = '<li><a href="#contact" data-enquire>Send an enquiry</a></li>' +
      links.map(l => `<li><a href="${esc(l.href)}"${ext(l)}>${esc(l.text)}${newTab(l)}</a></li>`).join('');
    if (ul.dataset.connect) $('a', ul).setAttribute('href', ul.dataset.connect);
  });
  // on the contact cards: both email addresses, once they are filled in
  $$('[data-direct]').forEach(box => {
    if (!EMAILS.length) { box.remove(); return; }
    box.innerHTML = `<p class="direct-k">Or email us directly</p>` + EMAILS.map(e => `<a class="glass-blue" href="mailto:${esc(e)}"><svg class="ic" aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg>${esc(e)}</a>`).join('');
  });

  /* ---------- navigation ---------- */
  const nav = $('[data-nav]'), toggle = $('.nav-toggle'), sheet = $('#nav-sheet');
  if (nav) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:140px;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(([e]) => nav.classList.toggle('compact', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(sentinel);
  }
  if (toggle && sheet) {
    const setMenu = open => {
      toggle.setAttribute('aria-expanded', String(open));
      $('.vh', toggle).textContent = open ? 'Close menu' : 'Open menu';
      sheet.hidden = !open; sheet.classList.toggle('open', open);
    };
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    sheet.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); toggle.focus(); } });
    document.addEventListener('pointerdown', e => { if (!sheet.hidden && !e.target.closest('[data-nav]')) setMenu(false); });
    addEventListener('resize', () => { if (!sheet.hidden && innerWidth > 640) setMenu(false); });
  }

  /* ---------- reveals that carry meaning ---------- */
  $$('[data-stagger]').forEach(g => [...g.children].forEach((c, i) => c.style.setProperty('--k', i)));
  $$('.track').forEach(t => [...t.children].forEach((c, i) => c.style.setProperty('--k', i)));
  const arrive = els => {
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
    els.forEach(el => io.observe(el));
  };
  arrive($$('[data-reveal], .print, .notes, [data-stagger], .track'));
  U.arrive = arrive;

  /* ---------- glass steps: the step you are reading turns from glass to solid ---------- */
  const steps = $$('[data-step]');
  const stepIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) steps.forEach(st => st.classList.toggle('now', st === e.target)); }), { rootMargin: '-44% 0px -44% 0px' });
  steps.forEach(st => stepIO.observe(st));

  /* ---------- light on glass follows the pointer ---------- */
  if (FINE.matches) {
    let gx = 0, gy = 0, graf = 0;
    addEventListener('pointermove', e => {
      gx = e.clientX; gy = e.clientY;
      if (graf) return;
      graf = requestAnimationFrame(() => {
        graf = 0;
        const g = document.elementFromPoint(gx, gy)?.closest('.glass, .glass-dark');
        if (g) { const r = g.getBoundingClientRect(); g.style.setProperty('--mx', ((gx - r.left) / r.width * 100).toFixed(1) + '%'); g.style.setProperty('--my', ((gy - r.top) / r.height * 100).toFixed(1) + '%'); }
      });
    }, { passive: true });
  }

  /* ---------- the character, animated from the supplied action sheet ----------
     Each actor holds the sheet's poses as stacked frames. Frames cross-fade (90ms) instead of
     cutting, and the whole figure moves as one box, so the artwork itself is never distorted. */
  const makeActor = root => {
    const frames = {}; $$('img[data-f]', root).forEach(i => { frames[i.dataset.f] = i; });
    let cur = null, timers = [];
    const show = f => { if (cur === f || !frames[f]) return; if (cur) frames[cur].classList.remove('on'); frames[f].classList.add('on'); cur = f; };
    const move = (x, y, ms = 0, ease = 'linear') => {
      root.style.setProperty('--at', ms + 'ms'); root.style.setProperty('--ae', ease);
      root.style.setProperty('--ax', x.toFixed(1) + 'px'); root.style.setProperty('--ay', y.toFixed(1) + 'px');
      root.style.setProperty('--fs', (1 - Math.min(.35, Math.abs(y) / 60)).toFixed(3));
    };
    const stop = () => { timers.forEach(clearTimeout); timers = []; };
    // a sequence: [frame, duration ms, x, y, ease]
    const play = (seq, done) => {
      stop(); let t = 0;
      seq.forEach(([f, d, x, y, e]) => { timers.push(setTimeout(() => { show(f); if (x !== undefined) move(x, y || 0, d, e || 'cubic-bezier(.22,1,.36,1)'); }, t)); t += d; });
      if (done) timers.push(setTimeout(done, t));
    };
    return { show, move, stop, play, get cur() { return cur; }, root };
  };
  U.makeActor = makeActor;

  /* The contact character: walks in once when the card comes into view, then stands and breathes.
     It hops when pointed at or tapped, crouches to watch while you type, and leaps when an enquiry is sent. */
  const contactActor = (root, form) => {
    const a = makeActor(root);
    let ready = false, busy = false, typing = false, glances = 0;
    a.show('stand');
    const rest = () => { busy = false; a.show(typing ? 'crouch' : 'stand'); a.move(0, 0, 200); };
    const walkIn = () => {
      if (RM.matches) { ready = true; return; }
      busy = true; root.classList.remove('idle');
      const w = root.offsetWidth, x0 = -w * .55;
      a.move(x0, 0); root.style.opacity = '0';
      requestAnimationFrame(() => { root.style.transition = 'opacity .35s ease'; root.style.opacity = '1'; });
      const cyc = ['step', 'hop', 'stride', 'hop', 'step', 'hop', 'stride', 'hop'];
      const seq = cyc.map((f, i) => [f, 140, x0 + (i + 1) * (-x0 / cyc.length), i % 2 ? -3 : 0]);
      seq.push(['crouch', 160, 0, 0], ['stand', 120, 0, 0]);
      a.play(seq, () => { ready = true; rest(); if (FINE.matches) root.classList.add('idle'); });
    };
    const hop = () => {
      if (!ready || busy) return;
      if (RM.matches) { a.show('leap'); setTimeout(rest, 500); return; }
      busy = true; root.classList.remove('idle');
      a.play([['crouch', 120, 0, 2], ['leap', 260, 0, -22, 'cubic-bezier(.2,.8,.3,1)'], ['hop', 220, 0, 0, 'cubic-bezier(.5,0,.8,.6)'], ['stand', 140, 0, 0]],
        () => { rest(); if (FINE.matches) root.classList.add('idle'); });
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !ready && !busy) walkIn();
      root.classList.toggle('idle', e.isIntersecting && ready && !busy && FINE.matches && !RM.matches);
    }, { threshold: .6 }).observe(root);
    if (FINE.matches) root.addEventListener('pointerenter', hop);
    root.addEventListener('click', hop);
    if (FINE.matches && !RM.matches) setInterval(() => {
      if (!ready || busy || typing || document.hidden || glances >= 3) return;
      const r = root.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      glances++; a.show('crouch'); setTimeout(() => { if (!busy && !typing) a.show('stand'); }, 1100);
    }, 7000);
    if (form) {
      form.addEventListener('change', e => { if (e.target.type === 'checkbox' && e.target.checked) hop(); });
      form.addEventListener('focusin', e => { if (!e.target.matches('input:not([type=checkbox]),textarea,select')) return; typing = true; if (!busy) a.show('crouch'); });
      form.addEventListener('focusout', () => { typing = false; setTimeout(() => { if (!typing && !busy) a.show('stand'); }, 300); });
      form.addEventListener('enquiry:sent', () => { busy = false; hop(); setTimeout(() => { busy = false; hop(); }, 900); });
    }
  };

  /* ---------- enquiry forms → FormSubmit ----------
     Each form says what kind of enquiry it is (data-kind) and which fields it requires (required + data-msg).
     A valid form is posted with FormSubmit's AJAX endpoint (https://formsubmit.co/ajax/…), so the visitor
     stays on the page. It goes to the first studio address, with the second copied in (_cc), and shows
     success only when FormSubmit answers that it accepted the enquiry. No key or secret is involved. */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const SUBJECT = { general: 'Studio enquiry', clinic: 'Clinic website enquiry', student: 'Final-year project enquiry' };
  // FormSubmit discards any submission containing one of these phrases (checked on its server)
  const BLACKLIST = 'viagra, cialis, casino, porn, escort, payday loan, backlinks, guest post';
  const ENDPOINT = EMAILS.length ? `https://formsubmit.co/ajax/${encodeURIComponent(String(CFG.formsubmitAlias || '').trim() || EMAILS[0])}` : '';
  // the visible label of a field, without "(optional)" and similar notes
  const labelOf = (form, el) => {
    const host = el.type === 'checkbox' ? el.closest('fieldset')?.querySelector('legend') : $(`label[for="${CSS.escape(el.id)}"]`, form);
    if (!host) return el.name;
    const c = host.cloneNode(true); $$('.opt', c).forEach(o => o.remove());
    return c.textContent.replace(/\s+/g, ' ').trim().replace(/[?:]$/, '');
  };
  const emailHint = EMAILS.length ? `, or email us at ${EMAILS.join(' or ')}.` : '.';
  $$('[data-form]').forEach(form => {
    const card = form.closest('[data-formcard]') || form.parentElement;
    const views = { form: $('[data-view=form]', card), sent: $('[data-view=sent]', card) };
    const alertBox = $('.form-alert', form), submit = $('button[type=submit]', form), label = $('[data-label]', submit);
    const idle = label.textContent;
    const actorRoot = form.closest('.contact')?.querySelector('.actor-c');
    if (actorRoot) contactActor(actorRoot, form);

    const setError = (input, msg) => {
      const field = input.closest('.field'); if (!field) return;
      let el = $('.err', field);
      const hint = $('.hint', field);
      if (!msg) { el?.remove(); input.removeAttribute('aria-invalid'); if (hint) input.setAttribute('aria-describedby', hint.id); else input.removeAttribute('aria-describedby'); return; }
      if (!el) { el = document.createElement('p'); el.className = 'err'; el.id = input.id + '-err'; field.appendChild(el); }
      el.textContent = msg; input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', hint ? `${el.id} ${hint.id}` : el.id);
    };
    const validate = () => {
      const bad = [];
      $$('input,textarea,select', form).forEach(i => {
        if (i.type === 'checkbox' || i.closest('.hp')) return;
        const v = i.value.trim();
        let msg = '';
        if (i.required && !v) msg = i.dataset.msg || 'This field is required.';
        else if (i.type === 'email' && v && !EMAIL.test(v)) msg = 'Enter an email address in the format name@example.com.';
        setError(i, msg); if (msg) bad.push(i);
      });
      return bad;
    };
    form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid')) validate(); });

    let sending = false;
    const setSending = on => {
      sending = on; submit.setAttribute('aria-disabled', String(on));
      label.innerHTML = on ? '<span class="spinner" aria-hidden="true"></span>Sending…' : esc(idle);
    };
    const fail = msg => { alertBox.textContent = msg; alertBox.hidden = false; alertBox.scrollIntoView({ block: 'nearest', behavior: behavior() }); };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (sending) return;                                   // no duplicate submissions
      alertBox.hidden = true;
      const bad = validate(); if (bad.length) { bad[0].focus(); return; }
      if (!ENDPOINT) { fail('Enquiries can’t be sent from this page yet. Please try again later.'); return; }
      // readable field names, in the order they appear on the form; ticked options joined into one line
      const kind = form.dataset.kind || 'general', fields = {};
      $$('input, textarea, select', form).forEach(el => {
        if (!el.name || el.closest('.hp') || (el.type === 'checkbox' && !el.checked)) return;
        const k = labelOf(form, el), v = el.value.trim();
        if (el.type === 'checkbox') fields[k] = fields[k] ? `${fields[k]}, ${v}` : v;
        else fields[k] = v || '—';
      });
      const name = form.elements.name.value.trim(), email = form.elements.email.value.trim();
      const who = ['company', 'clinic', 'college'].map(n => form.elements[n]?.value.trim()).find(Boolean);
      const payload = {
        _subject: `${SUBJECT[kind] || SUBJECT.general} — ${name}${who ? ` (${who})` : ''}`,
        _replyto: email,                                       // “Reply” in the inbox answers the visitor
        _cc: EMAILS.slice(1).join(','),                        // the second studio inbox receives a copy
        _template: 'table',
        _captcha: 'false',                                     // reCAPTCHA can't be shown to an AJAX request
        _honey: form.elements._honey?.value || '',             // FormSubmit silently drops it if a bot filled this in
        _blacklist: BLACKLIST,
        Form: SUBJECT[kind] || SUBJECT.general,
        ...fields,
        Page: `${location.origin}${location.pathname} (${document.title})`
      };
      const ctrl = new AbortController(), t = setTimeout(() => ctrl.abort(), 20000);
      setSending(true);
      try {
        const res = await fetch(ENDPOINT, { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
        let body = null; try { body = await res.json(); } catch { /* not JSON */ }
        // success is shown only when FormSubmit confirms it accepted the enquiry ("success": "true" or true)
        if (res.ok && body && String(body.success) === 'true') {
          views.form.hidden = true; views.sent.hidden = false;
          $('h3', views.sent).focus();
          form.dispatchEvent(new CustomEvent('enquiry:sent'));
        } else {
          // e.g. before activation FormSubmit answers success "false" with a message saying so; the owner sees it here
          if (body && body.message) console.warn('FormSubmit:', body.message);
          fail('Your enquiry wasn’t sent. The server didn’t accept it. Nothing you typed has been lost. Try sending it again in a moment' + emailHint);
        }
      } catch (err) {
        fail(err.name === 'AbortError'
          ? 'Your enquiry wasn’t sent. The connection timed out. Nothing you typed has been lost. Check your connection and send it again' + emailHint
          : 'Your enquiry wasn’t sent. We couldn’t reach the server. Nothing you typed has been lost. Check your connection and send it again' + emailHint);
      } finally { clearTimeout(t); setSending(false); }
    });
  });

  /* every "contact" action brings you to this page's form, with the right option already ticked;
     on a page without a form, the link's own href takes you to one */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-enquire]'); if (!t) return;
    const contact = $('#contact'), form = contact && $('[data-form]', contact);
    if (!form) return;
    e.preventDefault();
    if (t.dataset.service) $$('input[type=checkbox]', form).forEach(c => { if (c.value === t.dataset.service) c.checked = true; });
    if (location.hash !== '#contact') history.pushState(null, '', '#contact');
    contact.scrollIntoView({ behavior: behavior(), block: 'start' });
    const first = $('input:not([type=checkbox]):not([tabindex="-1"])', form);
    setTimeout(() => first && first.focus({ preventScroll: true }), RM.matches ? 0 : 650);
  });

  /* ---------- tab sets: one control, one panel (keyboard: arrows, Home, End) ---------- */
  $$('[data-tabset]').forEach(set => {
    const tabs = $$('[role=tab]', set), panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));
    const select = (i, focus) => {
      i = (i + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels.forEach((p, k) => { if (!p) return; const was = p.hidden; p.hidden = k !== i; if (k === i && was && !RM.matches) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); } });
      if (focus) tabs[i].focus();
    };
    tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));
    set.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: 'h', End: 'e' }[e.key];
      if (k === undefined || !e.target.closest('[role=tab]')) return;
      e.preventDefault();
      const cur = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
      select(k === 'h' ? 0 : k === 'e' ? tabs.length - 1 : cur + k, true);
    });
  });

  /* ---------- the reading timeline: the line fills as you read, each step lights when it is reached ---------- */
  $$('.timeline').forEach(tl => {
    const steps = $$('.tl', tl);
    let raf = 0;
    const draw = () => {
      raf = 0;
      const r = tl.getBoundingClientRect(), mid = innerHeight * .55;
      const p = Math.max(0, Math.min(1, (mid - r.top) / Math.max(1, r.height)));
      tl.style.setProperty('--tp', RM.matches ? 1 : p.toFixed(3));
      steps.forEach(s => s.classList.toggle('on', RM.matches || s.getBoundingClientRect().top < mid));
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
    let live = false;
    new IntersectionObserver(([e]) => { live = e.isIntersecting; if (live) kick(); }).observe(tl);
    addEventListener('scroll', () => { if (live) kick(); }, { passive: true });
    addEventListener('resize', kick);
    draw();
  });

  /* ---------- landing hero: lines arrive once fonts are ready; the screens drift a little as you scroll ---------- */
  const lhero = $('.lhero');
  if (lhero) {
    $$('.lhero-h .ln', lhero).forEach((ln, i) => ln.style.setProperty('--l', i));
    $$('.cap-code, .cap-caret', lhero).forEach(c => new IntersectionObserver(([e]) => c.classList.toggle('live', e.isIntersecting)).observe(c));
    const pulse = $('.cap-pulse', lhero);
    if (pulse && !RM.matches) setTimeout(() => pulse.classList.add('live'), 2800);
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 700))]).then(() => requestAnimationFrame(() => lhero.classList.add('go')));
    const drift = $('[data-drift]', lhero);
    if (drift && !RM.matches && matchMedia('(min-width: 40.01em)').matches) {      // no drift on phones: it opens gaps on small screens
      let raf = 0;
      const draw = () => { raf = 0; const y = Math.min(scrollY, innerHeight); drift.style.setProperty('--py', (y * -.05).toFixed(1) + 'px'); };
      addEventListener('scroll', () => { if (!raf && scrollY < innerHeight * 1.2) raf = requestAnimationFrame(draw); }, { passive: true });
    }
    const fa = $('.actor-f', lhero);
    if (fa) {
      const a = makeActor(fa); a.show('stand');
      const pose = f => () => { if (!RM.matches) a.show(f); };
      if (FINE.matches) { fa.addEventListener('pointerenter', pose('crouch')); fa.addEventListener('pointerleave', pose('stand')); }
      fa.addEventListener('click', () => { if (RM.matches) return; a.play([['crouch', 120, 0, 2], ['leap', 260, 0, -18, 'cubic-bezier(.2,.8,.3,1)'], ['hop', 220, 0, 0, 'cubic-bezier(.5,0,.8,.6)'], ['stand', 140, 0, 0]]); });
    }
  }
})();
