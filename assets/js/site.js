/* UNNATE — shared behaviour: navigation, arrival, the Hairline figure, the work rail, the enquiry sheet, footer. */
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
  const ARR = '<span class="arr" aria-hidden="true">→</span>';

  /* ---------- shared project markup ---------- */
  const alt = it => esc(it.alt || `${it.title}: ${it.category.toLowerCase()}`);
  const thumb = it => it.type === 'web' ? `${it.id}-wide` : it.type === 'video' ? `${it.id}-poster` : `${it.id}-full`;
  const dims = it => it.type === 'web' ? [1200, 750] : it.type === 'video' ? [720, 1280] : (it.size || [1400, 1867]);
  const PLAY = '<span class="badge" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 1.500l11 6.500-11 6.500z"/></svg></span>'.replace(/\.500/g, '.5');
  const printHTML = (it, eager) => {
    const [w, h] = dims(it);
    return `<span class="print" style="--ar:${w}/${h}"><img src="${ROOT}assets/work/${esc(thumb(it))}.webp" width="${w}" height="${h}" ${eager ? '' : 'loading="lazy" '}decoding="async" draggable="false" alt="${alt(it)}">${it.type === 'video' ? PLAY : ''}</span>`;
  };
  const tagsHTML = it => `<span class="tag">${esc(it.category)}</span>${it.kind ? `<span class="tag tag-kind">${esc(it.kind)}</span>` : ''}`;
  window.UNNATE = { esc, ROOT, reduceMotion, printHTML, tagsHTML, alt, ARR };

  /* ---------- navigation ---------- */
  const toggle = $('.nav-toggle'), links = $('.nav-links');
  if (toggle && links) {
    const setOpen = open => { links.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Close' : 'Menu'; };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', e => { if (e.target.closest('a,button')) setOpen(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('pointerdown', e => { if (links.classList.contains('open') && !e.target.closest('.nav')) setOpen(false); });
  }

  /* ---------- arrival: things settle as they are reached ---------- */
  const arrive = els => {
    if (!('IntersectionObserver' in window) || reduceMotion.matches) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(el => io.observe(el));
  };
  arrive($$('.reveal'));
  window.UNNATE.arrive = arrive;

  /* ---------- the ticker's pause button ---------- */
  const ticker = $('[data-ticker]'), tickBtn = $('[data-ticker-pause]');
  if (ticker && tickBtn) tickBtn.addEventListener('click', () => {
    const paused = ticker.dataset.state !== 'paused';
    ticker.dataset.state = tickBtn.dataset.state = paused ? 'paused' : 'playing';
    tickBtn.setAttribute('aria-label', paused ? 'Play the moving list of services' : 'Pause the moving list of services');
  });
  if (tickBtn) tickBtn.dataset.state = 'playing';

  /* ---------- Hairline: the page a figure is shown on ----------
     The figure file calls hairline({...}); this mounts it the way the package's bench does,
     plays its tour while it is on screen, and gives way to a real pointer. */
  const HL = window.HL;
  window.hairline = figure => {
    const stage = $(`[data-figure="${figure.name}"]`);
    if (!stage || !HL) return;
    const readEl = $('[data-fig-read]'), playBtn = $('[data-fig-play]');
    HL.inject(document);
    stage.setAttribute('data-hairline', figure.name);
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', figure.means);
    const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
    let text = 'rest';
    const read = { get textContent() { return text; }, set textContent(v) { text = v == null ? '' : String(v); if (readEl) readEl.textContent = text; } };
    figure.mount({ stage, svg, read }, figure.range[1]);

    let playing = null, wanted = !reduceMotion.matches, seen = false;
    const sync = () => {
      const on = wanted && seen && !document.hidden;
      if (on && !playing) playing = HL.tour(stage, figure.tour || HL.LAP);
      if (!on && playing) { playing.stop(); playing = null; }
      if (playBtn) {
        playBtn.dataset.state = wanted ? 'playing' : 'paused';
        playBtn.setAttribute('aria-label', wanted ? 'Pause the drawing’s animation' : 'Play the drawing’s animation');
      }
    };
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { seen = es[0].isIntersecting; sync(); }, { threshold: .35 }).observe(stage);
    else seen = true;
    document.addEventListener('visibilitychange', sync);
    if (playBtn) playBtn.addEventListener('click', () => { wanted = !wanted; sync(); });
    sync();
  };

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

  /* ---------- selected work: a rail of prints ----------
     Native horizontal scrolling with snap points (touch and trackpad get real momentum for free).
     With a mouse the rail can be dragged: it tracks the pointer 1:1 from where it was grabbed,
     and on release it is thrown to the print nearest where that momentum would have carried it. */
  const data = window.UNNATE_PORTFOLIO || [];
  const carousel = $('[data-carousel]');
  const cats = $('[data-cats]');
  if (cats && data.length) {
    cats.innerHTML = ['Brand Identity', 'Websites', 'Content & Creative', 'Campaigns'].filter(g => data.some(i => i.group === g))
      .map(g => `<li><a class="tag" href="${ROOT}work/?show=${encodeURIComponent(g)}">${esc(g)}</a></li>`).join('');
  }
  if (carousel && data.length) {
    const items = data.filter(i => i.featured);
    const rail = $('[data-rail]', carousel), count = $('[data-count]', carousel), bar = $('.rail-bar i', carousel);
    const prev = $('[data-prev]', carousel), next = $('[data-next]', carousel);
    const pad = n => String(n).padStart(2, '0');
    rail.innerHTML = items.map((it, i) => `<li class="slide" aria-roledescription="slide" aria-label="${i + 1} of ${items.length}">
        <a href="${ROOT}work/#${encodeURIComponent(it.id)}" aria-label="${esc(it.title)}: view project">${printHTML(it, i < 2)}</a>
        <div class="cap"><span class="n" aria-hidden="true">${pad(i + 1)}</span><h3>${esc(it.title)}</h3><div class="tags">${tagsHTML(it)}</div><p>${esc(it.desc)}</p></div>
      </li>`).join('');
    const slides = $$('.slide', rail);
    const behavior = () => reduceMotion.matches ? 'auto' : 'smooth';
    const origin = () => parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
    const posOf = el => el.offsetLeft - origin();
    const maxScroll = () => rail.scrollWidth - rail.clientWidth;
    const nearest = x => slides.reduce((a, el, i) => Math.abs(Math.min(posOf(el), maxScroll()) - x) < Math.abs(Math.min(posOf(slides[a]), maxScroll()) - x) ? i : a, 0);
    let index = 0;
    const update = () => {
      index = rail.scrollLeft >= maxScroll() - 2 ? Math.max(nearest(rail.scrollLeft), index) : nearest(rail.scrollLeft);
      const end = rail.scrollLeft >= maxScroll() - 2;
      count.textContent = `${pad(end ? items.length : index + 1)} / ${pad(items.length)}`;
      bar.style.setProperty('--p', (maxScroll() > 0 ? Math.max(.06, rail.scrollLeft / maxScroll()) : 1).toFixed(3));
      prev.disabled = rail.scrollLeft <= 2; next.disabled = end;
    };
    const go = i => rail.scrollTo({ left: Math.min(posOf(slides[Math.max(0, Math.min(slides.length - 1, i))]), maxScroll()), behavior: behavior() });
    let ticking = false;
    rail.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } }, { passive: true });
    addEventListener('resize', update);
    prev.addEventListener('click', () => go(nearest(rail.scrollLeft) - 1));
    next.addEventListener('click', () => go(nearest(rail.scrollLeft) + 1));
    rail.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(nearest(rail.scrollLeft) + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(nearest(rail.scrollLeft) - 1); }
    });
    // mouse drag
    let drag = null;
    const project = (v, d = .996) => (v / 1000) * d / (1 - d);          // where the momentum would carry it, px
    rail.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: rail.scrollLeft, moved: false, hist: [[e.timeStamp, e.clientX]] };
    });
    addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) < 8) return;                        // a little hysteresis before it becomes a drag
      if (!drag.moved) { drag.moved = true; rail.classList.add('dragging'); }
      rail.scrollLeft = drag.left - dx;
      drag.hist.push([e.timeStamp, e.clientX]); if (drag.hist.length > 6) drag.hist.shift();
    });
    const release = e => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) return;
      const [t0, x0] = d.hist[0], [t1, x1] = d.hist[d.hist.length - 1];
      const v = t1 > t0 && e.timeStamp - t1 < 80 ? (x1 - x0) / (t1 - t0) * 1000 : 0;   // px/s at release
      const target = nearest(rail.scrollLeft - Math.max(-900, Math.min(900, project(v))));
      rail.classList.remove('dragging');
      go(target);
      // a drag is not a click on the print underneath
      const stop = ev => { ev.preventDefault(); ev.stopPropagation(); };
      rail.addEventListener('click', stop, { capture: true, once: true });
      setTimeout(() => rail.removeEventListener('click', stop, { capture: true }), 0);
    };
    addEventListener('pointerup', release);
    addEventListener('pointercancel', release);
    rail.addEventListener('dragstart', e => e.preventDefault());
    update();
  }

  /* ---------- enquiry sheet ---------- */
  const sticker = (label, id) => `<span class="sticker" aria-hidden="true"><svg class="ring" viewBox="0 0 120 120"><path id="${id}" fill="none" d="M16 60a44 44 0 1 1 88 0a44 44 0 1 1-88 0"/><text><textPath href="#${id}" textLength="272">${label}</textPath></text></svg><svg class="core" viewBox="0 0 48 48"><path d="M10 25l9 9 19-21"/></svg></span>`;
  const modal = document.createElement('dialog');
  modal.className = 'modal';
  modal.id = 'enquiry';
  modal.setAttribute('aria-labelledby', 'enquiry-title');
  modal.innerHTML = `
    <div class="check c-orange modal-top" aria-hidden="true"></div>
    <button type="button" class="close" data-close aria-label="Close enquiry form"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg></button>
    <div class="modal-in">
      <div data-view="form">
        <p class="eyebrow">Have something in mind?</p>
        <h2 class="display" id="enquiry-title" tabindex="-1">Let’s make something that <em>matters.</em></h2>
        <p class="intro">Tell us a little about it. Everything is required unless it says optional.</p>
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
            <button type="submit" class="btn"><span data-label>Submit enquiry ${ARR}</span></button>
            <p class="privacy">Your information will be used to respond to your enquiry.${CFG.privacyUrl ? ` <a href="${esc(CFG.privacyUrl)}">Privacy policy</a>` : ''}</p>
          </div>
        </form>
      </div>
      <div data-view="sent" class="sent" hidden>
        ${sticker('ENQUIRY RECEIVED · ENQUIRY RECEIVED · ', 'ring-sent')}
        <h2 class="display" tabindex="-1" style="margin:0">Thanks for reaching out.</h2>
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
    // the sheet grows out of the button that asked for it
    const r = opener && opener.getBoundingClientRect ? opener.getBoundingClientRect() : null;
    modal.style.transformOrigin = r ? `${((r.left + r.width / 2) / innerWidth * 100).toFixed(1)}% ${((r.top + r.height / 2) / innerHeight * 100).toFixed(1)}%` : '';
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
    $('[data-label]', submitBtn).innerHTML = on ? '<span class="spinner" aria-hidden="true"></span> Sending…' : `Submit enquiry ${ARR}`;
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
})();
