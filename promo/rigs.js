(() => {
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const lerp = (a, b, k) => a + (b - a) * k;
const fr = () => document.getElementById('frame');
const A = {
  step: s => __aeroStep(s),
  S: () => __aeroActive(),
  go: id => __aeroJump(__aeroSceneAt(id)),
  key: (code, down, mods = {}) => dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true, ...mods })),
  tap(code, mods) { A.key(code, true, mods); A.step(1 / 30); A.key(code, false, mods); },
  runners() { const out = []; A.S().scene.traverse(o => { if (o.isSkinnedMesh && o.material.type === 'MeshStandardMaterial' && o.parent.parent.visible) out.push({ mesh: o, root: o.parent.parent, B: o.skeleton.bones }); }); return out; },
  runner() { return A.runners()[0] || null; },
  P(v) { const R = fr().getBoundingClientRect(), p = v.clone().project(A.S().cam), s = window.devicePixelRatio || 1; return [(R.left + (p.x * .5 + .5) * R.width) * s, (R.top + (-p.y * .5 + .5) * R.height) * s, p.z]; },
  client(v) { const R = fr().getBoundingClientRect(), p = v.clone().project(A.S().cam); return { clientX: R.left + (p.x * .5 + .5) * R.width, clientY: R.top + (-p.y * .5 + .5) * R.height }; },
  clientF(fx, fy) { const R = fr().getBoundingClientRect(); return { clientX: R.left + fx * R.width, clientY: R.top + fy * R.height }; },
  ptr: (el, type, pos) => { A.cur = pos; el.dispatchEvent(new PointerEvent(type, { ...pos, bubbles: true, pointerId: 1, button: 0, isPrimary: true })); },
  cur: null,
  cursorMark() {
    if (!A.cur) return []; const s = devicePixelRatio, k = 2.6 * s, x = A.cur.clientX * s, y = A.cur.clientY * s;
    return [{ k: 'line', w: 3, pts: [[0, 0], [0, 17], [4, 13], [7, 20], [10, 19], [7, 12], [12, 12], [0, 0]].map(([a, b]) => [x + a * k, y + b * k]) }];
  },
  copyCam() {
    const rs = A.runners(), c = rs.length ? rs.reduce((a, r) => a.add(r.root.position), V(0, 0, 0)).multiplyScalar(1 / rs.length) : V(0, 0, 0);
    c.x = Math.max(-1.2, Math.min(1.2, c.x)); A.focus = A.focus ? A.focus.lerp(c, .06) : c.clone();
    A.look(V(A.focus.x, 2.3, A.focus.z + 8.6), V(A.focus.x, 1.0, A.focus.z));
  },
  world: (b, y = 0) => b.localToWorld(V(0, y, 0)),
  look(pos, at) { const c = A.S().cam; c.position.copy(pos); c.lookAt(at); c.updateProjectionMatrix(); },
  hide(sel) { const st = document.createElement('style'); st.textContent = sel + ' { display: none !important; }'; document.head.appendChild(st); },
};
const ov = () => document.getElementById('copyOv');
const at = (lt, t) => Math.round(lt * 30) === Math.round(t * 30);
const circle = (cx, cy, r, n = 28) => Array.from({ length: n + 1 }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);

function skinned(R, i, v) {
  const m = R.mesh; m.updateMatrixWorld(true);
  return v.clone().applyMatrix4(m.bindMatrix).applyMatrix4(m.skeleton.boneInverses[i]).applyMatrix4(R.B[i].matrixWorld).applyMatrix4(m.bindMatrixInverse).applyMatrix4(m.matrixWorld);
}
const CAPS = [[0, [0, .9, 0, 1.14, .165]], [1, [0, 1.14, 0, 1.38, .165]], [2, [0, 1.38, 0, 1.62, .165]], [2, [-.18, 1.55, .18, 1.55, .09]],
  [3, [-.26, 1.55, -.26, 1.25, .062]], [4, [-.26, 1.25, -.26, .93, .062]], [5, [.26, 1.55, .26, 1.25, .062]], [6, [.26, 1.25, .26, .93, .062]],
  [7, [-.09, .98, -.09, .52, .075]], [8, [-.09, .52, -.09, .075, .075]], [9, [.09, .98, .09, .52, .075]], [10, [.09, .52, .09, .075, .075]]];
