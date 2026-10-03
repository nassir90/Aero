(() => {
const OLD_GAIT = 'a1ed95b';
const game = (rev, hash) => (rev ? `/old/${rev}/games/aero/index.html` : '/games/aero/index.html') + `?shape=9x16&capture#${hash}`;

const A = {
  V: (x, y, z) => new THREE.Vector3(x, y, z),
  step: dt => __aeroStep(dt),
  S: () => __aeroActive(),
  jump: id => __aeroJump(__aeroSceneAt(id)),
  key: (code, down) => dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true })),
  runner() { let r = null; A.S().scene.traverse(o => { if (!r && o.isSkinnedMesh && o.material.type === 'MeshStandardMaterial' && o.parent.parent.visible) r = { mesh: o, root: o.parent.parent, B: o.skeleton.bones }; }); return r; },
  P(v) { const R = document.getElementById('frame').getBoundingClientRect(), p = v.clone().project(A.S().cam), s = window.devicePixelRatio || 1; return [(R.left + (p.x * .5 + .5) * R.width) * s, (R.top + (-p.y * .5 + .5) * R.height) * s]; },
  world: (b, y = 0) => b.localToWorld(A.V(0, y, 0)),
  sideCam(R, d, h, look, lead = 0) { const p = R.root.getWorldPosition(A.V(0, 0, 0)), c = A.S().cam; c.position.set(p.x + lead, p.y + h, p.z + d); c.lookAt(p.x + lead, p.y + look, p.z); c.updateProjectionMatrix(); A.step(0); },
};

function feet() {
  const st = { prints: [], last: null, ratios: [], speeds: [] };
  return {
    step(t, R) {
      A.S().scene.updateMatrixWorld(true);
      const l = A.world(R.B[8], -.445), r = A.world(R.B[10], -.445), root = R.root.getWorldPosition(A.V(0, 0, 0));
      const side = l.y < r.y ? 'L' : 'R', f = side === 'L' ? l : r, prev = st.last;
      let moved = 0, ratio = null;
      if (prev && prev.side === side) {
        moved = Math.hypot(f.x - prev.f.x, f.z - prev.f.z);
        const body = Math.hypot(root.x - prev.root.x, root.z - prev.root.z);
        if (body > 1e-4) ratio = 100 * moved / body;
      }
      if (ratio != null) { st.ratios.push(ratio); if (st.ratios.length > 8) st.ratios.shift(); }
      if (prev && prev.side === side) { st.speeds.push(moved * 30); if (st.speeds.length > 8) st.speeds.shift(); }
      st.last = { f: f.clone(), side, root };
      st.prints.push({ p: f.clone(), side, t }); st.prints = st.prints.filter(q => t - q.t < 2.6);
      return { side, f, moved, l, r, speed: st.speeds.length ? st.speeds.reduce((a, b) => a + b, 0) / st.speeds.length : 0, slip: st.ratios.length ? st.ratios.reduce((a, b) => a + b, 0) / st.ratios.length : 0 };
    },
    dots(t) { return st.prints.map(q => { const [x, y] = A.P(q.p); return { k: 'dot', x, y: y + 6, r: 8, fill: q.side === 'R', o: Math.max(0, 1 - (t - q.t) / 2.6) }; }); },
  };
}

const walk = (rev, run) => {
  let F, R;
  return {
    url: game(rev, 's3'), dur: 14,
    setup() { A.jump('arrive'); A.step(.6); F = feet(); A.key('KeyD', true); if (run) A.key('ShiftLeft', true); A.step(1.2); },
    frame(t) {
      A.step(1 / 30); R = A.runner();
      A.sideCam(R, run ? 5.2 : 4.6, .85, .3, run ? .4 : .2);
      const s = F.step(t, R), [x, y] = A.P(s.f), ann = F.dots(t);
      if (!run) ann.push({ k: 'call', id: s.side, x, y, r: 30, dx: s.side === 'R' ? 190 : -190, dy: s.side === 'R' ? -240 : -330, text: s.speed > .3 ? 'sliding' : 'planted' });
      return { t, slip: +s.slip.toFixed(2), footSpeed: +(s.moved * 30).toFixed(3), ann };
    },
  };
};

