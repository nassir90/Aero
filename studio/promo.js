(() => {
const FPS = 30, V = (x, y, z) => new THREE.Vector3(x, y, z);
const fr = document.getElementById('frame');
const css = document.createElement('style');
css.textContent = `
#promo { position: absolute; inset: 0; pointer-events: none; z-index: 60; }
#promo .pr-hook { position: absolute; left: 6%; right: 6%; top: 8%; text-align: center; font: 700 2.5em/1.18 Silkscreen, monospace; color: #fff; text-shadow: 0 .1em 0 #2f34c9, 0 0 .45em rgba(10,8,40,.65); text-wrap: balance; }
#promo .pr-cap { position: absolute; left: 7%; right: 7%; top: 64%; text-align: center; text-wrap: balance; }
#promo .pr-cap span { display: inline; font: 800 1.7em/1.45 'Open Sans', sans-serif; color: #fff; background: rgba(14,12,40,.62); padding: .12em .45em; box-decoration-break: clone; -webkit-box-decoration-break: clone; border-radius: .25em; }
#promo .pr-card { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 0 10%; background: #1d1c22; color: #eeedf1; text-align: center; font: 600 2.6em/1.3 'Open Sans', sans-serif; text-wrap: balance; }
#promo .pr-end { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .7em; background: rgba(18,14,52,.6); text-align: center; }
#promo .pr-end b { font: 700 6.4em/1 Silkscreen, monospace; color: #f2f1f6; text-shadow: 0 .1em 0 #2f34c9; letter-spacing: .04em; }
#promo .pr-end p { margin: 0; font: 700 1.5em/1.2 Silkscreen, monospace; color: #fff; }
#promo .pr-end .pr-url { font: 700 1.9em/1 Silkscreen, monospace; color: #fff; background: #2f34c9; padding: .35em .6em; }
.shape-square #promo .pr-hook { top: 6%; font-size: 2.1em; }
.shape-square #promo .pr-end b { font-size: 5em; }
`;
document.head.appendChild(css);
const layer = document.createElement('div'); layer.id = 'promo'; fr.appendChild(layer);
const el = (cls, html) => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; return d; };

const SC = id => __aeroSceneAt(id);
const go = id => __aeroJump(SC(id));
const act = () => __aeroActive();
const step = s => __aeroStep(s);
const key = (code, down) => dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true }));
const tap = code => { key(code, true); step(1 / 30); key(code, false); };
const rect = () => fr.getBoundingClientRect();
const atW = v => { const R = rect(), p = v.clone().project(act().cam); return { clientX: R.left + (p.x * .5 + .5) * R.width, clientY: R.top + (-p.y * .5 + .5) * R.height }; };
const atF = (fx, fy) => { const R = rect(); return { clientX: R.left + fx * R.width, clientY: R.top + fy * R.height }; };
const ptr = (target, type, pos) => target.dispatchEvent(new PointerEvent(type, { ...pos, bubbles: true, pointerId: 1, button: 0 }));
const gl = () => document.getElementById('gl');
const ov = () => document.getElementById('copyOv');
const lerp = (a, b, k) => a + (b - a) * k;

const copyScene = {
  fresh() { go('copy'); const S = act(); step(.1); if (S.login) S.login(); step(.6); tap('KeyW'); step(.3); },
  selectAll() { ptr(ov(), 'pointerdown', atF(.02, .02)); ptr(ov(), 'pointermove', atF(.98, .98)); ptr(ov(), 'pointerup', atF(.98, .98)); step(.05); },
  copyTo(v) { document.querySelector('#ctx button[data-a="copy"]').click(); step(.05); ptr(ov(), 'pointermove', atW(v)); step(.2); ptr(ov(), 'pointerdown', atW(v)); step(.5); },
  crewOf4() { this.selectAll(); this.copyTo(V(2, 0, -1)); this.selectAll(); this.copyTo(V(-1.5, 0, .8)); step(.6); },
};
const at = (lt, t) => Math.round(lt * FPS) === Math.round(t * FPS);
const dragSelect = (lt, t0, t1, a, b) => {
  if (at(lt, t0)) ptr(ov(), 'pointerdown', atF(a[0], a[1]));
  if (lt > t0 && lt < t1 && !at(lt, t0) && !at(lt, t1)) { const k = (lt - t0) / (t1 - t0); ptr(ov(), 'pointermove', atF(lerp(a[0], b[0], k), lerp(a[1], b[1], k))); }
  if (at(lt, t1)) ptr(ov(), 'pointerup', atF(b[0], b[1]));
};

