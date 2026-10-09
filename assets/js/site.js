/* UNNATE — shared behaviour: the eyes, navigation, enquiry form, selected-work stage, footer. */
(() => {
  'use strict';
  const doc = document.documentElement;
  const ROOT = doc.dataset.root || '';
  const CFG = window.UNNATE_CONFIG || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const SERVICES = ['Websites', 'Brand Identity', 'Content & Creative', 'Social Media', 'Digital Advertising', 'Not sure yet'];

  /* ---------- the eyes ----------
     One drawing, five moods: (default) looking · unimpressed · feel · shut · wink.
     Pupils follow the pointer; on touch they look where data-look says ("x,y", each -1…1). */
  const eye = (cx, side) => `<g class="open ${side}"><circle class="ball" cx="${cx}" cy="31" r="25"/><circle class="pupil" cx="${cx}" cy="31" r="11"/><circle class="glint" cx="${cx - 6}" cy="24" r="5"/><path class="lid" d="M${cx - 28} 24A28 30 0 0 1 ${cx + 28} 24Z"/></g><path class="shut ${side}" d="M${cx - 22} 36Q${cx} 12 ${cx + 22} 36"/>`;
  const eyesSVG = (mood = '', cls = '', look = '') =>
    `<svg class="eyes ${cls}" viewBox="${cls ? '0 0 110 60' : '1 4 108 54'}" aria-hidden="true" focusable="false"${mood ? ` data-mood="${mood}"` : ''}${look ? ` data-look="${look}"` : ''}>${eye(28, 'el')}${eye(82, 'er')}<path class="ticks" d="M114 12l11-9M119 31h14M114 50l11 9"/></svg>`;

  // placeholders written in the HTML: <span data-eyes="mood" data-look="x,y" class="…">
  $$('[data-eyes]').forEach(el => { el.outerHTML = eyesSVG(el.dataset.eyes, el.className, el.dataset.look || ''); });
  // a double "o" becomes a pair of eyes; the letters stay in the DOM for readers
  $$('.oo').forEach(el => {
    el.insertAdjacentHTML('beforeend', eyesSVG(el.dataset.mood || '', '', el.dataset.look || ''));
    el.classList.add('live');
  });

  const allEyes = () => $$('svg.eyes');
  const setLook = (svg, x, y) => { svg.style.setProperty('--lx', x.toFixed(3)); svg.style.setProperty('--ly', y.toFixed(3)); };
  const rest = svg => { const [x, y] = (svg.dataset.look || '0,0').split(',').map(Number); setLook(svg, x || 0, y || 0); };
  allEyes().forEach(rest);
  let following = false, raf = 0, px = 0, py = 0;
  const follow = () => {
    raf = 0;
    allEyes().forEach(svg => {
      if (svg.dataset.hold) return;
      const r = svg.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, reach = Math.min(1, d / 160);
      setLook(svg, dx / d * reach, dy / d * reach);
    });
  };
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion.matches) {
    addEventListener('pointermove', e => { if (!following) return; px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(follow); }, { passive: true });
    document.addEventListener('pointerleave', () => allEyes().forEach(svg => !svg.dataset.hold && rest(svg)));
  }

  /* ---------- hero: see → feel, once ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')));
  const heroEyes = $('.hero svg.eyes');
  if (heroEyes && !reduceMotion.matches) {
    heroEyes.dataset.hold = '1';
    setLook(heroEyes, 0, 0);
    setTimeout(() => setLook(heroEyes, 1, .1), 900);                       // look at "see."
    setTimeout(() => { setLook(heroEyes, -.5, .95); }, 1800);              // …down at "feel."
    setTimeout(() => { heroEyes.dataset.mood = 'feel'; $('.hero h1').classList.add('drawn'); }, 2150);
    setTimeout(() => { delete heroEyes.dataset.mood; delete heroEyes.dataset.hold; following = true; }, 4200);
  } else {
    following = true;
    $('.hero h1')?.classList.add('drawn');
  }
  // the eyes light up whenever someone reaches for the enquiry button next to them
  $$('[data-thrill]').forEach(btn => {
    const target = () => $(btn.dataset.thrill);
    const on = () => { const t = target(); if (t && !t.dataset.hold) t.dataset.mood = 'feel'; };
    const off = () => { const t = target(); if (t && !t.dataset.hold) delete t.dataset.mood; };
    btn.addEventListener('pointerenter', on); btn.addEventListener('focus', on);
    btn.addEventListener('pointerleave', off); btn.addEventListener('blur', off);
  });

  /* ---------- scribbles draw when seen ---------- */
  const drawables = $$('[data-draw]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target); }
    }), { threshold: .5 });
    drawables.forEach(el => io.observe(el));
  } else drawables.forEach(el => el.classList.add('drawn'));

  /* ---------- shared project markup ---------- */
  const alt = it => esc(it.alt || `${it.title}: ${it.category.toLowerCase()}`);
  const thumb = it => it.type === 'web' ? `${it.id}-wide` : it.type === 'video' ? `${it.id}-poster` : `${it.id}-full`;
  const dims = it => it.type === 'web' ? [1200, 750] : it.type === 'video' ? [720, 1280] : (it.size || [1400, 1867]);
  const pieceHTML = it => { const [w, h] = dims(it); return `<span class="piece ${it.type}"><img src="${ROOT}assets/work/${esc(thumb(it))}.webp" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${alt(it)}"></span>`; };
  const tagsHTML = it => `<span class="tag">${esc(it.category)}</span>${it.kind ? `<span class="tag tag-kind">${esc(it.kind)}</span>` : ''}`;
  window.UNNATE = { esc, ROOT, reduceMotion, pieceHTML, tagsHTML, alt };

  /* ---------- navigation ---------- */
  const toggle = $('.nav-toggle'), links = $('.nav-links');
  if (toggle && links) {
    const setOpen = open => { links.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Close' : 'Menu'; };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', e => { if (e.target.closest('a,button')) setOpen(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- footer: year + verified links only ---------- */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const connect = $('[data-connect]');
  if (connect) {
    const items = [];
    if (CFG.instagram) items.push(`<li><a href="${esc(CFG.instagram)}" target="_blank" rel="noopener">Instagram<span class="vh"> (opens in a new tab)</span></a></li>`);
    if (CFG.linkedin) items.push(`<li><a href="${esc(CFG.linkedin)}" target="_blank" rel="noopener">LinkedIn<span class="vh"> (opens in a new tab)</span></a></li>`);
    if (CFG.email) items.push(`<li><a href="mailto:${esc(CFG.email)}">Email</a></li>`);
    if (!items.length) items.push('<li><button type="button" data-enquire>Send an enquiry</button></li>');
    connect.innerHTML = items.join('');
  }

  /* ---------- enquiry modal ---------- */
  const modal = document.createElement('dialog');
  modal.className = 'modal';
  modal.id = 'enquiry';
  modal.setAttribute('aria-labelledby', 'enquiry-title');
  modal.innerHTML = `
    <button type="button" class="close" data-close aria-label="Close enquiry form"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg></button>
    <div class="modal-in">
      <div data-view="form">
        <p class="eyebrow">Have something in mind?</p>
        <h2 class="display" id="enquiry-title" tabindex="-1">Tell us a little about it.</h2>
        <p class="intro">A few lines is plenty. Everything is required unless it says optional.</p>
        <form class="form" novalidate>
          <div class="field">
            <label for="f-name">Your name</label>
            <input id="f-name" name="name" type="text" autocomplete="name" required maxlength="120">
          </div>
          <div class="field">
            <label for="f-email">Work email</label>
            <input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required maxlength="200" spellcheck="false">
          </div>
          <div class="field">
            <label for="f-company">Company or brand name</label>
            <input id="f-company" name="company" type="text" autocomplete="organization" required maxlength="160">
          </div>
          <div class="field">
            <label for="f-site">Website or social profile <span class="opt">(optional)</span></label>
            <input id="f-site" name="website" type="text" autocomplete="url" maxlength="300" spellcheck="false">
          </div>
          <fieldset class="field full">
            <legend>What do you need help with? <span class="opt">(choose any that apply)</span></legend>
            <div class="picks">
              ${SERVICES.map(s => `<label class="pick"><input type="checkbox" name="services" value="${esc(s)}"><span>${esc(s)}</span></label>`).join('')}
            </div>
          </fieldset>
          <div class="field full">
            <label for="f-msg">Tell us a little about your project</label>
            <textarea id="f-msg" name="message" rows="5" required maxlength="5000" placeholder="What’s the idea, challenge or goal you’re working towards?"></textarea>
          </div>
          <div class="hp" aria-hidden="true"><label for="f-hp">Leave this field empty</label><input id="f-hp" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
          <div class="form-alert" role="alert" hidden></div>
          <div class="form-foot">
            <button type="submit" class="btn"><span data-label>Submit enquiry <span class="arr" aria-hidden="true">→</span></span></button>
            <p class="privacy">Your information will be used to respond to your enquiry.${CFG.privacyUrl ? ` <a href="${esc(CFG.privacyUrl)}">Privacy policy</a>` : ''}</p>
          </div>
        </form>
      </div>
      <div data-view="sent" class="sent" hidden>
        ${eyesSVG('feel', 'big')}
        <h2 class="display" tabindex="-1">Thanks for reaching out.</h2>
        <p>We’ve received your enquiry and will be in touch soon.</p>
        <button type="button" class="btn btn-ink" data-close>Close</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const form = $('form', modal);
  const alertBox = $('.form-alert', modal);
  const submitBtn = $('button[type="submit"]', modal);
  const views = { form: $('[data-view="form"]', modal), sent: $('[data-view="sent"]', modal) };
  let opener = null, sending = false, sent = false;

  const openModal = (trigger, service) => {
    opener = trigger || document.activeElement;
    if (sent) { form.reset(); clearErrors(); sent = false; }
    views.form.hidden = false; views.sent.hidden = true;
    if (service) $$('input[name="services"]', form).forEach(c => { if (c.value === service) c.checked = true; });
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    doc.classList.add('locked');
    modal.scrollTop = 0;
    $('#f-name', modal).focus({ preventScroll: true });
  };
  const closeModal = () => { if (modal.open) modal.close(); };
  modal.addEventListener('close', () => {
    doc.classList.remove('locked');
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  });
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-enquire]');
    if (!t) return;
    e.preventDefault();
    openModal(t, t.dataset.service);
  });

  const setError = (input, msg) => {
    const field = input.closest('.field');
    if (!field) return;
    let el = $('.err', field);
    if (!msg) { if (el) el.remove(); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); return; }
    if (!el) { el = document.createElement('p'); el.className = 'err'; el.id = input.id + '-err'; field.appendChild(el); }
    el.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', el.id);
  };
  function clearErrors() { $$('input,textarea', form).forEach(i => i.id && setError(i, '')); alertBox.hidden = true; }
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const validate = () => {
    const f = form.elements, bad = [];
    const need = (input, msg) => { const m = input.value.trim() ? '' : msg; setError(input, m); if (m) bad.push(input); };
    need(f.name, 'Enter your name.');
    const ev = f.email.value.trim();
    const emsg = !ev ? 'Enter your work email.' : (!EMAIL.test(ev) ? 'Enter an email address in the format name@company.com.' : '');
    setError(f.email, emsg); if (emsg) bad.push(f.email);
    need(f.company, 'Enter your company or brand name.');
    need(f.message, 'Tell us a little about your project.');
    return bad;
  };
  form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid')) validate(); });

  const setSending = on => {
    sending = on;
    submitBtn.setAttribute('aria-disabled', String(on));
    $('[data-label]', submitBtn).innerHTML = on
      ? '<span class="spinner" aria-hidden="true"></span> Sending…'
      : 'Submit enquiry <span class="arr" aria-hidden="true">→</span>';
  };
  const fail = msg => {
    alertBox.textContent = msg;
    alertBox.hidden = false;
    alertBox.scrollIntoView({ block: 'nearest' });
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;                       // no duplicate submissions
    alertBox.hidden = true;
    const bad = validate();
    if (bad.length) { bad[0].focus(); return; }
    const fd = new FormData(form);
    const payload = {
      name: fd.get('name').trim(), email: fd.get('email').trim(), company: fd.get('company').trim(),
      website: fd.get('website').trim(), services: fd.getAll('services'), message: fd.get('message').trim(),
      company_url: fd.get('company_url'), page: location.pathname
    };
    const endpoint = /^https?:/.test(CFG.enquiryEndpoint || '') ? CFG.enquiryEndpoint : ROOT + (CFG.enquiryEndpoint || 'api/enquiry');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST', signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      let body = null;
      try { body = await res.json(); } catch { /* non-JSON response */ }
      // Success is shown only when the server confirms it accepted the enquiry.
      if (res.ok && body && (body.ok === true || body.success === true)) {
        sent = true;
        views.form.hidden = true; views.sent.hidden = false;
        $('h2', views.sent).focus();
      } else if (res.status === 422 && body && body.fields) {
        Object.entries(body.fields).forEach(([k, m]) => form.elements[k] && setError(form.elements[k], m));
        const first = $('[aria-invalid="true"]', form); if (first) first.focus();
      } else {
        fail('Your enquiry wasn’t sent — the server didn’t accept it. Nothing you typed has been lost. Try sending it again in a moment.');
      }
    } catch (err) {
      fail(err.name === 'AbortError'
        ? 'Your enquiry wasn’t sent — the connection timed out. Nothing you typed has been lost. Check your connection and send it again.'
        : 'Your enquiry wasn’t sent — we couldn’t reach the server. Nothing you typed has been lost. Check your connection and send it again.');
    } finally {
      clearTimeout(timer);
      setSending(false);
    }
  });

  /* ---------- selected work: one piece on the table at a time ---------- */
  const stage = $('[data-stage]');
  const data = window.UNNATE_PORTFOLIO || [];
  if (stage && data.length) {
    const items = data.filter(i => i.featured);
    const idx = $('.stage-index', stage), media = $('.stage-media', stage), info = $('[data-info]', stage);
    const count = $('.count', stage), playBtn = $('[data-play]', stage);
    const INTERVAL = 6000;
    const tilt = [-2, 1.5, -1, 2, -1.5, 1];
    let index = 0, userPaused = reduceMotion.matches, hover = false, focus = false, timer = null;
    const pad = n => String(n + 1).padStart(2, '0');

    idx.innerHTML = items.map((it, i) => `<button type="button" data-i="${i}"><span class="n" aria-hidden="true">${pad(i)}</span><span>${esc(it.title)}</span></button>`).join('');
    const tabs = $$('button', idx);
    const show = (i, announce) => {
      index = (i + items.length) % items.length;                     // wraps at both ends
      const it = items[index], href = `${ROOT}work/#${encodeURIComponent(it.id)}`;
      media.classList.remove('swap'); void media.offsetWidth; media.classList.add('swap');
      media.innerHTML = `<a href="${href}" style="transform:rotate(${tilt[index % tilt.length]}deg)" aria-label="${esc(it.title)}: view project">${pieceHTML(it).replace('loading="lazy"', '')}</a>`;
      info.innerHTML = `<span class="big-n" aria-hidden="true">${pad(index)}</span>
        <div class="tags">${tagsHTML(it)}</div>
        <h3>${esc(it.title)}</h3>
        <p class="desc">${esc(it.desc)}</p>
        <a class="go" href="${href}">View project <span class="arr" aria-hidden="true">→</span></a>`;
      tabs.forEach((t, n) => t.setAttribute('aria-current', String(n === index)));
      if (idx.scrollWidth > idx.clientWidth) idx.scrollTo({ left: tabs[index].offsetLeft - 16, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      count.textContent = `${index + 1} of ${items.length}`;
      info.setAttribute('aria-live', announce ? 'polite' : 'off');
      const nx = items[(index + 1) % items.length]; new Image().src = `${ROOT}assets/work/${thumb(nx)}.webp`;
    };
    const running = () => !userPaused && !hover && !focus && !document.hidden;
    const sync = () => {
      clearInterval(timer); timer = null;
      if (running()) timer = setInterval(() => show(index + 1, false), INTERVAL);
      playBtn.setAttribute('aria-label', userPaused ? 'Play automatic slideshow' : 'Pause automatic slideshow');
      playBtn.dataset.state = userPaused ? 'paused' : 'playing';
      stage.dataset.autoplay = running() ? 'on' : 'off';
    };
    // Taking manual control stops autoplay until the visitor presses play again.
    const takeControl = () => { if (!userPaused) { userPaused = true; sync(); } };
    idx.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { takeControl(); show(+b.dataset.i, true); } });
    $('[data-prev]', stage).addEventListener('click', () => { takeControl(); show(index - 1, true); });
    $('[data-next]', stage).addEventListener('click', () => { takeControl(); show(index + 1, true); });
    playBtn.addEventListener('click', () => { userPaused = !userPaused; sync(); });
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); takeControl(); show(index + 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); takeControl(); show(index - 1, true); }
    });
    let sx = null;                                                    // swipe on the piece
    media.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    media.addEventListener('touchend', e => {
      if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { takeControl(); show(index + (dx < 0 ? 1 : -1), true); }
    }, { passive: true });
    stage.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; sync(); } });
    stage.addEventListener('pointerleave', () => { hover = false; sync(); });
    stage.addEventListener('focusin', () => { focus = true; sync(); });
    stage.addEventListener('focusout', e => { if (!stage.contains(e.relatedTarget)) { focus = false; sync(); } });
    document.addEventListener('visibilitychange', sync);
    reduceMotion.addEventListener?.('change', () => { if (reduceMotion.matches) { userPaused = true; sync(); } });
    show(0, false); sync();
  }
})();