const ikClose = () => {
  let F, R;
  return {
    url: game('', 's3'), dur: 10,
    setup() { A.jump('arrive'); A.step(.6); F = feet(); A.key('KeyD', true); A.step(1.2); },
    frame(t) {
      A.step(1 / 30); R = A.runner();
      A.sideCam(R, 3.0, .7, .3, .05);
      const s = F.step(t, R), B = R.B;
      const near = A.world(B[7]).z > A.world(B[9]).z ? [7, 8] : [9, 10];
      const hip = A.P(A.world(B[near[0]])), knee = A.P(A.world(B[near[1]])), foot = A.P(A.world(B[near[1]], -.445));
      const ann = [
        { k: 'line', w: 4, pts: [hip, knee, foot] },
        { k: 'line', w: 3, dash: [14, 10], pts: [hip, foot] },
        { k: 'dot', x: hip[0], y: hip[1], r: 9 }, { k: 'dot', x: knee[0], y: knee[1], r: 9 }, { k: 'dot', x: foot[0], y: foot[1], r: 9 },
        { k: 'call', id: 'knee', x: knee[0], y: knee[1], r: 30, dx: 210, dy: -150, text: 'knee' },
        { k: 'call', id: 'hip', x: hip[0], y: hip[1], r: 30, dx: -210, dy: -170, text: 'hip' },
      ];
      return { t, slip: +s.slip.toFixed(2), ann };
    },
  };
};

const ocean = () => ({
  url: game('', 's0'), dur: 9,
  setup() { A.jump('title'); A.step(1.5); this.ov = document.getElementById('titleOv'); },
  frame(t) {
    const R = document.getElementById('frame').getBoundingClientRect(), x = R.left + R.width * (.25 + .5 * (.5 + .5 * Math.sin(t * .5))), y = R.top + R.height * (.74 + .04 * Math.sin(t * .9));
    if (this.ov) { this.ov.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true })); if (Math.round(t * 30) % 90 === 30) this.ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true })); }
    A.step(1 / 30); return { t };
  },
});

const promo = (video, durs, dur) => ({
  url: game('', 's0'), dur,
  async setup() {
    const st = document.createElement('style'); st.textContent = '#promo, .word { display: none !important; }'; document.head.appendChild(st);
    (0, eval)(await (await fetch('/studio/promo.js')).text());
    __promo.load(video, { silent: true, durs });
  },
  frame(t) { __promo.frame(Math.round(t * 30)); return { t }; },
});

const segStarts = async (id, extra = []) => {
  const vo = await (await fetch(`/videos/${id}/vo.json`)).json();
  let t = 0; const out = [];
  vo.lines.forEach((l, i) => { out.push(t); t += Math.max(0.35 + l.end - l.start + (extra[i] ?? 0.5), 0); });
  return out;
};