const climbSetup = (x, z, yaw, fov = 50) => {
  go('climb'); const S = act(); S.reset(); S.cam.fov = fov; S.cam.updateProjectionMatrix(); step(.2);
  const A = __aero; A.pos.set(x, 0, z); A.vel.set(0, 0, 0); A.yaw = yaw; step(1);
};

const SEG = {
  climbHook: { dur: 4.3, vo: 'v1_1', hook: 'you can throw your own head',
    setup() { climbSetup(0, 1.5, .35); tap('Digit2'); step(.3); } },
  titleDrop: (dur, vo, cap, plate = true) => ({ dur, vo, cap,
    setup() {
      go('title'); const c = act().cam; c.position.set(0, 6.2, 11.5); c.lookAt(0, -.5, -4);
      document.querySelector('#titleOv .plate').style.visibility = plate ? '' : 'hidden'; step(1.2);
      if (plate) { this.drop(.5, .54); step(.45); } else { this.pts = [V(0, 0, 5), V(-1.6, 0, 5.8), V(1.5, 0, 4.6), V(.2, 0, 6.4)]; this.drop(this.pts[0]); step(.45); }
    },
    drop(a, b) { ptr(document.getElementById('titleOv'), 'pointerdown', a.isVector3 ? atW(a) : atF(a, b)); },
    tick(lt) { const p = this.pts || [[.5, .54], [.3, .56], [.7, .53], [.46, .57]]; const d = q => q.isVector3 ? this.drop(q) : this.drop(...q); if (at(lt, 1.5)) d(p[1]); if (at(lt, 3.1)) d(p[2]); if (at(lt, 4.6)) d(p[3]); },
    done() { const c = act().cam; c.position.set(0, 8.5, 15); c.lookAt(0, -1, -10); document.querySelector('#titleOv .plate').style.visibility = ''; } }),
  card: (dur, vo, text) => ({ dur, vo, card: text, setup() {} }),
  copyLogin: { dur: 3.0, vo: 'v1_4',
    setup() { go('copy'); step(.1); },
    tick(lt) {
      const S = act();
      if (at(lt, .05) && S.login) S.login();
      if (at(lt, .55)) tap('KeyW');
      dragSelect(lt, .7, 1.3, [.12, .2], [.88, .86]);
      if (at(lt, 1.5)) document.querySelector('#ctx button[data-a="copy"]').click();
      if (lt > 1.55 && lt < 2.4) ptr(ov(), 'pointermove', atW(V(lerp(-1.6, 1.8, (lt - 1.55) / .85), 0, .6)));
      if (at(lt, 2.4)) ptr(ov(), 'pointerdown', atW(V(1.8, 0, .6)));
    } },
  arrival: (dur, vo, cap) => ({ dur, vo, cap,
    setup() { go('arrive'); step(.4); key('ShiftLeft', true); key('KeyD', true); step(.3); },
    done() { key('KeyD', false); key('ShiftLeft', false); } }),
  lake: { dur: .9, vo: 'v1_6', setup() { go('tape'); step(.3); } },
  player: { dur: 1.2, setup() { go('player'); step(.4); } },
  climbPipe: { dur: 5.3, vo: 'v1_7',
    setup() { const A = () => __aero; climbSetup(0, 0, .7); const L = A().boxes[12], M = A().mouth; A().pos.set(M.x + .2, L.top + .01, M.z + 3.2); A().vel.set(0, 0, 0); A().collectAll(); step(1.2); },
    tick(lt) {
      const A = __aero, L = A.boxes[12], M = A.mouth;
      if (at(lt, .2)) { ptr(gl(), 'pointermove', atW(V(M.x + 1.5, L.top, M.z + 1))); key('Digit1', true); }
      if (lt > .3 && lt < 1.1) ptr(gl(), 'pointermove', atW(V(lerp(M.x + 1.5, M.x, (lt - .3) / .8), L.top, M.z - .5)));
      if (at(lt, 1.2)) key('Digit1', false);
    } },
  halcyon: (dur, vo, cap) => ({ dur, vo, cap, setup() { go('reveal'); step(.6); } }),
  end: (dur, vo) => ({ dur, vo, end: true,
    setup() { go('title'); step(1); document.getElementById('titleOv').style.visibility = 'hidden'; },
    done() { document.getElementById('titleOv').style.visibility = ''; } }),

  mergeHook: (dur, vo, hook) => ({ dur, vo, hook,
    setup() { copyScene.fresh(); copyScene.crewOf4(); ptr(ov(), 'pointermove', atW(V(-1, 0, -1))); step(.05); key('Digit2', true); step(.05); },
    tick(lt) {
      if (lt < .6) ptr(ov(), 'pointermove', atW(V(lerp(-1, .4, lt / .6), 0, lerp(-1, .4, lt / .6))));
      if (at(lt, .75)) key('Digit2', false);
    } }),
  copyTwice: { dur: 4.3, vo: 'v2_2',
    setup() {},
    tick(lt) {
      dragSelect(lt, .15, .7, [.05, .1], [.95, .9]);
      if (at(lt, .85)) document.querySelector('#ctx button[data-a="copy"]').click();
      if (lt > .9 && lt < 1.55) ptr(ov(), 'pointermove', atW(V(lerp(0, 2, (lt - .9) / .65), 0, lerp(0, -1, (lt - .9) / .65))));
      if (at(lt, 1.6)) ptr(ov(), 'pointerdown', atW(V(2, 0, -1)));
      dragSelect(lt, 1.9, 2.5, [.03, .05], [.97, .95]);
      if (at(lt, 2.65)) document.querySelector('#ctx button[data-a="copy"]').click();
      if (lt > 2.7 && lt < 3.35) ptr(ov(), 'pointermove', atW(V(lerp(0, -1.6, (lt - 2.7) / .65), 0, lerp(0, .9, (lt - 2.7) / .65))));
      if (at(lt, 3.4)) ptr(ov(), 'pointerdown', atW(V(-1.6, 0, .9)));
    } },
  aimConverge: { dur: 2.7, vo: 'v2_3',
    setup() { ptr(ov(), 'pointermove', atW(V(-2, 0, -1.5))); step(.05); key('Digit2', true); step(.05); },
    tick(lt) { ptr(ov(), 'pointermove', atW(V(lerp(-2, .6, Math.min(1, lt / 1.6)), 0, lerp(-1.5, .3, Math.min(1, lt / 1.6))))); } },
  mergeRelease: { dur: 4.3, vo: 'v2_4',
    setup() {}, tick(lt) { if (at(lt, .05)) key('Digit2', false); } },
  formation: { dur: 3.6, vo: 'v2_5',
    setup() { copyScene.crewOf4(); ptr(ov(), 'pointermove', atW(V(0, 0, 0))); step(.05); },
    tick(lt) {
      if (at(lt, .1)) { key('ShiftLeft', true); key('Digit2', true); }
      if (lt > .2 && lt < 1.3) ptr(ov(), 'pointermove', atW(V(lerp(0, -1.4, (lt - .2) / 1.1), 0, lerp(0, -.8, (lt - .2) / 1.1))));
      if (at(lt, 1.5)) { key('Digit2', false); key('ShiftLeft', false); }
    } },

  sqMerge: { dur: 6,
    setup() { copyScene.fresh(); const c = act().cam; c.fov = 34; c.updateProjectionMatrix(); copyScene.crewOf4(); ptr(ov(), 'pointermove', atW(V(-2, 0, -1.5))); step(.05); },
    tick(lt) {
      if (at(lt, .3)) key('Digit2', true);
      if (lt > .35 && lt < 1.8) ptr(ov(), 'pointermove', atW(V(lerp(-2, .4, (lt - .35) / 1.45), 0, lerp(-1.5, .4, (lt - .35) / 1.45))));
      if (at(lt, 2.1)) key('Digit2', false);
    } },
  sqClimb: { dur: 6,
    setup() { climbSetup(0, 1.5, .35, 40); },
    tick(lt) {
      const B = __aero.boxes;
      if (at(lt, .3)) { ptr(gl(), 'pointermove', atW(V(B[0].x - 1, B[0].top, B[0].z))); key('Digit2', true); }
      if (lt > .4 && lt < 1.4) ptr(gl(), 'pointermove', atW(V(lerp(B[0].x - 1, B[1].x, (lt - .4)), B[1].top, lerp(B[0].z, B[1].z, (lt - .4)))));
      if (at(lt, 1.6)) key('Digit2', false);
      if (at(lt, 3.6)) tap('Digit2');
    } },
};

