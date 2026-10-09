/* UNNATE — shared behaviour: navigation, hand-drawn marks, enquiry modal, carousel, footer. */
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

  /* ---------- shared card markup (carousel + work page) ---------- */
  const cardHTML = (it, href) => `
    <a class="card" href="${href}" data-id="${esc(it.id)}">
      <div class="card-media">
        <img src="${ROOT}assets/work/${esc(it.id)}.webp" width="800" height="1000" loading="lazy" decoding="async" alt="${esc(it.alt || `${it.title}: ${it.category.toLowerCase()}`)}">
        <div class="card-chips">
          <span class="chip glass">${it.type === 'video' ? '<i class="play" aria-hidden="true"></i>' : ''}${esc(it.category)}</span>
          ${it.kind ? `<span class="chip chip-kind">${esc(it.kind)}</span>` : ''}
        </div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(it.title)}</h3>
        <p class="card-desc">${esc(it.desc)}</p>
      </div>
    </a>`;
  window.UNNATE = { cardHTML, esc, ROOT, reduceMotion };

  /* ---------- load sequence + marks that draw when seen ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('ready')));
  const drawables = $$('[data-draw]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('drawn'); io.unobserve(e.target); }
    }), { threshold: .6, rootMargin: '0px 0px -8% 0px' });
    drawables.forEach(el => io.observe(el));
  } else drawables.forEach(el => el.classList.add('drawn'));

  /* ---------- navigation ---------- */
  const toggle = $('.nav-toggle'), links = $('.nav-links');
  if (toggle && links) {
    const setOpen = open => { links.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
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
    <button type="button" class="modal-close" data-close aria-label="Close enquiry form"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg></button>
    <div class="modal-in">
      <div data-view="form">
        <p class="eyebrow">Have something in mind?</p>
        <h2 class="h-display" id="enquiry-title" tabindex="-1">Tell us about it.</h2>
        <p class="intro">A few details are enough. Only your name and email are required.</p>
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
            <label for="f-company">Company or brand name <span class="opt">(optional)</span></label>
            <input id="f-company" name="company" type="text" autocomplete="organization" maxlength="160">
          </div>
          <div class="field">
            <label for="f-site">Website or social profile <span class="opt">(optional)</span></label>
            <input id="f-site" name="website" type="text" autocomplete="url" maxlength="300" spellcheck="false">
          </div>
          <fieldset class="field full">
            <legend>What do you need help with? <span class="opt">(choose any)</span></legend>
            <div class="picks">
              ${SERVICES.map(s => `<label class="pick"><input type="checkbox" name="services" value="${esc(s)}"><span>${esc(s)}</span></label>`).join('')}
            </div>
          </fieldset>
          <div class="field full">
            <label for="f-msg">Tell us a little about your project <span class="opt">(optional)</span></label>
            <textarea id="f-msg" name="message" rows="5" maxlength="5000" placeholder="What’s the idea, challenge or goal you’re working towards?"></textarea>
          </div>
          <div class="hp" aria-hidden="true"><label for="f-hp">Leave this field empty</label><input id="f-hp" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
          <div class="form-alert" role="alert" hidden></div>
          <div class="form-foot">
            <button type="submit" class="btn btn-orange"><span data-label>Send enquiry <span class="arr" aria-hidden="true">→</span></span></button>
            <p class="privacy">Your information will be used to respond to your enquiry.${CFG.privacyUrl ? ` <a href="${esc(CFG.privacyUrl)}">Privacy policy</a>` : ''}</p>
          </div>
        </form>
      </div>
      <div data-view="sent" class="sent" hidden>
        <img src="${ROOT}assets/img/pose-look-right.webp" width="471" height="539" alt="">
        <div>
          <h2 class="h-display" tabindex="-1">Thanks for reaching out.</h2>
          <p>We’ve received your enquiry and will be in touch soon.</p>
          <button type="button" class="btn btn-ink" data-close>Close</button>
        </div>
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
    const name = form.elements.name, email = form.elements.email;
    const bad = [];
    setError(name, name.value.trim() ? '' : 'Enter your name.'); if (!name.value.trim()) bad.push(name);
    const ev = email.value.trim();
    const emsg = !ev ? 'Enter your work email.' : (!EMAIL.test(ev) ? 'Enter an email address in the format name@company.com.' : '');
    setError(email, emsg); if (emsg) bad.push(email);
    return bad;
  };
  form.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid')) validate(); });

  const setSending = on => {
    sending = on;
    submitBtn.setAttribute('aria-disabled', String(on));
    $('[data-label]', submitBtn).innerHTML = on
      ? '<span class="spinner" aria-hidden="true"></span> Sending…'
      : 'Send enquiry <span class="arr" aria-hidden="true">→</span>';
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

  /* ---------- selected-work carousel ---------- */
  const car = $('[data-carousel]');
  const data = window.UNNATE_PORTFOLIO || [];
  if (car && data.length) {
    const track = $('.car-track', car);
    const featured = data.filter(i => i.featured);
    track.innerHTML = featured.map(it => `<li>${cardHTML(it, `${ROOT}work/#${encodeURIComponent(it.id)}`)}</li>`).join('');
    const slides = $$('li', track);
    const count = $('.car-count', car), bar = $('.car-progress i', car);
    const playBtn = $('[data-play]', car);
    const INTERVAL = 6000;
    let index = 0, userPaused = reduceMotion.matches, hover = false, focus = false, timer = null;

    const pad = () => parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const posOf = i => slides[i].offsetLeft - track.offsetLeft - pad();
    const maxScroll = () => track.scrollWidth - track.clientWidth;
    const lastIndex = () => { const m = maxScroll(); for (let i = 0; i < slides.length; i++) if (posOf(i) >= m - 2) return i; return slides.length - 1; };
    const perView = () => Math.max(1, Math.floor(parseFloat(getComputedStyle(track).getPropertyValue('--per')) || 1));
    const render = () => {
      const a = index + 1, b = Math.min(slides.length, index + perView());
      count.textContent = a === b ? `${a} of ${slides.length}` : `${a}–${b} of ${slides.length}`;
      bar.style.transform = `scaleX(${b / slides.length})`;
    };
    const go = (i, smooth = true) => {
      const last = lastIndex();
      index = i > last ? 0 : (i < 0 ? last : i);       // wrap at both ends
      track.scrollTo({ left: Math.min(posOf(index), maxScroll()), behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto' });
      render();
    };
    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = track.scrollLeft; let best = 0, d = Infinity;
        slides.forEach((s, i) => { const dd = Math.abs(posOf(i) - x); if (dd < d) { d = dd; best = i; } });
        index = Math.min(best, lastIndex()); render();
      });
    }, { passive: true });

    const running = () => !userPaused && !hover && !focus && !document.hidden;
    const sync = () => {
      clearInterval(timer); timer = null;
      if (running()) timer = setInterval(() => go(index + 1), INTERVAL);
      playBtn.setAttribute('aria-label', userPaused ? 'Play automatic slideshow' : 'Pause automatic slideshow');
      playBtn.dataset.state = userPaused ? 'paused' : 'playing';
      car.dataset.autoplay = running() ? 'on' : 'off';
    };
    // Taking manual control stops autoplay until the visitor presses play again.
    const takeControl = () => { if (!userPaused) { userPaused = true; sync(); } };
    $('[data-prev]', car).addEventListener('click', () => { takeControl(); go(index - 1); });
    $('[data-next]', car).addEventListener('click', () => { takeControl(); go(index + 1); });
    playBtn.addEventListener('click', () => { userPaused = !userPaused; sync(); });
    track.addEventListener('touchstart', takeControl, { passive: true });
    track.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) takeControl(); }, { passive: true });
    car.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); takeControl(); go(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); takeControl(); go(index - 1); }
    });
    car.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; sync(); } });
    car.addEventListener('pointerleave', () => { hover = false; sync(); });
    car.addEventListener('focusin', () => { focus = true; sync(); });
    car.addEventListener('focusout', e => { if (!car.contains(e.relatedTarget)) { focus = false; sync(); } });
    document.addEventListener('visibilitychange', sync);
    reduceMotion.addEventListener?.('change', () => { if (reduceMotion.matches) { userPaused = true; sync(); } });
    window.addEventListener('resize', () => go(Math.min(index, lastIndex()), false));
    render(); sync();
  }
})();