function capsuleMarks(R) {
  const out = [], cam = A.S().cam, right = V(1, 0, 0).applyQuaternion(cam.quaternion);
  for (const [bi, [ax, ay, bx, by, r]] of CAPS) {
    const a = skinned(R, bi, V(ax, ay, 0)), b = skinned(R, bi, V(bx, by, 0));
    const pa = A.P(a), pb = A.P(b), pr = A.P(a.clone().addScaledVector(right, r)), rp = Math.hypot(pr[0] - pa[0], pr[1] - pa[1]);
    const dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * rp, ny = dx / L * rp, ang = Math.atan2(dy, dx);
    const arc = (c, a0) => Array.from({ length: 15 }, (_, i) => { const t = a0 + i / 14 * Math.PI; return [c[0] + Math.cos(t) * rp, c[1] + Math.sin(t) * rp]; });
    out.push({ k: 'line', w: 2.5, pts: [[pa[0] + nx, pa[1] + ny], [pb[0] + nx, pb[1] + ny], ...arc(pb, ang + Math.PI / 2 - Math.PI), [pb[0] - nx, pb[1] - ny], [pa[0] - nx, pa[1] - ny], ...arc(pa, ang + Math.PI / 2), [pa[0] + nx, pa[1] + ny]] });
  }
  return out;
}
function pointMarks(R, every = 7) {
  const g = R.mesh.geometry, P = g.attributes.position, N = g.attributes.normal, cam = A.S().cam, out = [], v = V(0, 0, 0), n = V(0, 0, 0), w = V(0, 0, 0);
  R.mesh.updateMatrixWorld(true); R.mesh.skeleton.update();
  for (let i = 0; i < P.count; i += every) {
    v.fromBufferAttribute(P, i); R.mesh.boneTransform(i, v); w.copy(v).applyMatrix4(R.mesh.matrixWorld);
    n.fromBufferAttribute(N, i).transformDirection(R.root.matrixWorld);
    if (n.dot(cam.position.clone().sub(w)) < 0) continue;
    const p = A.P(w); out.push({ k: 'dot', x: p[0], y: p[1], r: 3.2 });
  }
  return out;
}
function boneMarks(R) {
  const B = R.B, W = (i, y = 0) => A.P(A.world(B[i], y)), hand = i => W(i, -.38), foot = i => W(i, -.445);
  const chains = [[W(0), W(1), W(2)], [W(2), W(3), W(4), hand(4)], [W(2), W(5), W(6), hand(6)], [W(0), W(7), W(8), foot(8)], [W(0), W(9), W(10), foot(10)]];
  const out = chains.map(c => ({ k: 'line', w: 4, pts: c.map(p => [p[0], p[1]]) }));
  for (let i = 0; i < 11; i++) { const p = W(i); out.push({ k: 'dot', x: p[0], y: p[1], r: 9 }); }
  return out;
}
function torsoWidth(y) {
  const f = window.__runnerSDF; if (!f) return null;
  let lo = 0, hi = .5; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (f(m, y, 0) < 0) lo = m; else hi = m; }
  return lo * 2;
}
function measureMarks(R, show) {
  const out = [], hs = [1.0, 1.1, 1.2, 1.3, 1.4].slice(0, show);
  for (const y of hs) {
    const w = torsoWidth(y), bi = y < 1.14 ? 0 : y < 1.38 ? 1 : 2;
    const a = A.P(skinned(R, bi, V(-w / 2, y, .2))), b = A.P(skinned(R, bi, V(w / 2, y, .2)));
    out.push({ k: 'line', w: 3, pts: [[a[0], a[1]], [b[0], b[1]]] }, { k: 'line', w: 3, pts: [[a[0], a[1] - 14], [a[0], a[1] + 14]] }, { k: 'line', w: 3, pts: [[b[0], b[1] - 14], [b[0], b[1] + 14]] });
  }
  return { marks: out, width: torsoWidth(1.2) };
}

