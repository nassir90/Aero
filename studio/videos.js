(() => {
const SCENE = { title: 0, copy: 2, arrive: 3, tape: 4, climb: 7, reveal: 9 };
const release = () => ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'Space', 'Digit1', 'Digit2'].forEach(k => key(k, false));
const drawGame = () => screen(gl());
let mouseF = null;

const titleSea = w => ({ w, scene: SCENE.title,
  frame(S, lt, dt, L) {
    const ov = G.document.getElementById('titleOv'), f = frameEl();
    const hx = f.clientWidth * (.2 + .6 * (lt / L)), hy = f.clientHeight * (.72 + .08 * Math.sin(lt * 2));
    ptr(ov, 'pointermove', hx, hy); mouseF = { x: hx, y: hy };
    for (const at of [.28, .62]) if (lt >= at * L && lt - dt < at * L) ptr(ov, 'pointerdown', hx, hy);
  },
  draw() { drawGame(); plate('AERO', SCR.x + SCR.w / 2, SCR.y + SCR.h * .42, .95); const p = frameToScreen(mouseF.x, mouseF.y); cursor(p.x, p.y); } });

const arrival = (w, opts = {}) => ({ w, scene: SCENE.arrive,
  frame(S, lt, dt, L) {
    if (lt < dt) { key('KeyD', true); if (opts.run) key('ShiftLeft', true); }
    for (const at of (opts.jumps || [.45])) { if (lt >= at * L && lt - dt < at * L) key('Space', true); if (lt >= at * L + .15 && lt - dt < at * L + .15) key('Space', false); }
    if (opts.roll != null && lt >= opts.roll * L && lt - dt < opts.roll * L) { key('KeyD', false); key('ShiftLeft', false); key('Digit1', true); }
    if (opts.roll != null && lt >= opts.roll * L + .1 && lt - dt < opts.roll * L + .1) key('Digit1', false);
    if (lt + dt >= L) release();
  },
  draw: drawGame });

const halcyon = w => ({ w, scene: SCENE.reveal, draw() {
  drawGame();
  X.font = '700 96px Silkscreen'; X.textAlign = 'center'; X.textBaseline = 'top';
  X.fillStyle = '#5b3cff'; X.fillText('HALCYON', W / 2 + 7, SCR.y + 34); X.fillStyle = '#ff5ad6'; X.fillText('HALCYON', W / 2, SCR.y + 30);
  X.font = '400 28px Silkscreen'; X.fillStyle = '#e7dcff'; X.fillText('cloud warden · keeps the lights on', W / 2, SCR.y + 142);
} });

const tape = w => ({ w, scene: SCENE.tape, draw() { screen(G.document.getElementById('tapeCv'), { square: true }); } });

const copyRoutine = w => ({ w, scene: SCENE.copy,
  setup(S) { S.__st = {}; mouseF = null; },
  frame(S, lt, dt, L) {
    const f = lt / L, ov = G.document.getElementById('copyOv'), was = (lt - dt) / L, hit = a => f >= a && was < a;
    const P = (x, y) => worldToFrame(S, x, y, 0), lerp = (a, b, k) => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
    const crew = () => { const xs = []; S.scene.traverse(o => { if (o.isSkinnedMesh && o.material.side !== G.THREE.BackSide && o.parent.parent.visible && o.material.color && o.material.color.getHex() !== 0x5c5b6a) xs.push(o.parent.parent.position.x); }); return xs; };
    const st = S.__st, mv = p => { ptr(ov, 'pointermove', p.x, p.y); mouseF = p; };
    if (f < .04) mouseF = P(-2.9, 3.2);
    if (hit(.04)) { st.a = P(-2.5, 2.65); st.b = P(-.7, -.12); ptr(ov, 'pointerdown', st.a.x, st.a.y); mouseF = st.a; }
    if (f > .04 && f < .17) mv(lerp(st.a, st.b, ease((f - .04) / .13)));
    if (hit(.17)) ptr(ov, 'pointerup', st.b.x, st.b.y);
    if (hit(.22)) { key('KeyC', true, { ctrlKey: true }); key('KeyC', false, { ctrlKey: true }); st.c = mouseF; st.d = P(1.7, 1.2); }
    if (f > .22 && f < .32) mv(lerp(st.c, st.d, ease((f - .22) / .1)));
    if (hit(.34)) { ptr(ov, 'pointerdown', st.d.x, st.d.y); ptr(ov, 'pointerup', st.d.x, st.d.y); }
    if (hit(.40)) key('KeyS', true);
    if (hit(.45)) key('Space', true); if (hit(.47)) key('Space', false);
    if (hit(.51)) key('KeyS', false);
    if (hit(.58)) { const xs = crew(); st.e = P(Math.min(...xs) - .9, 2.75); st.g = P(Math.max(...xs) + .9, -.15); ptr(ov, 'pointerdown', st.e.x, st.e.y); mouseF = st.e; }
    if (f > .58 && f < .66) mv(lerp(st.e, st.g, ease((f - .58) / .08)));
    if (hit(.67)) ptr(ov, 'pointerup', st.g.x, st.g.y);
    if (hit(.70)) { key('KeyX', true, { ctrlKey: true }); key('KeyX', false, { ctrlKey: true }); st.h = mouseF; st.k = P(-1.2, 1.1); }
    if (f > .70 && f < .80) mv(lerp(st.h, st.k, ease((f - .70) / .1)));
    if (hit(.82)) { ptr(ov, 'pointerdown', st.k.x, st.k.y); ptr(ov, 'pointerup', st.k.x, st.k.y); }
    if (hit(.88)) key('Digit2', true); if (hit(.89)) key('Digit2', false);
    if (lt + dt >= L) release();
  },
  draw() { drawGame(); drawMarquee(); drawMenu(); if (mouseF) { const p = frameToScreen(mouseF.x, mouseF.y); cursor(p.x, p.y); } } });

const runnerOrbit = (w, wire) => ({ w, scene: SCENE.copy,
  setup(S) { ptr(G.document.getElementById('copyOv'), 'pointerdown', 5, 5); ptr(G.document.getElementById('copyOv'), 'pointerup', 6, 6);
    S.scene.traverse(o => { if (o.isSkinnedMesh) { o.material.wireframe = !!wire; } }); },
  frame(S, lt, dt, L) {
    let lead = null; S.scene.traverse(o => { if (!lead && o.isSkinnedMesh) lead = o.parent.parent; });
    const p = lead.position, a = -.9 + lt * .45, r = wire ? 3.1 : 3.6;
    S.cam.position.set(p.x + Math.sin(a) * r, 1.35, p.z + Math.cos(a) * r); S.cam.lookAt(p.x, 1.05, p.z);
    if (lt + dt >= L) { S.scene.traverse(o => { if (o.isSkinnedMesh) o.material.wireframe = false; }); S.cam.position.set(0, 2.2, 9); S.cam.lookAt(0, 1.1, 0); }
  },
  draw() { drawGame(); if (wire) { X.font = '700 30px Silkscreen'; X.fillStyle = C.cyan; X.textAlign = 'left'; X.textBaseline = 'top'; X.fillText('1 mesh · 11 bones', SCR.x + 24, SCR.y + SCR.h - 60); } } });

const pixelZoom = w => ({ w, scene: SCENE.arrive,
  frame(S, lt, dt, L) { if (lt < dt) key('KeyD', true); if (lt + dt >= L) release(); },
  draw(S, lt, dt, L) {
    const k = ease((lt / L - .25) / .5), ww = 400 + (SCR.w - 400) * k, hh = ww * .75, x = W / 2 - ww / 2, y = SCR.y + SCR.h / 2 - hh / 2;
    screen(gl(), { rect: { x, y, w: ww, h: hh } });
    X.font = '700 40px Silkscreen'; X.fillStyle = C.cyan; X.textAlign = 'center'; X.textBaseline = 'top';
    X.fillText(k < .5 ? '400 × 300' : 'hard pixels, scaled up', W / 2, y + hh + 24);
  } });

const climb = (w, mode) => ({ w, scene: SCENE.climb,
  setup(S) {
    S.reset(); const A = G.__aero, B = A.boxes; A.yaw = 0; S.__st = { i: 0, jumped: false };
    if (mode === 'throw') { const b = B[2]; A.pos.set(b.x, b.top + .01, b.z); S.__st.i = 2; }
    if (mode === 'late') { const b = B[5]; A.pos.set(b.x, b.top + .01, b.z); S.__st.i = 5; }
    if (mode === 'pipe') { for (const bi of [3, 6, 9, 12]) { const b = B[bi]; A.pos.set(b.x + (bi === 12 ? -2 : 0), b.top + .01, b.z); A.vel.set(0, 0, 0); A.sim(.35, {}); }
      const L = B[12]; A.pos.set(L.x, L.top + .01, L.z + 1.5); A.vel.set(0, 0, 0); S.__st.i = 99; }
    if (mode === 'orbit') { const b = B[0]; A.pos.set(b.x, b.top + .01, b.z); }
    if (mode === 'roll') { const b = B[0]; A.pos.set(b.x - 3.4, b.top + .01, b.z + 2); S.__st.i = 99; }
    A.vel.set(0, 0, 0);
  },
  frame(S, lt, dt, L) {
    const A = G.__aero, K = A.keys;
    if (mode === 'orbit') { K.f = K.b = K.l = K.r = K.j = false; return; }
    if (mode === 'roll') { K.f = K.b = K.l = K.j = false; K.r = lt < .22 * L; if (lt >= .3 * L && lt - dt < .3 * L) key('Digit1', true); if (lt >= .3 * L + .1 && lt - dt < .3 * L + .1) key('Digit1', false); if (lt + dt >= L) release(); return; }
    if (mode === 'pipe') { const B = A.boxes, Lb = B[12], mx = Lb.x + 2.4, mz = Lb.z - 2.4, dx = mx - A.pos.x, dz = mz - A.pos.z;
      const far = Math.hypot(dx, dz) > .3 && !A.piping; K.r = far && dx > .15; K.l = far && dx < -.15; K.b = far && dz > .15; K.f = far && dz < -.15; K.j = false; return; }
    if (mode === 'throw' && lt >= .25 * L && lt - dt < .25 * L) { K.f = K.b = K.l = K.r = K.j = false; key('Digit2', true); S.__st.throwAt = lt; S.__st.i = 3; return; }
    if (S.__st.throwAt != null && lt - S.__st.throwAt < 1.8) { if (lt - S.__st.throwAt > .1) key('Digit2', false); return; }
    climbBot(S, S.__st);
    if (lt + dt >= L) { K.f = K.b = K.l = K.r = K.j = false; release(); }
  },
  draw(S, lt) {
    if (mode === 'orbit') { const A = G.__aero, a = lt * .25; S.cam.position.set(A.pos.x + Math.sin(a) * 22, A.pos.y + 16, A.pos.z - 24 + Math.cos(a) * 22); S.cam.lookAt(0, 5, -26); step(0); }
    drawGame();
  } });

const rings = w => ({ w, scene: SCENE.climb,
  setup(S) { S.reset(); const A = G.__aero, b = A.boxes[3]; A.pos.set(b.x, b.top + .01, b.z); A.vel.set(0, 0, 0); },
  frame(S) { const K = G.__aero.keys; K.f = K.b = K.l = K.r = K.j = false; },
  draw(S, lt) { const b = G.__aero.boxes[6], a = lt * .5; S.cam.position.set(b.x + Math.sin(a) * 5, b.top + 3.2, b.z + Math.cos(a) * 5); S.cam.lookAt(b.x, b.top, b.z); step(0); drawGame(); } });

const code = (w, names, title, extra) => { let F, lines; return { w, tint: '#171236',
  init() { lines = codeLines(names); F = makeField(codeLines(['function runnerSDF', 'function headTravel', 'function platform', 'function walker', 'function animateRunner'])); },
  draw(S, lt, dt, L) { field(F, lt, dt, 1.2); codePanel(lines, lt, SCR.x, SCR.y, SCR.w, SCR.h, title, 320); if (extra) extra(lt, L); } }; };

const shots = (w, list) => ({ w, draw(S, lt, dt, L) { const n = list.length, i = Math.min(n - 1, Math.floor(lt / L * n)), s = list[i]; shotFrame(IMG[s.img], s.label, (lt - i * L / n) / (L / n), s.stamp, s.color); } });

const measure = w => { let F; return { w, tint: '#10202a', init() { F = makeField(['0.330', '0.380', 'spread', 'width', 'depth', '0.160', '0.162', '1.36', '0.96']); },
  draw(S, lt, dt, L) { field(F, lt, dt, .6); table([
    { text: 'height   before   after' }, { text: 'y 0.96   0.380    0.330' }, { text: 'y 1.00   0.379    0.330' }, { text: 'y 1.08   0.339    0.330' },
    { text: 'y 1.20   0.330    0.330' }, { text: 'y 1.32   0.330    0.330' }, { text: 'spread   0.050 -> 0.000', hot: true }, { text: '24 settings tried, 1 kept', hot: true }], lt, 70, SCR.y, 'TORSO WIDTH, MEASURED'); } }; };

const card = (w, lines, sub) => { let F; return { w, tint: '#1b1240', noKicker: true, init() { F = makeField(['0', '1', '01', '10', '0110', '1001']); },
  draw(S, lt, dt, L) { field(F, lt, dt, 1.6); const k = ease(lt / .5), y0 = H * .34 - (lines.length - 1) * 69; X.globalAlpha = k; bigText(lines, y0, 120, C.ink);
    if (sub) { X.font = '600 44px "Open Sans"'; X.fillStyle = C.lilac; X.textAlign = 'center'; wrap(sub, 900).forEach((l, i) => X.fillText(l, W / 2, y0 + (lines.length - 1) * 138 + 150 + i * 58)); }
    X.globalAlpha = 1; } }; };

const chat = w => ({ w, tint: '#171236', draw(S, lt, dt, L) {
  const notes = ['"The torso is too slender."', '"The armpit stretches."', '"That menu covers too much."', '"The head drifts too far back."'];
  const n = Math.min(notes.length, Math.floor(lt / L * (notes.length + 1)) + 1);
  X.font = '600 44px "Open Sans"'; X.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const y = SCR.y + 40 + i * 170, a = Math.min(1, (lt - i * L / (notes.length + 1)) * 4); X.globalAlpha = Math.max(0, a);
    X.fillStyle = 'rgba(185,176,255,.95)'; X.beginPath(); X.roundRect(80, y, 700, 110, 28); X.fill();
    X.fillStyle = '#16123a'; X.textAlign = 'left'; X.fillText(notes[i], 116, y + 56);
    X.fillStyle = '#7fe8ff'; X.font = '700 34px Silkscreen'; X.fillText('fixed', 820, y + 56); X.font = '600 44px "Open Sans"';
    X.globalAlpha = 1;
  }
} });