const VIDEOS = {
  v1_whole: [SEG.climbHook, SEG.titleDrop(3.2, 'v1_2'), SEG.card(2.6, 'v1_3', 'Did anyone ever log out?'), SEG.copyLogin,
    SEG.arrival(3.7, 'v1_5'), SEG.lake, SEG.player, SEG.climbPipe, SEG.halcyon(2.4, 'v1_8'), SEG.end(6.8, 'end')],
  v2_merge: [SEG.mergeHook(3.4, 'v2_1', '4 of me → 1 of me'), SEG.copyTwice, SEG.aimConverge, SEG.mergeRelease, SEG.formation, SEG.end(6.8, 'end')],
  sq_sea: [SEG.titleDrop(6, null, null, false), SEG.end(2.2)],
  sq_merge: [SEG.sqMerge, SEG.end(2.2)],
  sq_arrival: [SEG.arrival(6), SEG.end(2.2)],
  sq_climb: [SEG.sqClimb, SEG.end(2.2)],
};
const CAPS = { v1_1: 'In Aero, your head is the most useful thing you own.', v1_2: 'It starts in a sea of ones and zeros.', v1_4: 'You log in, and copy yourself.',
  v1_5: 'Walk a glass path past places you forgot.', v1_6: 'Play back a memory.', v1_7: 'Then climb. Find four memories, and roll your head home.',
  v1_8: 'Someone kept the lights on.', v2_1: 'Four of me. Watch this.', v2_2: 'Copy yourself. Paste. Now there are four of you.',
  v2_3: 'Throw every head at the same spot,', v2_4: 'and the bodies grow back, lock into step, and merge.', v2_5: 'Hold Shift, and the crew keeps its formation.' };