const SCENES = {
  sea: o => ({
    setup() { A.go('title'); const c = A.S().cam; c.position.set(0, 6.2, 11.5); c.lookAt(0, -.5, -4); const pl = document.querySelector('#titleOv .plate'); if (pl) pl.style.visibility = o.plate === false ? 'hidden' : ''; A.step(1.2); this.drop(.5, .56); A.step(.3); },
    drop(fx, fy) { A.ptr(document.getElementById('titleOv'), 'pointerdown', A.clientF(fx, fy)); },
    tick(lt) {
      const hx = .5 + .28 * Math.sin(lt * .45), hy = .68 + .05 * Math.sin(lt * .8);
      A.ptr(document.getElementById('titleOv'), 'pointermove', A.clientF(hx, hy));
      const p = o.drops || [1.2, 2.9, 4.6, 6.4, 8.3, 10.2, 12.1, 14.0];
      if (p.some(d => at(lt, d))) this.drop(hx, hy);
    },
    ann(lt) {
      if (!o.digit || lt < o.digit[0] || lt > o.digit[1]) return [];
      const R = fr().getBoundingClientRect(), s = devicePixelRatio;
      return [{ k: 'call', id: 'digit', x: (R.left + R.width * .36) * s, y: (R.top + R.height * .83) * s, text: 'one of 11,904', dx: 160, dy: -260 }];
    },
    done() { const pl = document.querySelector('#titleOv .plate'); if (pl) pl.style.visibility = ''; },
  }),
  login: o => ({
    setup() { A.go('copy'); A.step(.1); A.cur = A.clientF(.85, .2); },
    tick(lt) {
      const S = A.S(), r = document.getElementById('begin').getBoundingClientRect(), to = { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
      if (lt < 1.5) { const k = ease(lt / 1.4), f = A.clientF(.85, .2); A.ptr(ov(), 'pointermove', { clientX: lerp(f.clientX, to.clientX, k), clientY: lerp(f.clientY, to.clientY, k) }); }
      if (at(lt, 1.7) && S.login) S.login();
      if (at(lt, 3.2)) A.tap('KeyW');
    },
    cam() { A.copyCam(); },
    ann() { return A.cursorMark(); },
  }),
  copyAll: o => {
    const st = {}, T = o.times;
    const crewBox = (pad = .03) => {
      let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
      for (const r of A.runners()) for (const dx of [-.42, .42]) for (const dz of [-.3, .3]) for (const y of [-.05, 2.2]) {
        const p = V(r.root.position.x + dx, r.root.position.y + y, r.root.position.z + dz).project(A.S().cam), fx = p.x * .5 + .5, fy = -p.y * .5 + .5;
        x0 = Math.min(x0, fx); y0 = Math.min(y0, fy); x1 = Math.max(x1, fx); y1 = Math.max(y1, fy);
      }
      return [[x0 - pad, y0 - pad], [x1 + pad, y1 + pad]];
    };
    const drag = (lt, t0, t1) => {
      if (at(lt, t0)) { st.box = crewBox(); A.ptr(ov(), 'pointerdown', A.clientF(...st.box[0])); }
      if (st.box && lt > t0 && lt < t1) { const k = ease((lt - t0) / (t1 - t0)), [a, b] = st.box; A.ptr(ov(), 'pointermove', A.clientF(lerp(a[0], b[0], k), lerp(a[1], b[1], k))); }
      if (st.box && at(lt, t1)) { A.ptr(ov(), 'pointerup', A.clientF(...st.box[1])); st.last = A.clientF(...st.box[1]); st.box = null; }
    };
    const glideTo = (lt, t0, t1, v) => {
      if (at(lt, t0)) st.from = st.last || A.clientF(.5, .5);
      if (lt >= t0 && lt <= t1) { const to = A.client(v), k = ease((lt - t0) / (t1 - t0)), p = { clientX: lerp(st.from.clientX, to.clientX, k), clientY: lerp(st.from.clientY, to.clientY, k) }; A.ptr(ov(), 'pointermove', p); st.last = p; }
    };
    const click = v => { const p = A.client(v); A.ptr(ov(), 'pointerdown', p); A.ptr(ov(), 'pointerup', p); };
    return {
      setup() { A.go('copy'); A.step(.1); A.copyCam(); A.ptr(ov(), 'pointermove', A.clientF(.85, .2)); st.last = A.clientF(.85, .2); },
      cam() { A.copyCam(); },
      ann() { return A.cursorMark(); },
      tick(lt) {
        const S = A.S();
        if (lt <= T.login) { const r = document.getElementById('begin').getBoundingClientRect(), f = A.clientF(.85, .2), k = ease((lt - .1) / Math.max(.2, T.login - .3)); if (lt >= .1) { const p = { clientX: lerp(f.clientX, r.left + r.width / 2, k), clientY: lerp(f.clientY, r.top + r.height / 2, k) }; A.ptr(ov(), 'pointermove', p); st.last = p; } }
        if (at(lt, T.login) && S.login) S.login();
        if (at(lt, T.login + 1.2)) A.tap('KeyW');
        drag(lt, T.copy, T.copy + .8);
        if (at(lt, T.copy + 1.2)) { A.key('KeyC', true, { ctrlKey: true }); A.key('KeyC', false, { ctrlKey: true }); }
        glideTo(lt, T.copy + 1.3, T.copy + 2.2, V(1.8, 0, .6));
        if (at(lt, T.copy + 2.4)) click(V(1.8, 0, .6));
        if (at(lt, T.move)) A.key('KeyD', true);
        if (at(lt, T.move + 1.2)) { A.key('KeyD', false); A.key('KeyS', true); }
        if (at(lt, T.move + 1.6)) A.key('Space', true);
        if (at(lt, T.move + 1.8)) A.key('Space', false);
        if (at(lt, T.move + 2.4)) { A.key('KeyS', false); A.key('KeyA', true); }
        if (at(lt, T.move + 3.4)) A.key('Space', true);
        if (at(lt, T.move + 3.6)) A.key('Space', false);
        if (at(lt, T.move + 4.0)) A.key('KeyA', false);
        drag(lt, T.cut, T.cut + .9);
        if (at(lt, T.cut + 1.3)) { A.key('KeyX', true, { ctrlKey: true }); A.key('KeyX', false, { ctrlKey: true }); }
        glideTo(lt, T.cut + 1.5, T.cut + 4.2, V(-1.6, 0, -.8));
        if (at(lt, T.cut + 4.6)) click(V(-1.6, 0, -.8));
      },
    };
  },
  arrive: o => ({
    setup() { A.go('arrive'); A.step(.4); if (o.run) A.key('ShiftLeft', true); A.key('KeyD', true); A.step(.3); },
    tick(lt) { if (o.jumps) for (const j of o.jumps) { if (at(lt, j)) A.key('Space', true); if (at(lt, j + .2)) A.key('Space', false); } },
    done() { A.key('KeyD', false); A.key('ShiftLeft', false); },
  }),
  reveal: o => ({ setup() { A.go('reveal'); A.step(.6); } }),
  tape: o => ({ setup() { A.go('tape'); A.step(.3); } }),
  player: o => ({ setup() { A.go('player'); A.step(.4); } }),
  open: o => ({ setup() { A.go('open'); A.step(.1); } }),
  orbit: o => ({
    setup() { A.go('climb'); const S = A.S(); S.reset(); A.step(.3); const a = __aero, b = a.boxes[o.box ?? 0]; a.pos.set(b.x, b.top + .01, b.z); a.vel.set(0, 0, 0); A.step(.6); },
    cam(lt) {
      const t = lt + (o.t0 || 0), a = (o.a0 ?? -.5) + t * (o.spin ?? .06), c = o.center || [0, 4, -26], r = o.r || 34, h = o.h || 20;
      A.look(V(c[0] + Math.sin(a) * r, c[1] + h, c[2] + Math.cos(a) * r), V(c[0], c[1] + (o.lookUp || 0), c[2]));
    },
  }),
  pillar: o => ({
    setup() { A.go('climb'); A.S().reset(); A.step(.3); const a = __aero, b = a.boxes[0]; a.pos.set(b.x, b.top + .01, b.z); A.step(.6); },
    cam(lt) {
      const b = __aero.boxes[o.box ?? 3], k = ease(lt / (o.dur || 10)), y = lerp(b.top + 3, b.top - 22, k);
      A.look(V(b.x + 9.5, y, b.z + 11), V(b.x, y - 2 - 6 * k, b.z));
    },
    ann(lt) {
      const b = __aero.boxes[o.box ?? 3], top = b.top - .5, pw = b.w * .62, edge = b.x + pw / 2 + .25;
      const a = A.P(V(edge, top, b.z + b.d * .31 + .3)), z = A.P(V(edge, top - 70, b.z + b.d * .31 + .3));
      const mid = A.P(V(edge, top - 6 - 6 * ease(lt / (o.dur || 10)), b.z + b.d * .31 + .3));
      return [{ k: 'line', w: 3, dash: [14, 10], pts: [[a[0], a[1]], [z[0], z[1]]] }, { k: 'call', id: 'pillar', x: mid[0], y: mid[1], text: '70 m', dx: 170, dy: -150 }];
    },
  }),
  ring: o => ({
    setup() { A.go('climb'); A.S().reset(); A.step(.3); const a = __aero, b = a.boxes[2]; a.pos.set(b.x, b.top + .01, b.z); A.step(.6); },
    cam(lt) { const b = __aero.boxes[o.box ?? 6], a = (o.a0 ?? .3) + lt * .22; A.look(V(b.x + Math.sin(a) * 6.5, b.top + 5, b.z + Math.cos(a) * 6.5), V(b.x, b.top - .4, b.z)); },
    ann(lt) {
      if (!o.outline) return [];
      const b = __aero.boxes[o.box ?? 6], m = Math.min(b.w, b.d), oo = m * .78, ii = m * .52, ow = b.w - (m - oo), od = b.d - (m - oo), iw = b.w - (m - ii), id = b.d - (m - ii), y = b.top + .06;
      const sq = (w, d) => [[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].map(([sx, sz]) => { const p = A.P(V(b.x + sx * w / 2, y, b.z + sz * d / 2)); return [p[0], p[1]]; });
      const k = ease((lt - .6) / .8); if (k <= 0) return [];
      const out = [{ k: 'line', w: 3, o: k, pts: sq(ow, od) }];
      if (lt > 1.6) out.push({ k: 'line', w: 3, dash: [14, 10], o: ease((lt - 1.6) / .8), pts: sq(iw, id) });
      const c = A.P(V(b.x - ow / 2, y, b.z + od / 2)), h = A.P(V(b.x, y, b.z + id / 2));
      out.push({ k: 'call', id: 'sq', x: c[0], y: c[1], text: 'one square', dx: -170, dy: -220 });
      if (lt > 2.2) out.push({ k: 'call', id: 'hole', x: h[0], y: h[1], text: 'a smaller one cut out', dx: 150, dy: 260 });
      return out;
    },
  }),
  sweep: o => ({
    setup() { A.go('climb'); A.S().reset(); A.step(.3); const a = __aero, b = a.boxes[o.from ?? 4]; a.pos.set(b.x, b.top + .01, b.z); A.step(.6); },
    cam(lt) {
      const B = __aero.boxes, path = o.path || [1, 3, 5, 6, 8, 9], u = Math.min(path.length - 1.001, lt / (o.dur || 8) * (path.length - 1)), i = Math.floor(u), k = ease(u - i);
      const p = B[path[i]], q = B[path[i + 1]], x = lerp(p.x, q.x, k), z = lerp(p.z, q.z, k), y = lerp(p.top, q.top, k);
      A.look(V(x + 5, y + 7.5, z + 6), V(x, y, z));
    },
  }),
  climb: o => {
    const st = { i: o.from ?? 0, jt: -9 };
    return {
      setup() {
        A.go('climb'); const S = A.S(); S.reset(); A.step(.2);
        const a = __aero, b = a.boxes[st.i]; a.pos.set(b.x + (o.dx || 0), b.top + .01, b.z + (o.dz ?? (st.i ? 0 : 1.5))); a.vel.set(0, 0, 0);
        if (o.pipe) { const L = a.boxes[12], M = a.mouth; a.pos.set(M.x + .2, L.top + .01, M.z + 3.2); const st0 = window.setTimeout; window.setTimeout = (f, ms, ...r) => (f && f.name === 'finale' ? 0 : st0(f, ms, ...r)); }
        if (o.collect) a.collectAll();
        st.yaw = o.yaw ?? .35; a.yaw = st.yaw; A.step(.8);
      },
      tick(lt) {
        const a = __aero, K = a.keys, B = a.boxes;
        for (const [t, k] of o.taps || []) { if (at(lt, t)) A.key(k, true); if (at(lt, t + .12)) A.key(k, false); }
        for (const [t, k, bi] of o.aims || []) {
          const q = B[bi], aim = () => A.ptr(document.getElementById('gl'), 'pointermove', A.client(V(q.x, q.top, q.z)));
          if (at(lt, t)) { aim(); A.key(k, true); }
          if (lt > t && lt < t + .6) aim();
          if (at(lt, t + .7)) A.key(k, false);
        }
        if (o.pipe) {
          const L = B[12], m = a.mouth;
          if (at(lt, .3)) A.key('Digit1', true);
          if (lt > .4 && lt < 1.3) A.ptr(document.getElementById('gl'), 'pointermove', A.client(V(m.x, L.top + .4, m.z - .4)));
          if (at(lt, 1.4)) A.key('Digit1', false);
          return;
        }
        const paused = (o.pause || []).some(([p0, p1]) => lt >= p0 && lt < p1);
        if (o.walkTo == null || st.i >= o.walkTo || paused) { K.f = K.b = K.l = K.r = K.j = false; if (!paused || !a.piping) return; return; }
        if (o.goto && st.i === o.from) {
          const g = B[o.from], gx = g.x + o.goto[0], gz = g.z + o.goto[1], ex = gx - a.pos.x, ez = gz - a.pos.z;
          if (Math.hypot(ex, ez) < .25) { K.f = K.b = K.l = K.r = K.j = false; return; }
          const w = Math.atan2(-ex, -ez); let dd = w - st.yaw; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); st.yaw += dd * .08; a.yaw = st.yaw; K.f = true; return;
        }
        const tgt = B[st.i + 1], dx = tgt.x - a.pos.x, dz = tgt.z - a.pos.z, want = Math.atan2(-dx, -dz);
        let d = want - st.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); st.yaw += d * Math.min(1, .08); a.yaw = st.yaw;
        const dir = V(-Math.sin(want), 0, -Math.cos(want));
        K.f = true; K.l = K.r = K.b = false;
        const cur = B[st.i], ahead = a.pos.clone().addScaledVector(dir, o.look ?? 1.0);
        const onCur = Math.abs(a.pos.x - cur.x) < cur.w / 2 + .3 && Math.abs(a.pos.z - cur.z) < cur.d / 2 + .3 && Math.abs(a.pos.y - cur.top) < .05;
        const offAhead = !(Math.abs(ahead.x - cur.x) < cur.w / 2 && Math.abs(ahead.z - cur.z) < cur.d / 2);
        if (onCur && offAhead && lt - st.jt > .5) { K.j = true; st.jt = lt; }
        if (lt - st.jt > .42) K.j = false;
        for (let j = B.length - 1; j > st.i; j--) { const q = B[j]; if (Math.abs(a.pos.x - q.x) < q.w / 2 && Math.abs(a.pos.z - q.z) < q.d / 2 && Math.abs(a.pos.y - q.top) < .05) { st.i = j; break; } }
      },
      done() { const K = __aero.keys; K.f = K.b = K.l = K.r = K.j = false; },
    };
  },
  body: o => ({
    setup() {
      A.go('copy'); A.step(.1); const S = A.S(); if (S.login) S.login(); A.step(.6);
      A.tap('KeyW'); A.step(.8);
      if (o.walk) A.key('KeyW', true);
    },
    cam(lt) {
      const R = A.runner(); if (!R) return; const p = R.root.position, t = lt + (o.t0 || 0), a = (o.a0 ?? -.9) + t * (o.spin ?? .3), r = o.r || 3.3, h = o.h ?? 1.25;
      A.look(V(p.x + Math.sin(a) * r, h, p.z + Math.cos(a) * r), V(p.x, o.lookY ?? 1.05, p.z));
    },
    ann(lt) {
      const R = A.runner(); if (!R || !o.ann) return [];
      const k = ease((lt - (o.annAt ?? .8)) / .6); if (k <= 0) return [];
      const fade = L => L.map(m => ({ ...m, o: (m.o ?? 1) * k }));
      if (o.ann === 'capsules') return fade(capsuleMarks(R));
      if (o.ann === 'points') return fade(pointMarks(R, o.every || 6));
      if (o.ann === 'bones') return fade(boneMarks(R));
      if (o.ann === 'measure') {
        const m = measureMarks(R, Math.min(5, 1 + Math.floor((lt - (o.annAt ?? .8)) / .55)));
        const c = A.P(skinned(R, 1, V(m.width / 2, 1.2, .2)));
        return [...fade(m.marks), ...(lt > (o.annAt ?? .8) + 2.4 ? [{ k: 'call', id: 'w', x: c[0], y: c[1], r: 22, text: `${Math.round(m.width * 100)} cm at every height`, dx: 150, dy: -330 }] : [])];
      }
      if (o.ann === 'notes') {
        const out = [], B = R.B, l = A.P(A.world(B[1], .05)), arm = A.P(A.world(B[3], -.04));
        if (lt > o.notes[0]) out.push({ k: 'call', id: 'torso', x: l[0], y: l[1], text: '“the torso is too slender”', dx: -120, dy: -380 });
        if (lt > o.notes[1]) out.push({ k: 'call', id: 'arm', x: arm[0], y: arm[1], text: '“the armpit stretches”', dx: 130, dy: -560 });
        return out;
      }
      return [];
    },
    done() { A.key('KeyW', false); },
  }),
  side: o => {
    let F = null;
    return {
      setup() { A.go('arrive'); A.step(.6); A.key('KeyD', true); if (o.run) A.key('ShiftLeft', true); A.step(1.2); },
      cam(lt) {
        const R = A.runner(); const p = R.root.getWorldPosition(V(0, 0, 0)), c = A.S().cam, d = o.d || 3.4, h = o.h ?? .8;
        c.position.set(p.x + (o.lead ?? .1), p.y + h, p.z + d); c.lookAt(p.x + (o.lead ?? .1), p.y + (o.look ?? .45), p.z); c.updateProjectionMatrix();
      },
      ann(lt) { const R = A.runner(); if (!R || !o.ann) return []; const k = ease((lt - (o.annAt ?? .6)) / .6); return k > 0 ? boneMarks(R).map(m => ({ ...m, o: k })) : []; },
      done() { A.key('KeyD', false); A.key('ShiftLeft', false); },
    };
  },
  menu: o => ({
    setup() { A.go('copy'); A.step(.1); const S = A.S(); if (S.login) S.login(); A.step(.6); A.tap('KeyW'); A.step(.8); },
    tick(lt) {
      const R = A.runner(); if (!R) return;
      if (!this.box) { const a = A.clientF(.12, .3), b = A.clientF(.62, .8); this.box = [a, b]; A.ptr(ov(), 'pointermove', { clientX: a.clientX - 30, clientY: a.clientY - 40 }); }
      const [a, b] = this.box;
      if (at(lt, .3)) A.ptr(ov(), 'pointerdown', a);
      if (lt > .3 && lt < 1.1) { const k = ease((lt - .3) / .8); A.ptr(ov(), 'pointermove', { clientX: lerp(a.clientX, b.clientX, k), clientY: lerp(a.clientY, b.clientY, k) }); }
      if (at(lt, 1.1)) A.ptr(ov(), 'pointerup', b);
    },
    cam() { A.copyCam(); },
    ann(lt) {
      if (lt < (o.noteAt ?? 1.6)) return A.cursorMark();
      const m = document.getElementById('ctx'); if (!m) return []; const r = m.getBoundingClientRect(), s = devicePixelRatio;
      if (!r.width) return [];
      return [...A.cursorMark(), { k: 'call', id: 'menu', x: (r.left + r.width * .5) * s, y: (r.top + r.height * .5) * s, r: 40, text: '“that menu covers too much”', dx: -200, dy: -420 }];
    },
  }),
};