const mergeRun = (rev, mode, o = {}) => {
  let order = [], stTime = 0;
  const ptr = (type, v) => { const R = document.getElementById('frame').getBoundingClientRect(), p = v.clone().project(A.S().cam); document.getElementById('copyOv').dispatchEvent(new PointerEvent(type, { clientX: R.left + (p.x * .5 + .5) * R.width, clientY: R.top + (-p.y * .5 + .5) * R.height, bubbles: true, pointerId: 1, button: 0, isPrimary: true })); };
  const ptrF = (type, fx, fy) => { const R = document.getElementById('frame').getBoundingClientRect(); document.getElementById('copyOv').dispatchEvent(new PointerEvent(type, { clientX: R.left + fx * R.width, clientY: R.top + fy * R.height, bubbles: true, pointerId: 1, button: 0, isPrimary: true })); };
  const runners = () => { const out = []; A.S().scene.traverse(o2 => { if (o2.isSkinnedMesh && o2.material.type === 'MeshStandardMaterial' && o2.parent.parent.visible) out.push(o2.parent.parent); }); return out; };
  const at = (t, x) => Math.round(t * 30) === Math.round(x * 30);
  let focus = null;
  const cam = (k = .08) => {
    const rs = runners(); if (!rs.length) return;
    const ctr = rs.reduce((a, r) => a.add(r.position), A.V(0, 0, 0)).multiplyScalar(1 / rs.length);
    focus = focus ? focus.lerp(ctr, k) : ctr.clone();
    const [h, d] = o.cam || [3.2, 11], c = A.S().cam; c.position.set(focus.x, h, focus.z + d); c.lookAt(focus.x, .8, focus.z); c.updateProjectionMatrix();
  };
  const selectAll = () => { ptrF('pointerdown', .02, .02); ptrF('pointermove', .98, .98); ptrF('pointerup', .98, .98); A.step(.05); };
  const copyTo = v => { document.querySelector('#ctx button[data-a="copy"]').click(); A.step(.05); ptr('pointermove', v); A.step(.2); ptr('pointerdown', v); A.step(.5); };
  return {
    url: game(rev, 's2'), dur: o.dur || 14,
    setup() {
      const st = document.createElement('style'); st.textContent = '.word { display: none !important; }'; document.head.appendChild(st);
      A.jump('copy'); A.step(.1); const S = A.S(); if (S.login) S.login(); A.step(.6);
      A.key('KeyW', true); A.step(1 / 30); A.key('KeyW', false); A.step(.3);
      cam(1); A.step(0);
      selectAll(); copyTo(A.V(2, 0, -1)); selectAll(); copyTo(A.V(-1.5, 0, .8)); A.step(.6);
      cam(1); A.step(0); ptr('pointermove', A.V(-2, 0, -1.5)); A.step(.05); order = runners();
    },
    frame(t) {
      const d = o.delay ?? 1, lt = t - d;
      if (at(lt, .15)) A.key('Digit2', true);
      if (lt > .2 && lt < 1.4) { const k = (lt - .2) / 1.2; ptr('pointermove', A.V(-2 + 2.4 * k, 0, -1.5 + 1.9 * k)); }
      if (at(lt, 1.6)) A.key('Digit2', false);
      if (o.wander && lt > 4.5) { const ph = Math.floor((lt - 4.5) / 2.4) % 4, ks = ['KeyD', 'KeyS', 'KeyA', 'KeyW']; ks.forEach((k, i) => A.key(k, i === ph)); }
      A.step(1 / 30); cam(); A.step(0);
      const rs = runners(), ann = [];
      if (mode && rs.length > 1) {
        let tgt;
        if (mode === 'leader') { const L = order.find(r => r.visible) || rs[0]; tgt = L.position; }
        else { tgt = rs.reduce((a, r) => a.add(r.position), A.V(0, 0, 0)).multiplyScalar(1 / rs.length); }
        const T = A.P(tgt.clone().setY(.02));
        for (const r of rs) { const q = A.P(r.position.clone().setY(.02)); if (Math.hypot(q[0] - T[0], q[1] - T[1]) > 40) ann.push({ k: 'line', w: 3, dash: [14, 10], pts: [q, T] }); }
        if (mode === 'leader') { const L = order.find(r => r.visible) || rs[0], h = A.P(L.position.clone().setY(2.25)); ann.push({ k: 'call', id: 'lead', x: h[0], y: h[1], r: 34, dx: 200, dy: -140, text: 'leader' }); }
        else { ann.push({ k: 'dot', x: T[0], y: T[1], r: 10 }); ann.push({ k: 'call', id: 'avg', x: T[0], y: T[1], r: 34, dx: 200, dy: -260, text: 'average' }); }
      }
      return { t, n: rs.length, ann };
    },
  };
};

