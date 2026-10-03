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

window.CLIP_DEFS = {
  walk_before: walk(OLD_GAIT, false),
  walk_after: walk('', false),
  run_after: walk('', true),
  ik_close: ikClose(),
  ocean: ocean(),
};
window.CLIP_RUN = {
  start(name) { window.requestAnimationFrame = () => 0; this.d = window.CLIP_DEFS[name]; this.d.setup(); },
  frame(f) { return this.d.frame(f / 30); },
};
})();