const end = (w, sub, small) => { let F; return { w, tint: '#1b1240', noCaps: true, init() { F = makeField(['0', '1', '01', '10']); },
  draw(S, lt, dt, L) { field(F, lt, dt, .8); const k = ease(lt / .6); X.globalAlpha = k; plate('AERO', W / 2, H * .42, 1.3);
    X.font = '600 48px "Open Sans"'; X.fillStyle = C.ink; X.textAlign = 'center'; X.textBaseline = 'middle'; wrap(sub, 900).forEach((l, i) => X.fillText(l, W / 2, H * .55 + i * 62));
    if (small) { X.font = '400 30px Silkscreen'; X.fillStyle = C.dim; X.fillText(small, W / 2, H * .66); } X.globalAlpha = 1; } }; };

window.VIDEOS = {
  dev1_body: { label: 'DEV LOG 01 · THE BODY', kicker: 'a body made of math', segs: () => [
    code(4, ['function runnerSDF', 'function roundCone'], 'runnerSDF()  a body made of math'),
    runnerOrbit(4, false), runnerOrbit(3.5, true), pixelZoom(3),
    shots(4, [{ img: 'v05_capsules', label: 'v5 · stacked capsules' }, { img: 'v06_lumpy', label: 'v6 · smooth, but lumpy' }, { img: 'v07_plain', label: 'v7 · plain' }, { img: 'v08_straight', label: 'v8 · measured' }]),
    measure(4), end(2.2, 'dev log 01 · a body made of math', 'built with Opus 5.5')] },
  dev2_world: { label: 'DEV LOG 02 · THE SKY', kicker: 'building the sky', segs: () => [
    code(3, ['function platform', 'function squareRing'], 'platform()  pillars that fade to white'),
    climb(3.5, 'orbit'), rings(3), titleSea(3.5), climb(3, 'roll'), climb(3.5, 'throw'),
    end(2.2, 'dev log 02 · building the sky', 'built with Opus 5.5')] },
  promo1_login: { label: 'LOG IN', kicker: 'log in', segs: () => [titleSea(3), arrival(3, { jumps: [.5] }), halcyon(3), tape(2.2), end(2, 'a network nobody logged out of', 'playable in your browser')] },
  promo2_copy: { label: 'COPY YOURSELF', kicker: 'copy yourself', segs: () => [copyRoutine(12.8), end(2, 'copy yourself. cut the crew.', 'playable in your browser')] },
  promo3_climb: { label: 'THE CLIMB', kicker: 'the climb', segs: () => [climb(4, 'run'), climb(3.2, 'throw'), climb(4, 'pipe'), end(2, 'find the four memories', 'playable in your browser')] },
  cooked1_how: { label: 'ARE GAMEDEVS COOKED? 1/2', kicker: 'are gamedevs cooked?', segs: () => [
    card(2.6, ['ARE', 'GAMEDEVS', 'COOKED?']),
    card(3.2, ['ONE', 'SESSION'], 'input: one 45-second reference reel. instruction: transfer the style, not the content.'),
    shots(4.6, [{ img: 'v01_start', label: 'v1', stamp: 'FLAT' }, { img: 'v01_level', label: 'v1', stamp: 'IMAGES' }, { img: 'v02_level', label: 'v2', stamp: 'MISSED' }]),
    code(3.6, ['function makeRunner', 'function buildClimb'], 'rebuilt as real 3D'),
    shots(4, [{ img: 'v05_capsules', label: 'v5' }, { img: 'v06_lumpy', label: 'v6' }, { img: 'v08_straight', label: 'v8', stamp: 'MEASURED', color: '#7fe8ff' }]),
    measure(3.4), climb(5, 'run'), end(2.2, 'sixteen versions. one session.', 'made with Opus 5.5')] },
  cooked2_who: { label: 'ARE GAMEDEVS COOKED? 2/2', kicker: 'are gamedevs cooked?', segs: () => [
    card(2.6, ['WHO', 'MADE', 'IT?']),
    code(4, ['function buildCopy', 'function headTravel'], 'the model wrote every line', (lt) => {
      const n = (SRC.match(/\n/g) || []).length; X.font = '700 44px Silkscreen'; X.fillStyle = C.cyan; X.textAlign = 'right'; X.textBaseline = 'bottom';
      X.fillText(Math.min(n, Math.round(lt * 500)) + ' lines', SCR.x + SCR.w - 24, SCR.y + SCR.h - 20); }),
    chat(7.5), climb(3, 'run'), climb(3, 'throw'),
    end(3, "gamedevs aren't cooked. the job changed shape.", 'made with Opus 5.5')] },
};
window.renderVideo = async (name, voDur) => {
  const v = VIDEOS[name], segs = v.segs(), D = voDur + .4 + 1.4; window.KICKER = v.kicker || '';
  const vo = (await fetch('../videos/scripts.json').then(r => r.json()).catch(() => null)) || {};
  return render(name, D, segs, (window.SCRIPTS && SCRIPTS[name]) || '', v.label, voDur, .4);
};
})();
