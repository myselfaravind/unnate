/**
 * Beneath: what looks like one screen is a stack of four plates. On top, the
 * surface people see, a window with its bar, dots and a button. Under it, the
 * identity (a disc and a bar standing proud), then the system (a grid of
 * dots), then a plain base. At rest the stack stands a little open, each plate showing, and only the
 * surface is bright. The pointer's height picks a plate, which takes the
 * bright edge; its distance across pulls the stack apart, the gaps beside the
 * chosen plate opening most. The slider is the widest gap.
 *
 * The pattern: scrub and pick. One spring per gap, a hit test on bands of the
 * frame that never move, and a rest that is already a composition.
 */
const {
  Cam, circ, clamp, facing, fit, lerp, open, poly, prism, proj, ringAt, rings, rrect, run, seg,
  spring, stepS, disposer, flatDot, mk, place, pointer, put, register, solid,
} = HL;

const W = 112, D = 78, N = 4, TH = [7, 4, 4, 4], RC = 11;
const REST = [13, 13, 19], MIN = 6, FAR = 0.42, RSUM = REST[0] + REST[1] + REST[2];
const BAND0 = 62, BAND1 = 270, X0 = 96, X1 = 304;

/** A ring moved to stand somewhere else on its plate. */
const at = (ring, x, y) => ring.map((q) => ({ ...q, u: q.u + x, v: q.v + y }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let G = value, act = -1, pull = 0;

  // Fitted to the stack pulled as far as it goes, which grows up and down from its middle.
  const C = Cam(45, 0.5, 1.74), SPAN = 3 * MIN + 30 * (2 + FAR) - RSUM;
  fit(C, [[0, 0, -SPAN / 2], [W, D, -SPAN / 2], [W, 0, 0], [0, D, 0], [0, 0, RSUM + 19 + SPAN / 2], [W, D, RSUM + 19 + SPAN / 2]], 200, 162);
  const P = proj(C), front = facing(C);
  const [ring, inner] = rings(0, 0, W, D, RC, 1.8);
  const g = mk("g", {}, svg);

  // Each plate: its solid, then the marks that lie or stand on its top.
  const plates = [];
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, g), el = solid(grp), marks = [];
    if (i === 1) {
      // the system: a grid of dots
      for (let a = 0; a < 6; a++) for (let b = 0; b < 4; b++) {
        const dot = flatDot(grp, C, 0.9, (a + b) % 3 === 0 ? "dot m" : "dot off"), x = 16 + a * 16, y = 15 + b * 16;
        marks.push((z) => place(dot, P(x, y, z)));
      }
    }
    if (i === 2) {
      // the identity: a disc and a bar, standing proud of the plate
      const disc = solid(grp), dr = at(circ(17, 28), 36, 40), di = at(circ(15.2, 28), 36, 40);
      const bar = solid(grp), [br, bi] = rings(64, 24, 98, 56, 6, 1.5);
      marks.push((z) => { put(disc, prism(P, front, dr, di, z, z + 4.5)); put(bar, prism(P, front, br, bi, z, z + 3)); });
    }
    if (i === 3) {
      // the surface: a window's bar and dots, a heading, two lines and a button
      const bar = mk("path", { class: "nf" }, grp), head = mk("path", { class: "nf" }, grp), rules = mk("path", { class: "nf lo" }, grp);
      const btn = mk("path", { class: "nf" }, grp), br = rrect(14, 56, 50, 68, 5, 5);
      const dots = [9, 16, 23].map(() => flatDot(grp, C, 1, "dot m"));
      marks.push((z) => {
        bar.setAttribute("d", seg(P(3, 16, z), P(W - 3, 16, z)));
        head.setAttribute("d", seg(P(14, 28, z), P(76, 28, z)));
        rules.setAttribute("d", seg(P(14, 38, z), P(96, 38, z)) + seg(P(14, 46, z), P(84, 46, z)));
        btn.setAttribute("d", poly(ringAt(P, br, z)));
        dots.forEach((d, k) => place(d, P(11 + k * 7, 8.5, z)));
      });
    }
    plates.push({ el, marks, drawn: NaN });
  }
  const gaps = REST.map((r) => spring(r, { eps: 0.03 }));

  function draw() {
    const total = gaps[0].x + gaps[1].x + gaps[2].x;
    let z = -(total - RSUM) / 2;
    plates.forEach((p, i) => {
      if (z !== p.drawn) {
        p.drawn = z;
        put(p.el, prism(P, front, ring, inner, z, z + TH[i]));
        for (const m of p.marks) m(z + TH[i]);
      }
      z += TH[i] + (i < 3 ? gaps[i].x : 0);
    });
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const s of gaps) if (stepS(s, dt)) moving = true;
    draw();
    return moving;
  });
  bag.add(B.unregister);

  /** Retargets the three gaps: those beside the chosen plate open fully, the others part of the way. */
  function retarget() {
    gaps.forEach((s, j) => {
      s.t = act < 0 ? REST[j] : MIN + G * lerp(0.3, 1, pull) * (j === act || j + 1 === act ? 1 : FAR);
    });
    plates.forEach((p, i) => p.el.sil.classList.toggle("hi", act < 0 ? i === 3 : i === act));
    read.textContent = act < 0 ? "rest" : "layer " + (act + 1);
    B.wake();
  }

  bag.add(pointer(stage, {
    // Bands of the frame, not the plates on screen: the choice cannot move out from under the pointer.
    move: ([x, y]) => {
      act = clamp(N - 1 - Math.floor(((y - BAND0) / (BAND1 - BAND0)) * N), 0, N - 1);
      pull = clamp((x - X0) / (X1 - X0), 0, 1);
      retarget();
    },
    leave: () => { act = -1; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  retarget();

  return {
    set: (v) => { G = v; if (act >= 0) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "beneath",
  means: "One screen comes apart into the plates beneath it: the pointer's height picks a plate, its reach opens the stack.",
  rules: [1, 3, 5, 9],
  range: [12, 21, 30],
  tour: [[290, 88], [250, 140], [290, 196], [150, 248], null],
  mount,
});