const siteTour = (rev, plan, o = {}) => ({
  url: (rev ? `/old/${rev}/games/aero/index.html` : '/games/aero/index.html') + '#s0', dur: o.dur || 10, w: 1080, h: 1920, dpr: 2.5, mobile: true,
  async setup() {
    window.requestAnimationFrame = () => 0; document.documentElement.style.scrollBehavior = 'auto';
    this.vids = [...document.querySelectorAll('.clip video')].map(v => { v.pause(); const img = new Image(); img.className = v.className; img.style.cssText = 'width:100%;aspect-ratio:1;display:block;border-radius:6px;box-shadow:0 18px 40px rgba(16,40,110,.35),0 0 0 1px rgba(255,255,255,.6)'; img.dataset.name = v.src.split('/').pop().replace('.mp4', ''); img.src = v.poster; v.replaceWith(img); return img; });
    const top = el => el ? Math.max(0, el.getBoundingClientRect().top + scrollY - 36) : 0, max = document.documentElement.scrollHeight - innerHeight;
    const where = k => k === 'top' ? 0 : k === 'bottom' ? max : typeof k === 'number' ? k * max : top(this.vids[+k.split(':')[1]]);
    this.stops = (typeof plan === 'function' ? await plan() : plan).map(([t, k, move]) => [t, where(k), move ?? 1.3]);
  },
  frame(t) {
    const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u), S = this.stops;
    let y = S[0][1]; for (let i = 1; i < S.length; i++) if (t >= S[i][0]) { const k = ease((t - S[i][0]) / S[i][2]); y = S[i - 1][1] + (S[i][1] - S[i - 1][1]) * k; }
    scrollTo(0, y);
    const f = Math.round(t * 30);
    for (const v of this.vids) { const r = v.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) continue; v.src = `/clips/_sq/${v.dataset.name}/f${String(1 + f % 180).padStart(4, '0')}.jpg`; }
    const fr = document.getElementById('frame'), ov = document.getElementById('titleOv');
    if (fr && ov) { const R = fr.getBoundingClientRect(); if (R.bottom > 0 && R.top < innerHeight) { const x = R.left + R.width * (.3 + .4 * (.5 + .5 * Math.sin(t * .7))), yy = R.top + R.height * .72; ov.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: yy, bubbles: true })); if (f % 75 === 40) ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: yy, bubbles: true })); } }
    if (window.__aeroStep) __aeroStep(1 / 30);
    return { t };
  },
  async after() { await Promise.all(this.vids.map(v => v.decode().catch(() => 0))); },
});

window.CLIP_DEFS = {
  walk_before: walk(OLD_GAIT, false),
  walk_after: walk('', false),
  run_after: walk('', true),
  ik_close: ikClose(),
  ocean: ocean(),

  promo_v1: promo('v1_whole', [6.4, 7.0, 4.3, 4.2, 7.0, 1.7, 1.9, 7.8, 7.2, 1], 49),
  promo_v2: promo('v2_merge', [6.5, 7.3, 3.4, 5.7, 6.3, 1], 30),
  merge_now: mergeRun('', null, { dur: 27, delay: 1, wander: true }),
  merge_old_lead: mergeRun('53a2df9', 'leader', { dur: 8, delay: 1.4 }),
  merge_old_lead2: mergeRun('53a2df9', 'leader', { dur: 8, delay: .8 }),
  merge_avg: mergeRun('', 'avg', { dur: 8, delay: 1.4 }),
  merge_old_split: mergeRun('53a2df9', 'leader', { dur: 8, delay: 1.2 }),
  merge_close: mergeRun('', null, { dur: 7, delay: .5, cam: [2.2, 7] }),
  site_now_top: siteTour('', [[0, 'clip:0'], [.4, 'clip:1', 4]], { dur: 5 }),
  site_v1: siteTour('ac84f9f', [[0, 'top']], { dur: 6 }),
  site_v2: siteTour('a1ed95b', [[0, 'top'], [.8, 'clip:0', 3], [4.4, 'clip:1', 1.4]], { dur: 7 }),
  site_bottom: siteTour('', [[0, 'clip:1'], [.3, 'clip:2', 1.4], [2.2, 'clip:3', 1.4], [4.2, 'bottom', 2]], { dur: 14 }),
  site_tour: siteTour('', async () => { const s = await segStarts('06-site-promo'); return [[0, 'top'], [s[1] + .3, 'clip:0', 4.5], [s[3], 'clip:1'], [s[4], 'clip:2'], [s[5], 'clip:3'], [s[6], 'bottom', 2.2]]; }, { dur: 36 }),
};
window.CLIP_RUN = {
  async start(name) { window.requestAnimationFrame = () => 0; this.d = window.CLIP_DEFS[name]; await this.d.setup(); },
  async frameAsync(f) { const m = this.d.frame(f / 30); if (this.d.after) await this.d.after(); return m; },
  frame(f) { return this.d.frame(f / 30); },
};
})();