SCENES.director = o => {
  const D = () => (A.S() && A.S().debug ? A.S().debug() : null), name = () => document.getElementById('sceneName').textContent;
  const pov = () => document.getElementById('puzzleOv');
  let i = 0, t0 = 0, st = {}, cam0 = null, lastLook = null;
  const glide = (lt, from, to, dur, el, type = 'pointermove') => { const k = ease(Math.min(1, lt / dur)); A.ptr(el, type, { clientX: lerp(from.clientX, to.clientX, k), clientY: lerp(from.clientY, to.clientY, k) }); return lt >= dur; };
  const cpt = p => ({ clientX: p.x, clientY: p.y });
  const T = q => d => q === 'done' ? d.done : q.startsWith('z<') ? d.crew[0].pos[2] < +q.slice(2) : q.startsWith('z>') ? d.crew[0].pos[2] > +q.slice(2) : false;
  const ACT = {
    wait: (lt, sec) => lt >= sec,
    scene: (lt, nm) => name() === nm && lt > .2,
    key: (lt, code, down) => { A.key(code, down); return true; },
    hold: (lt, code, sec) => { if (lt === 0) A.key(code, true); if (lt >= sec) { A.key(code, false); return true; } return false; },
    holdUntil: (lt, code, test, max = 12) => { if (lt === 0) A.key(code, true); const d = D(); if ((d && T(test)(d)) || lt >= max) { A.key(code, false); return true; } return false; },
    jumpWhen: (lt, test, max = 6) => { const d = D(); if (st.jt == null && d && T(test)(d)) { A.key('Space', true); st.jt = lt; } if (st.jt != null && lt - st.jt > .3) { A.key('Space', false); st.jt = null; return true; } return lt >= max; },
    until: (lt, test, max = 12) => { const d = D(); return (d && T(test)(d)) || lt >= max; },
    select: (lt, idx) => {
      const d = D(); if (!d) return false; if (o.lookAhead && o.lookAhead[name()]) st.look = o.lookAhead[name()]; const c = d.crew[idx].screen, a = { clientX: c.x - 34, clientY: c.y - 52 }, b = { clientX: c.x + 34, clientY: c.y + 52 };
      if (lt === 0) st.from = A.cur || { clientX: c.x + 120, clientY: c.y - 160 };
      if (lt < .5) { glide(lt, st.from, a, .5, pov()); return false; }
      if (!st.down) { A.ptr(pov(), 'pointerdown', a); st.down = true; return false; }
      if (lt < 1.2) { glide(lt - .5, a, b, .7, pov()); return false; }
      A.ptr(pov(), 'pointerup', b); st.down = false; return true;
    },
    clip: (lt, kind) => { if (lt < .35) return false; A.key(kind === 'copy' ? 'KeyC' : 'KeyX', true, { ctrlKey: true }); A.key(kind === 'copy' ? 'KeyC' : 'KeyX', false, { ctrlKey: true }); return true; },
    paste: (lt, idx) => {
      const d = D(); if (!d) return false; st.look = d.pads[idx].pos; const p = cpt(d.pads[idx].screen);
      if (lt === 0) st.from = A.cur || p;
      if (lt < .8) { glide(lt, st.from, p, .8, pov()); return false; }
      if (lt < 1.15) { A.ptr(pov(), 'pointermove', p); return false; }
      A.ptr(pov(), 'pointerdown', p); A.ptr(pov(), 'pointerup', p); return true;
    },
    aim: (lt, code, x, y, z) => {
      st.look = [x, y, z]; const S = A.S(), p = S.project(x, y, z), to = cpt(p);
      if (lt === 0) { A.key(code, true); st.from = A.cur || { clientX: to.clientX + 80, clientY: to.clientY + 140 }; }
      if (lt < .7) { glide(lt, st.from, to, .7, pov()); return false; }
      if (lt < 1.3) { A.ptr(pov(), 'pointermove', to); return false; }
      A.key(code, false); return true;
    },
    goto: (lt, id) => { if (lt === 0) A.go(id); return lt > .3; },
    pipe: lt => {
      if (lt === 0) {
        A.go('climb'); const S = A.S(); S.reset(); A.step(.2);
        const a = __aero, L = a.boxes[12], M = a.mouth; a.collectAll(); a.pos.set(M.x + .2, L.top + .01, M.z + 3.2); a.vel.set(0, 0, 0); a.yaw = .35; A.step(.8);
        return false;
      }
      const a = __aero, L = a.boxes[12], M = a.mouth;
      if (lt > .5 && !st.k) { A.key('Digit1', true); st.k = 1; }
      if (st.k === 1 && lt < 1.6) A.ptr(document.getElementById('gl'), 'pointermove', A.client(V(M.x, L.top + .4, M.z - .4)));
      if (st.k === 1 && lt >= 1.6) { A.key('Digit1', false); return true; }
      return false;
    },
  };
  return {
    setup() {
      const st0 = window.setTimeout;
      window.setTimeout = (f, ms, ...r) => (f && /goNext\(L\.next\)/.test(String(f)) && name() === 'Heads up' ? 0 : st0(f, ms, ...r));
      if (o.ui === false) A.hide('#ptoasts, #toasts, #lvHud, #count');
      else A.hide('#lvHud, #count');
    },
    tick(lt) {
      const steps = o.steps; if (i >= steps.length) return;
      const [k, ...args] = steps[i], l = Math.round((lt - t0) * 30) / 30;
      if (ACT[k](l, ...args)) { i++; t0 = lt + 1 / 30; st = {}; }
      const d = D(); window.__dirdbg = { step: i, k, crew: d && d.crew.map(c => c.pos), aim: d && d.aim && d.aim.ok, cur: A.cur && [Math.round(A.cur.clientX), Math.round(A.cur.clientY)] };
    },
    cam(lt) {
      const d = D(); if (!d || !d.crew.length) { cam0 = null; return; }
      const pts = d.crew.map(c => V(...c.pos)); if (st.look) pts.push(V(...st.look)); else if (lastLook && lt - lastLook.t < 1.2) pts.push(lastLook.v);
      if (st.look) lastLook = { v: V(...st.look), t: lt };
      const c = pts.reduce((a, p) => a.add(p), V(0, 0, 0)).multiplyScalar(1 / pts.length), cam = A.S().cam, pitch = name() === 'Heads up' ? 1.0 : .78, dir = V(0, Math.sin(pitch), Math.cos(pitch));
      let D0 = 40;
      for (let Dd = 8; Dd < 40; Dd += .5) {
        cam.position.copy(c).addScaledVector(dir, Dd); cam.lookAt(c); cam.updateMatrixWorld(true);
        if (pts.every(p => [0, 2.2].every(h => { const q = p.clone().setY(p.y + h).project(cam); return Math.abs(q.x) < .82 && q.y < .5 && q.y > -.55; }))) { D0 = Dd; break; }
      }
      if (!cam0 || name() !== cam0.name) cam0 = { c: c.clone(), D: D0, name: name() };
      cam0.c.lerp(c, .07); cam0.D += (D0 - cam0.D) * .07;
      cam.position.copy(cam0.c).addScaledVector(dir, cam0.D); cam.lookAt(cam0.c); cam.updateMatrixWorld(true);
    },
    ann() { return A.S() && A.S().debug && A.cur ? A.cursorMark() : []; },
  };
};

