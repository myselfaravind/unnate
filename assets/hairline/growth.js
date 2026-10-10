/**
 * Growth: four pillars standing in a row across the frame, each taller and
 * broader than the last, joined by a dashed path on the ground. Each lid
 * carries what that stage makes: a few gathered points, a pair of rings, a
 * window with its bar and lines, and a stepped beacon standing proud of the
 * tallest. At rest the whole climb stands and the last pillar is bright. The
 * pointer picks a stage: every pillar up to it stands at its height, the
 * chosen one lifts a little more and takes the bright edge, and the ones
 * beyond it sink to stubs, staggered outwards from the choice. Sweeping left
 * to right builds the climb. The slider is the stagger, in ms.
 *
 * The pattern: one of many. Tweens, a stagger by distance, identity carried by
 * geometry, and a hit test on the pillars' resting centres.
 */
const {
  Cam, circ, facing, fit, open, poly, prism, proj, ringAt, rings, seg,
  tdone, tset, tval, tween, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const N = 4, F = [20, 23, 26, 29], D = 33, H = [15, 33, 54, 80], LIFT = 12, STUB = 5;
/** Pillar i's centre: the row runs straight across the screen, so no pillar stands in front of another. */
const CX = (i) => i * D, CY = (i) => (N - 1 - i) * D;
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value, act = -1;

  const C = Cam(45, 0.5, 1.62), pts = [];
  for (let i = 0; i < N; i++) for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pts.push([CX(i) + dx * F[i] / 2, CY(i) + dy * F[i] / 2, 0], [CX(i) + dx * F[i] / 2, CY(i) + dy * F[i] / 2, H[i] + LIFT + 9]);
  fit(C, pts, 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // the path on the ground, drawn first so every pillar stands on it
  const ends = [[CX(0) - 24, CY(0) + 24], [CX(N - 1) + 26, CY(N - 1) - 26]];
  mk("path", { class: "nf dash", d: open([ends[0], ...Array.from({ length: N }, (_, i) => [CX(i), CY(i)]), ends[1]].map(([x, y]) => P(x, y, 0))) }, g);
  for (const [x, y] of ends) place(flatDot(g, C, 1.3, "dot m"), P(x, y, 0));

  const cols = [];
  for (let i = 0; i < N; i++) {
    const cx = CX(i), cy = CY(i), f = F[i] / 2, grp = mk("g", {}, g), el = solid(grp), marks = [];
    const [ring, inner] = rings(cx - f, cy - f, cx + f, cy + f, 5, 1.5);
    if (i === 0) {
      // discover: a few points, gathered
      for (let k = 0; k < 5; k++) { const d = flatDot(grp, C, 0.85, k === 0 ? "dot m" : "dot off"), a = (k - 1) * Math.PI / 2, r = k === 0 ? 0 : 4.6; marks.push((z) => place(d, P(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z))); }
    } else if (i === 1) {
      // strategy: two rings, a target
      const a = mk("path", { class: "nf" }, grp), b = mk("path", { class: "nf lo" }, grp), ra = at(circ(7.2, 22), cx, cy), rb = at(circ(3.2, 14), cx, cy);
      marks.push((z) => { a.setAttribute("d", poly(ringAt(P, ra, z))); b.setAttribute("d", poly(ringAt(P, rb, z))); });
    } else if (i === 2) {
      // execute: a window's bar, its dots and two lines
      const bar = mk("path", { class: "nf" }, grp), lines = mk("path", { class: "nf lo" }, grp), dots = [0, 1].map(() => flatDot(grp, C, 0.75, "dot m"));
      marks.push((z) => {
        bar.setAttribute("d", seg(P(cx - f + 2.5, cy - f + 8.5, z), P(cx + f - 2.5, cy - f + 8.5, z)));
        lines.setAttribute("d", seg(P(cx - f + 5.5, cy - f + 14, z), P(cx + f - 6, cy - f + 14, z)) + seg(P(cx - f + 5.5, cy - f + 19, z), P(cx + 3, cy - f + 19, z)));
        dots.forEach((d, k) => place(d, P(cx - f + 5.5 + k * 3.8, cy - f + 4.8, z)));
      });
    } else {
      // evolve: a stepped beacon, one disc on another, standing proud of the lid
      const lo = solid(grp), hi = solid(grp), r1 = at(circ(9, 26), cx, cy), i1 = at(circ(7.5, 26), cx, cy), r2 = at(circ(5, 20), cx, cy), i2 = at(circ(3.6, 20), cx, cy);
      marks.push((z) => { put(lo, prism(P, front, r1, i1, z, z + 3.5)); put(hi, prism(P, front, r2, i2, z + 3.5, z + 8)); });
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
  name: "growth",
  means: "Four pillars climb across the frame: the pointer picks a stage, and the climb stands up to it and waits beyond it.",
  rules: [1, 2, 5, 8],
  range: [0, 50, 100],
  tour: [[87, 200], [162, 190], [238, 170], [313, 130], null],
  mount,
});