let segs = [], cur = -1, starts = [];
window.__promo = {
  load(name, opts = {}) {
    window.requestAnimationFrame = () => 0;
    segs = VIDEOS[name]; starts = []; let t = 0;
    for (const s of segs) { starts.push(t); t += s.dur; }
    cur = -1; this.silent = !!opts.silent;
    return { frames: Math.round(t * FPS), timeline: segs.map((s, i) => ({ start: starts[i], dur: s.dur, vo: s.vo || null })) };
  },
  frame(i) {
    const t = i / FPS; let k = segs.length - 1; while (k > 0 && starts[k] > t + 1e-6) k--;
    const s = segs[k];
    if (k !== cur) {
      if (cur >= 0 && segs[cur].done) segs[cur].done();
      cur = k; s.setup();
      layer.innerHTML = '';
      if (s.card) layer.appendChild(el('pr-card', s.card));
      if (s.hook) layer.appendChild(el('pr-hook', s.hook));
      const capText = s.cap || (!this.silent && s.vo && CAPS[s.vo]);
      if (capText) layer.appendChild(el('pr-cap', `<span>${capText}</span>`));
      if (s.end) layer.appendChild(el('pr-end', '<b>AERO</b><p>you can play it at</p><div class="pr-url">mpts.ie/games/aero</div>'));
    }
    const lt = Math.round((t - starts[k]) * FPS) / FPS;
    if (s.tick) s.tick(lt);
    step(1 / FPS);
  },
};
})();
