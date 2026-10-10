/* Design 01: the Hairline figure's host, the stage buttons and label, and the work rail. */
(() => {
  const { $, $$, esc, DATA, img, tags, pad, reduce } = UN;
  const STAGES = [
    ['Understand', 'We’ll start with the idea, understand the challenge and work out what makes sense.'],
    ['Define', 'Finding the idea that matters, giving it the right form and making every detail work towards it.'],
    ['Web', 'More than a digital presence. A better first impression.'],
    ['Content & Social', 'Create things people actually want to look at.'],
    ['Paid Campaigns', 'Put the right message in front of the right people.'],
  ];
  const HL = window.HL;
  window.hairline = figure => {
    const stage = $(`[data-figure="${figure.name}"]`); if (!stage || !HL) return;
    const btns = $$('[data-stages] [data-stage]'), panel = $('.panel'), playBtn = $('[data-fig-play]');
    HL.inject(document);
    stage.setAttribute('data-hairline', figure.name); stage.setAttribute('role', 'img'); stage.setAttribute('aria-label', figure.means);
    const svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' }, stage);
    let text = 'rest', shown = 5;
    const showStage = n => {
      btns.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.stage === n)));
      const k = n || 5; if (k === shown) return; shown = k;
      $('[data-stage-n]').textContent = pad(k); $('[data-stage-t]').textContent = STAGES[k - 1][0]; $('[data-stage-d]').textContent = STAGES[k - 1][1];
      panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    };
    // the figure's read-out ("rest", "stage 3") drives the label and the buttons
    const read = { get textContent() { return text; }, set textContent(v) { text = v == null ? '' : String(v); showStage(+((/stage (\d)/.exec(text) || [])[1] || 0)); } };
    figure.mount({ stage, svg, read }, figure.range[1]);
    // each button holds the pointer over its own pillar, so the drawing answers the keyboard and a tap as well
    const XS = [70, 135, 200, 265, 330];
    const hold = n => { const r = stage.getBoundingClientRect(); stage.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', pointerId: 1, bubbles: true, clientX: r.left + XS[n - 1] / 400 * r.width, clientY: r.top + .55 * r.height })); };
    const letGo = () => stage.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse', pointerId: 1 }));
    btns.forEach(b => {
      const n = +b.dataset.stage;
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hold(n); });
      b.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && document.activeElement !== b) letGo(); });
      b.addEventListener('focus', () => hold(n)); b.addEventListener('blur', letGo); b.addEventListener('click', () => hold(n));
    });
    let playing = null, wanted = !reduce.matches, seen = false;
    const sync = () => {
      const on = wanted && seen && !document.hidden;
      if (on && !playing) playing = HL.tour(stage, figure.tour || HL.LAP);
      if (!on && playing) { playing.stop(); playing = null; }
      playBtn.dataset.state = wanted ? 'playing' : 'paused';
      playBtn.setAttribute('aria-label', wanted ? 'Pause the drawing’s animation' : 'Play the drawing’s animation');
    };
    new IntersectionObserver(es => { seen = es[0].isIntersecting; sync(); }, { threshold: .35 }).observe(stage);
    document.addEventListener('visibilitychange', sync);
    playBtn.addEventListener('click', () => { wanted = !wanted; sync(); });
    sync();
  };

  /* work rail */
  const rail = $('[data-rail]'), count = $('[data-count]'), bar = $('.bar i'), prev = $('[data-prev]'), next = $('[data-next]');
  rail.innerHTML = DATA.map((it, i) => `<li class="slide"><a href="#work" data-project="${esc(it.id)}" aria-label="${esc(it.title)}: view project"><span class="frame">${img(it, i < 2)}</span></a>
    <div class="cap"><span class="n" aria-hidden="true">${pad(i + 1)}</span><h3>${esc(it.title)}</h3><div class="tags">${tags(it)}</div><p>${esc(it.desc)}</p></div></li>`).join('');
  const slides = $$('.slide', rail);
  const origin = () => parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0, max = () => rail.scrollWidth - rail.clientWidth;
  const pos = el => Math.min(el.offsetLeft - origin(), max());
  const nearest = x => slides.reduce((a, el, i) => Math.abs(pos(el) - x) < Math.abs(pos(slides[a]) - x) ? i : a, 0);
  const update = () => {
    const end = rail.scrollLeft >= max() - 2;
    count.textContent = `${pad(end ? slides.length : nearest(rail.scrollLeft) + 1)} of ${pad(slides.length)}`;
    bar.style.setProperty('--p', (max() > 0 ? Math.max(.06, rail.scrollLeft / max()) : 1).toFixed(3));
    prev.disabled = rail.scrollLeft <= 2; next.disabled = end;
  };
  const go = i => rail.scrollTo({ left: pos(slides[Math.max(0, Math.min(slides.length - 1, i))]), behavior: reduce.matches ? 'auto' : 'smooth' });
  let t = false; rail.addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; update(); }); } }, { passive: true });
  addEventListener('resize', update);
  prev.addEventListener('click', () => go(nearest(rail.scrollLeft) - 1)); next.addEventListener('click', () => go(nearest(rail.scrollLeft) + 1));
  rail.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(nearest(rail.scrollLeft) + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(nearest(rail.scrollLeft) - 1); } });
  update();
})();
