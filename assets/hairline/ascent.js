/**
 * Ascent: five pillars standing in a row across the frame, each taller than
 * the last, joined by a dashed path on the ground. Each lid carries what that
 * stage makes: a grid of points, a pair of rings, a window, a pair of tiles,
 * and a beacon standing proud of the tallest. At rest the whole climb stands
 * and the last pillar is bright. The pointer picks a stage: every pillar up to
 * it stands at its height, the chosen one lifts a little more and takes the
 * bright edge, and the ones beyond it sink to stubs, staggered outwards from
 * the choice. Sweeping left to right builds the climb. The slider is the
 * stagger, in ms.
 *
 * The pattern: one of many. Tweens, a stagger by distance, identity carried by
 * geometry, and a hit test on the pillars' resting centres.
 */
const {
  Cam, circ, facing, fit, open, poly, prism, proj, ringAt, rings, rrect, seg,
  tdone, tset, tval, tween, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const N = 5, F = 24, D = 27, H = [14, 28, 44, 60, 78], LIFT = 12, STUB = 5;
/** Pillar i's footprint corner: the row runs straight across the screen, so no pillar stands in front of another. */
const X = (i) => i * D, Y = (i) => (N - 1 - i) * D;
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, act = -1;

  const C = Cam(45, 0.5, 1.6), pts = [];
  for (let i = 0; i < N; i++) for (const [dx, dy] of [[0, 0], [F, 0], [0, F], [F, F]]) pts.push([X(i) + dx, Y(i) + dy, 0], [X(i) + dx, Y(i) + dy, H[i] + LIFT + 6]);
  fit(C, pts, 200, 164);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the path on the ground, drawn first so every pillar stands on it
  const mid = (i) => [X(i) + F / 2, Y(i) + F / 2];
  mk("path", { class: "nf dash", d: open([[-10, Y(0) + F + 10], ...Array.from({ length: N }, (_, i) => mid(i)), [X(N - 1) + F + 10, -10]].map(([x, y]) => P(x, y, 0))) }, g);
  for (const [x, y] of [[-10, Y(0) + F + 10], [X(N - 1) + F + 10, -10]]) place(flatDot(g, C, 1.3, "dot m"), P(x, y, 0));

  const cols = [];
  for (let i = 0; i < N; i++) {
    const x = X(i), y = Y(i), cx = x + F / 2, cy = y + F / 2, grp = mk("g", {}, g), el = solid(grp), marks = [];
    const [ring, inner] = rings(x, y, x + F, y + F, 5, 1.5);
    if (i === 0) {
      // understand: a grid of points
      for (let k = 0; k < 9; k++) { const d = flatDot(grp, C, 0.8, k === 4 ? "dot m" : "dot off"), ox = ((k % 3) - 1) * 5.4, oy = (Math.floor(k / 3) - 1) * 5.4; marks.push((z) => place(d, P(cx + ox, cy + oy, z))); }
    } else if (i === 1) {
      // define: two rings, a target
      const a = mk("path", { class: "nf" }, grp), b = mk("path", { class: "nf lo" }, grp), ra = at(circ(7, 20), cx, cy), rb = at(circ(3.2, 14), cx, cy);
      marks.push((z) => { a.setAttribute("d", poly(ringAt(P, ra, z))); b.setAttribute("d", poly(ringAt(P, rb, z))); });
    } else if (i === 2) {
      // build: a window's bar, its dots and two lines
      const bar = mk("path", { class: "nf" }, grp), lines = mk("path", { class: "nf lo" }, grp), dots = [0, 1].map(() => flatDot(grp, C, 0.7, "dot m"));
      marks.push((z) => {
        bar.setAttribute("d", seg(P(x + 2.5, y + 8, z), P(x + F - 2.5, y + 8, z)));
        lines.setAttribute("d", seg(P(x + 5, y + 13, z), P(x + 17, y + 13, z)) + seg(P(x + 5, y + 17.5, z), P(x + 13, y + 17.5, z)));
        dots.forEach((d, k) => place(d, P(x + 5 + k * 3.6, y + 4.6, z)));
      });
    } else if (i === 3) {
      // create: two tiles, pieces of content
      const a = mk("path", { class: "nf" }, grp), b = mk("path", { class: "nf lo" }, grp), ta = rrect(x + 4.5, y + 4.5, x + 12.5, y + 19.5, 2, 4), tb = rrect(x + 14.5, y + 4.5, x + 19.5, y + 19.5, 2, 4);
      marks.push((z) => { a.setAttribute("d", poly(ringAt(P, ta, z))); b.setAttribute("d", poly(ringAt(P, tb, z))); });
    } else {
      // activate: a beacon standing proud of the lid
      const top = solid(grp), tr = at(circ(6.5, 22), cx, cy), ti = at(circ(5, 22), cx, cy);
      marks.push((z) => put(top, prism(P, front, tr, ti, z, z + 6)));
    }
    cols.push({ el, ring, inner, marks, h: tween(H[i]), drawn: NaN, sx: P(cx, cy, 0)[0] });
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const c of cols) {
      const h = tval(c.h, now);
      if (h !== c.drawn) { c.drawn = h; put(c.el, prism(P, front, c.ring, c.inner, 0, h)); for (const m of c.marks) m(h); }
      if (!tdone(c.h, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  /** Picks stage a (-1 puts the climb back). The stagger spreads out from the stage picked, or the one let go. */
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    cols.forEach((c, i) => {
      tset(c.h, a < 0 ? H[i] : i < a ? H[i] : i === a ? H[i] + LIFT : STUB, now, Math.abs(i - from) * stag);
      c.el.sil.classList.toggle("hi", a < 0 ? i === N - 1 : i === a);
    });
    read.textContent = a < 0 ? "rest" : "stage " + (a + 1);
    B.wake();
  }

  bag.add(pointer(stage, {
    // The pillar whose resting centre is nearest across the screen: where a pillar stands never moves.
    move: ([x]) => setActive(cols.reduce((b, c, i) => (Math.abs(c.sx - x) < Math.abs(cols[b].sx - x) ? i : b), 0)),
    leave: () => setActive(-1),
  }));
  bag.add(() => svg.replaceChildren());
  cols[N - 1].el.sil.classList.add("hi");

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "ascent",
  means: "Five pillars climb across the frame: the pointer picks a stage, and the climb stands up to it and waits beyond it.",
  rules: [1, 2, 5, 8],
  range: [0, 45, 90],
  tour: [[70, 200], [135, 190], [200, 170], [265, 150], [330, 120], null],
  mount,
});