let seq = [], starts = [], cur = -1, meta = null;
window.CLIP_RUN = {
  async start(name) {
    window.requestAnimationFrame = () => 0; document.documentElement.style.scrollBehavior = 'auto';
    A.focus = null;
    A.hide('.word, #promo');
    const def = window.__TAKES[name];
    if (def.legacy) { this.legacy = window.CLIP_DEFS[def.legacy]; await this.legacy.setup(); return; }
    seq = def.seq.map(([k, dur, o]) => ({ ...SCENES[k](o || {}), dur })); starts = []; let t = 0;
    for (const s of seq) { starts.push(t); t += s.dur; }
    cur = -1;
  },
  async each(t) {
    if (this.legacy) { meta = this.legacy.frame(t); if (this.legacy.after) await this.legacy.after(); return; }
    let k = seq.length - 1; while (k > 0 && starts[k] > t + 1e-6) k--;
    const s = seq[k];
    if (k !== cur) { if (cur >= 0 && seq[cur].done) seq[cur].done(); cur = k; s.setup(); }
    const lt = Math.round((t - starts[k]) * 30) / 30;
    if (s.tick) s.tick(lt);
    A.step(1 / 30);
    if (s.cam) { s.cam(lt); A.step(0); }
    meta = { scene: k, dbg: window.__dirdbg, name: document.getElementById('sceneName').textContent, ann: s.ann ? s.ann(lt) : [], pos: window.__aero && A.S() && A.S().scene && __aero.pos ? [__aero.pos.x, __aero.pos.y, __aero.pos.z].map(v => +v.toFixed(2)) : null };
  },
  meta: () => meta,
};
})();
