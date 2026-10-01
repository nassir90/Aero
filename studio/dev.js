(() => {
const W = 1080, H = 1920, FPS = 30;
const cv = document.getElementById('out'), X = cv.getContext('2d');
const C = { bg: '#0a1230', grid: 'rgba(120,170,255,.08)', grid2: 'rgba(120,170,255,.2)', ink: '#eef2ff', dim: '#8fa3d6', cyan: '#7fe8ff', pink: '#ff5ad6', lime: '#b6ff6a', red: '#ff4d6d', yellow: '#ffd84d', blue: '#2f34c9', panel: 'rgba(8,14,40,.9)', line: 'rgba(127,232,255,.55)' };
const TOP = { x: 40, y: 250, w: 1000, h: 700 }, BOT = { x: 40, y: 990, w: 1000, h: 520 };
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const pop = u => u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2);
const lerp = (a, b, k) => a + (b - a) * k;
const at = (lt, x) => Math.round(lt * FPS) === Math.round(x * FPS);
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });

function makeGame(url, slot) {
  return new Promise(res => {
    const f = document.createElement('iframe'); f.style.left = (slot * 20) + 'px'; f.src = url; document.body.appendChild(f);
    f.onload = async () => {
      const Wn = f.contentWindow;
      for (let i = 0; i < 100 && !Wn.__aeroStep; i++) await new Promise(r => setTimeout(r, 50));
      await new Promise(r => setTimeout(r, 1200));
      Wn.requestAnimationFrame = () => 0;
      const g = {
        W: Wn, doc: Wn.document, T: Wn.THREE,
        step: dt => Wn.__aeroStep(dt), S: () => Wn.__aeroActive(), jump: n => Wn.__aeroJump(Wn.__aeroSceneAt(n)),
        key: (code, down) => Wn.dispatchEvent(new Wn.KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true })),
        gl: () => Wn.document.getElementById('gl'),
        V: (x, y, z) => new Wn.THREE.Vector3(x, y, z),
        runners() { const out = []; this.S().scene.traverse(o => { if (o.isSkinnedMesh && o.material.type === 'MeshStandardMaterial' && o.parent.parent.visible) out.push({ mesh: o, root: o.parent.parent, B: o.skeleton.bones }); }); return out; },
        rect() { return Wn.document.getElementById('frame').getBoundingClientRect(); },
        atW(v) { const R = this.rect(), p = v.clone().project(this.S().cam); return { clientX: R.left + (p.x * .5 + .5) * R.width, clientY: R.top + (-p.y * .5 + .5) * R.height }; },
        atF(fx, fy) { const R = this.rect(); return { clientX: R.left + fx * R.width, clientY: R.top + fy * R.height }; },
        ptr(type, pos, el) { (el || Wn.document.getElementById('copyOv')).dispatchEvent(new Wn.PointerEvent(type, { ...pos, bubbles: true, pointerId: 1, button: 0, isPrimary: true })); },
        tap(code) { this.key(code, true); this.step(1 / 30); this.key(code, false); },
        wire(on) { this.S().scene.traverse(o => { if (!o.isSkinnedMesh) return; if (o.material.type === 'MeshStandardMaterial') { o.material.transparent = on; o.material.opacity = on ? .25 : 1; o.material.depthWrite = !on; o.material.needsUpdate = true; } else { if (on) { o.userData.wv = o.visible; o.visible = false; } else if (o.userData.wv != null) o.visible = o.userData.wv; } }); },
        login() { this.jump('copy'); this.step(.1); const S = this.S(); if (S.login) S.login(); this.step(.6); this.tap('KeyW'); this.step(.3); },
        selectAll() { this.ptr('pointerdown', this.atF(.02, .02)); this.ptr('pointermove', this.atF(.98, .98)); this.ptr('pointerup', this.atF(.98, .98)); this.step(.05); },
        copyTo(v) { Wn.document.querySelector('#ctx button[data-a="copy"]').click(); this.step(.05); this.ptr('pointermove', this.atW(v)); this.step(.2); this.ptr('pointerdown', this.atW(v)); this.step(.5); },
        crew4() { this.selectAll(); this.copyTo(this.V(2, 0, -1)); this.selectAll(); this.copyTo(this.V(-1.5, 0, .8)); this.step(.6); },
        fov(f) { const c = this.S().cam; c.fov = f; c.updateProjectionMatrix(); },
      };
      res(g);
    };
  });
}

function bg(t) {
  X.fillStyle = C.bg; X.fillRect(0, 0, W, H);
  const g = X.createRadialGradient(W / 2, H * .4, 80, W / 2, H * .4, H * .9); g.addColorStop(0, 'rgba(47,52,201,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); X.fillStyle = g; X.fillRect(0, 0, W, H);
  const o = (t * 18) % 60; X.lineWidth = 1;
  for (let x = -60 + o; x < W + 60; x += 60) { X.strokeStyle = Math.round((x - o) / 60) % 5 ? C.grid : C.grid2; X.beginPath(); X.moveTo(x, 0); X.lineTo(x, H); X.stroke(); }
  for (let y = -60 + o; y < H + 60; y += 60) { X.strokeStyle = Math.round((y - o) / 60) % 5 ? C.grid : C.grid2; X.beginPath(); X.moveTo(0, y); X.lineTo(W, y); X.stroke(); }
}
function header(label, t) {
  X.textBaseline = 'middle'; X.textAlign = 'left';
  X.fillStyle = '#f2f1f6'; X.fillRect(40, 70, 210, 76); X.font = '700 48px Silkscreen'; X.fillStyle = C.blue; X.fillText('AERO', 62, 112);
  X.font = '700 30px Silkscreen'; X.fillStyle = C.cyan; X.fillText('DEV LOG', 280, 92);
  X.font = '700 36px Silkscreen'; X.fillStyle = C.ink; X.fillText(label, 280, 132);
  X.fillStyle = C.cyan; X.fillRect(40, 168, 140 + 60 * Math.sin(t * 2), 5);
}
function corners(r, col = C.cyan) {
  X.strokeStyle = col; X.lineWidth = 4; const L = 26;
  for (const [x, y, dx, dy] of [[r.x, r.y, 1, 1], [r.x + r.w, r.y, -1, 1], [r.x, r.y + r.h, 1, -1], [r.x + r.w, r.y + r.h, -1, -1]]) { X.beginPath(); X.moveTo(x + dx * L, y); X.lineTo(x, y); X.lineTo(x, y + dy * L); X.stroke(); }
}
function panel(r, title, col = C.cyan) {
  X.save(); X.fillStyle = C.panel; X.strokeStyle = 'rgba(127,232,255,.35)'; X.lineWidth = 2; X.beginPath(); X.roundRect(r.x, r.y, r.w, r.h, 14); X.fill(); X.stroke(); X.restore();
  corners(r, col);
  if (title) { X.font = '700 26px Silkscreen'; X.fillStyle = col; X.textAlign = 'left'; X.textBaseline = 'top'; X.fillText(title, r.x + 24, r.y + 20); }
}
function tag(text, x, y, col, size = 34) {
  X.font = `700 ${size}px Silkscreen`; X.textAlign = 'left'; X.textBaseline = 'middle'; const tw = X.measureText(text).width;
  X.fillStyle = 'rgba(8,14,40,.88)'; X.fillRect(x, y - size * .85, tw + size * 1.1, size * 1.7); X.fillStyle = col; X.fillText(text, x + size * .55, y + 2);
}
function stamp(text, cx, cy, col, u, rot = -.12, size = 64) {
  if (u <= 0) return; const k = pop(Math.min(1, u * 3));
  X.save(); X.translate(cx, cy); X.rotate(rot); X.scale(k, k); X.globalAlpha = Math.min(1, u * 4);
  X.font = `700 ${size}px Silkscreen`; X.textAlign = 'center'; X.textBaseline = 'middle'; const tw = X.measureText(text).width;
  X.fillStyle = 'rgba(8,14,40,.75)'; X.fillRect(-tw / 2 - 26, -size * .8, tw + 52, size * 1.6);
  X.strokeStyle = col; X.lineWidth = 7; X.strokeRect(-tw / 2 - 26, -size * .8, tw + 52, size * 1.6); X.fillStyle = col; X.fillText(text, 0, 4); X.restore();
}
function shot(g, r, opt = {}) {
  const src = g.gl(), sw = src.width, sh = src.height, ar = r.w / r.h;
  let cw = sw, ch = sw / ar; if (ch > sh) { ch = sh; cw = sh * ar; }
  const z = opt.zoom || 1; cw /= z; ch /= z;
  const cx = (sw - cw) / 2 + (opt.dx || 0) * sw, cy = (sh - ch) / 2 + (opt.dy || 0) * sh;
  X.fillStyle = '#000'; X.fillRect(r.x, r.y, r.w, r.h);
  X.imageSmoothingEnabled = false; X.drawImage(src, cx, cy, cw, ch, r.x, r.y, r.w, r.h); X.imageSmoothingEnabled = true;
  X.strokeStyle = opt.col || C.line; X.lineWidth = 3; X.strokeRect(r.x - 1.5, r.y - 1.5, r.w + 3, r.h + 3); corners(r, opt.col || C.cyan);
  if (opt.label) tag(opt.label, r.x + 18, r.y + 44, opt.col || C.cyan, 30);
  const cam = g.S().cam;
  return v => { const p = v.clone().project(cam); return { x: r.x + ((p.x * .5 + .5) * sw - cx) / cw * r.w, y: r.y + ((-p.y * .5 + .5) * sh - cy) / ch * r.h, z: p.z }; };
}
function clipTo(r, fn) { X.save(); X.beginPath(); X.rect(r.x, r.y, r.w, r.h); X.clip(); fn(); X.restore(); }

function code(r, title, lines, hot, u, col = C.cyan) {
  panel(r, title, col);
  X.font = '400 26px "IBM Plex Mono"'; X.textAlign = 'left'; X.textBaseline = 'top';
  const shown = Math.floor(u * 900);
  let used = 0;
  lines.forEach((l, i) => {
    const y = r.y + 76 + i * 38, isHot = hot && hot.includes(i);
    if (isHot) { const k = ease((u - .15) * 4); X.fillStyle = `rgba(255,216,77,${.18 * k})`; X.fillRect(r.x + 12, y - 5, (r.w - 24) * k, 38); X.fillStyle = C.yellow; X.fillRect(r.x + 12, y - 5, 5, 38 * k); }
    const room = Math.max(0, shown - used); used += l.length + 4; const s = l.slice(0, room);
    X.fillStyle = isHot ? '#fff6cf' : /^\s*(function|const|let|return|if)\b/.test(l) ? '#c6b8ff' : /[{}]$/.test(l.trim()) && l.trim().length < 3 ? '#8f88b0' : '#e2e8ff';
    X.fillText(s, r.x + 30, y);
  });
}
function caption(text, t) {
  if (!text) return;
  X.font = '800 50px "Open Sans"'; X.textAlign = 'center'; X.textBaseline = 'middle';
  const words = text.split(' '), lines = []; let l = '';
  for (const w of words) { const tt = l ? l + ' ' + w : w; if (X.measureText(tt).width > 900 && l) { lines.push(l); l = w; } else l = tt; } if (l) lines.push(l);
  const y0 = 1690 - (lines.length - 1) * 34;
  lines.forEach((s, i) => { const tw = X.measureText(s).width, y = y0 + i * 68; X.fillStyle = 'rgba(14,12,40,.82)'; X.beginPath(); X.roundRect(W / 2 - tw / 2 - 20, y - 34, tw + 40, 66, 12); X.fill(); X.fillStyle = '#fff'; X.fillText(s, W / 2, y + 2); });
}
function arrow(x0, y0, x1, y1, col, w = 6, head = 22) {
  const a = Math.atan2(y1 - y0, x1 - x0); X.strokeStyle = col; X.fillStyle = col; X.lineWidth = w; X.lineCap = 'round';
  X.beginPath(); X.moveTo(x0, y0); X.lineTo(x1 - Math.cos(a) * head * .6, y1 - Math.sin(a) * head * .6); X.stroke();
  X.beginPath(); X.moveTo(x1, y1); X.lineTo(x1 - Math.cos(a - .45) * head, y1 - Math.sin(a - .45) * head); X.lineTo(x1 - Math.cos(a + .45) * head, y1 - Math.sin(a + .45) * head); X.closePath(); X.fill();
}
function bigNum(text, x, y, col, size) { X.font = `700 ${size}px Silkscreen`; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillStyle = 'rgba(0,0,0,.5)'; X.fillText(text, x + 6, y + 6); X.fillStyle = col; X.fillText(text, x, y); }
function sparkle(cx, cy, u, col) { if (u <= 0 || u > 1) return; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, d = 40 + 140 * ease(u); X.globalAlpha = 1 - u; X.fillStyle = i % 2 ? col : '#fff'; X.fillRect(cx + Math.cos(a) * d - 6, cy + Math.sin(a) * d - 6, 12, 12); } X.globalAlpha = 1; }

const feet = R => { const l = R.B[8].localToWorld(new R.B[8].position.constructor(0, -.445, 0)), r = R.B[10].localToWorld(new R.B[10].position.constructor(0, -.445, 0)); return { l, r }; };
function skeleton(g, R, proj, col = C.cyan) {
  g.S().scene.updateMatrixWorld(true);
  const B = R.B, P = (b, y = 0) => proj(b.localToWorld(g.V(0, y, 0)));
  const chains = [[P(B[0]), P(B[1]), P(B[2])], [P(B[2]), P(B[3]), P(B[4]), P(B[4], -.3)], [P(B[2]), P(B[5]), P(B[6]), P(B[6], -.3)], [P(B[0]), P(B[7]), P(B[8]), P(B[8], -.445)], [P(B[0]), P(B[9]), P(B[10]), P(B[10], -.445)]];
  X.strokeStyle = col; X.lineWidth = 5; X.lineCap = 'round'; X.lineJoin = 'round';
  for (const c of chains) { X.beginPath(); c.forEach((q, i) => i ? X.lineTo(q.x, q.y) : X.moveTo(q.x, q.y)); X.stroke(); }
  X.fillStyle = '#fff'; for (const c of chains) for (const q of c) { X.beginPath(); X.arc(q.x, q.y, 6, 0, 7); X.fill(); }
}
function sideCam(g, R, d = 4.2, h = 1.15, look = .95, side = 0) { const p = R.root.position, c = g.S().cam; c.position.set(p.x + side, h, p.z + d); c.lookAt(p.x, look, p.z); g.step(0); }

function walker(g) {
  return {
    t: 0, dir: 1, prints: [], slip: [],
    tick(dt, period = 2.2) {
      this.t += dt;
      const want = Math.floor(this.t / period) % 2 ? -1 : 1;
      if (want !== this.dir || this.t <= dt) { g.key(this.dir > 0 ? 'KeyD' : 'KeyA', false); this.dir = want; g.key(want > 0 ? 'KeyD' : 'KeyA', true); }
    },
    stop() { g.key('KeyD', false); g.key('KeyA', false); },
    track(R, now) {
      g.S().scene.updateMatrixWorld(true);
      const f = feet(R), low = f.l.y < f.r.y ? 'l' : 'r', p = f[low];
      const prev = this.last; this.last = { p: p.clone(), side: low, root: R.root.position.clone() };
      if (prev && prev.side === low) {
        const fs = Math.hypot(p.x - prev.p.x, p.z - prev.p.z), bs = Math.hypot(R.root.position.x - prev.root.x, R.root.position.z - prev.root.z);
        if (bs > 1e-4) this.slip.push(fs / bs); if (this.slip.length > 40) this.slip.shift();
      }
      this.prints.push({ p: p.clone(), side: low, t: now }); this.prints = this.prints.filter(q => now - q.t < 2.6);
    },
    ratio() { return this.slip.length ? this.slip.reduce((a, b) => a + b, 0) / this.slip.length : 0; },
    draw(proj, now) {
      for (const q of this.prints) { const s = proj(q.p), a = 1 - (now - q.t) / 2.6; X.globalAlpha = a; X.fillStyle = q.side === 'l' ? C.cyan : C.pink; X.beginPath(); X.arc(s.x, s.y + 6, 7, 0, 7); X.fill(); }
      X.globalAlpha = 1;
    },
  };
}

const END_LINE = 'Aero. You can play it at mpts.ie/games/aero';
let SKY = null;
function endCard(lt) {
  if (SKY) { const s = Math.max(W / SKY.width, H / SKY.height) * (1.05 + lt * .01); X.drawImage(SKY, W / 2 - SKY.width * s / 2, H - SKY.height * s, SKY.width * s, SKY.height * s); }
  const k = pop(Math.min(1, lt * 2));
  X.save(); X.translate(W / 2, 760); X.scale(k, k);
  X.font = '700 170px Silkscreen'; const tw = X.measureText('AERO').width;
  X.fillStyle = '#f2f1f6'; X.fillRect(-tw / 2 - 60, -120, tw + 120, 240); X.fillStyle = C.blue; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('AERO', 0, 10);
  X.restore();
  X.globalAlpha = ease((lt - .4) * 3);
  X.font = '700 46px Silkscreen'; X.textAlign = 'center'; const yw = X.measureText('you can play it at').width; X.fillStyle = 'rgba(16,24,70,.78)'; X.fillRect(W / 2 - yw / 2 - 24, 975, yw + 48, 70); X.fillStyle = '#fff'; X.fillText('you can play it at', W / 2, 1012);
  X.font = '700 56px Silkscreen'; const uw = X.measureText('mpts.ie/games/aero').width; X.fillStyle = '#f2f1f6'; X.fillRect(W / 2 - uw / 2 - 30, 1070, uw + 60, 100); X.fillStyle = C.blue; X.fillText('mpts.ie/games/aero', W / 2, 1122);
  X.globalAlpha = 1;
}

const OLD_GAIT = ['R.phase += dt * (5 + 6.5 * k);', 'const s = Math.sin(R.phase);', 'const c = Math.cos(R.phase);', 'hl = -s * amp; hr = s * amp;', 'kl = Math.max(0, c) * amp * 1.5 + .05;', 'kr = Math.max(0, -c) * amp * 1.5 + .05;'];
const NEW_FOOT = ['function footTarget(u, g) {', '  if (u < g.duty) {', '    const s = u / g.duty;', '    return [g.X * (1 - 2 * s), 0, true];', '  }', '  ...swing: Hermite curve + lift', '}'];
const NEW_IK = ['d = hypot(dy, dz)', 'kneeIn = acos((T*T + S*S - d*d) / (2*T*S))', 'alpha  = acos((T*T + d*d - S*S) / (2*T*d))', 'hip.rotation.x  = atan2(-dz, -dy) - alpha', 'knee.rotation.x = PI - kneeIn'];
const OLD_MERGE = ['const keep = b === lead ? b : a;', 'const go = keep === a ? b : a;', 'go.mergeInto = keep;', '', 'r.root.position.lerp(k.root.position, a);', 'r.phase = k.phase;'];
const NEW_MERGE = ['const avg = {', '  pos: from.reduce((v, f) => v.add(f.pos),', '         V(0, 0, 0)).multiplyScalar(1 / n),', '  yaw: circMean(from.map(f => f.yaw)),', '  phase: circMean(from.map(f => f.phase)),', '};'];
const CIRC = ['const circMean = a => Math.atan2(', '  a.reduce((s, x) => s + Math.sin(x), 0),', '  a.reduce((s, x) => s + Math.cos(x), 0));'];
const CSS_MASK = ['body { background: #1b75be; }', 'body::before {', '  background: url(sky_wide.jpg)', '    center bottom / cover no-repeat;', '  mask-image: linear-gradient(180deg,', '    transparent 0, #000 32%);', '}'];
const IO = ['new IntersectionObserver(es => es.forEach(e => {', '  if (e.isIntersecting) e.target.play();', '  else e.target.pause();', '}), { threshold: .25 });'];
const SHAPE = ['?shape=1x1', '  384 x 384', '?shape=9x16', '  288 x 512', '&capture', '  no controls'];

function mergeRun(g, opts = {}) {
  return {
    setup() { g.login(); g.fov(opts.fov || 40); g.crew4(); g.ptr('pointermove', g.atW(g.V(-2, 0, -1.5))); g.step(.05); this.order = g.runners().map(r => r.root); },
    tick(lt) {
      lt -= opts.delay || 0;
      if (at(lt, .15)) g.key('Digit2', true);
      if (lt > .2 && lt < 1.4) { const k = (lt - .2) / 1.2; g.ptr('pointermove', g.atW(g.V(lerp(-2, .4, k), 0, lerp(-1.5, .4, k)))); }
      if (at(lt, 1.6)) g.key('Digit2', false);
    },
  };
}
function topDown(r, g, mode, lt, leaderRoot) {
  panel(r, mode === 'leader' ? 'TOP DOWN · SNAP TO LEADER' : 'TOP DOWN · MEET IN THE MIDDLE', mode === 'leader' ? C.pink : C.lime);
  const rs = g.runners(); if (!rs.length) return;
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2 + 20, sc = 120, P = v => ({ x: cx + v.x * sc, y: cy + v.z * sc });
  let tgt; if (mode === 'leader') { const L = rs.find(q => q.root === leaderRoot) || rs[0]; tgt = L.root.position; }
  else { tgt = rs.reduce((a, q) => a.add(q.root.position), g.V(0, 0, 0)).multiplyScalar(1 / rs.length); }
  const T = P(tgt);
  for (const q of rs) { const p = P(q.root.position); if (Math.hypot(p.x - T.x, p.y - T.y) > 30) arrow(p.x, p.y, lerp(p.x, T.x, .85), lerp(p.y, T.y, .85), mode === 'leader' ? 'rgba(255,90,214,.8)' : 'rgba(182,255,106,.8)', 5, 18); }
  for (const q of rs) { const p = P(q.root.position), isL = mode === 'leader' && q.root === leaderRoot; X.fillStyle = isL ? C.yellow : '#fff'; X.beginPath(); X.arc(p.x, p.y, isL ? 20 : 15, 0, 7); X.fill(); }
  if (mode === 'leader') { X.font = '700 26px Silkscreen'; X.fillStyle = C.yellow; X.textAlign = 'center'; X.fillText('LEADER', T.x, T.y - 40); }
  else { X.strokeStyle = C.lime; X.lineWidth = 5; X.beginPath(); X.moveTo(T.x - 18, T.y - 18); X.lineTo(T.x + 18, T.y + 18); X.moveTo(T.x + 18, T.y - 18); X.lineTo(T.x - 18, T.y + 18); X.stroke(); X.font = '700 26px Silkscreen'; X.fillStyle = C.lime; X.textAlign = 'center'; X.fillText('AVERAGE', T.x, T.y - 40); }
}
function crown(x, y) { X.fillStyle = C.yellow; X.strokeStyle = '#7a5b00'; X.lineWidth = 3; X.beginPath(); X.moveTo(x - 30, y); X.lineTo(x - 34, y - 34); X.lineTo(x - 14, y - 16); X.lineTo(x, y - 40); X.lineTo(x + 14, y - 16); X.lineTo(x + 34, y - 34); X.lineTo(x + 30, y); X.closePath(); X.fill(); X.stroke(); }
function compass(cx, cy, R, angles, cols) {
  X.strokeStyle = 'rgba(127,232,255,.5)'; X.lineWidth = 3; X.beginPath(); X.arc(cx, cy, R, 0, 7); X.stroke();
  X.font = '700 30px Silkscreen'; X.fillStyle = C.dim; X.textAlign = 'center'; X.textBaseline = 'middle';
  X.fillText('N', cx, cy - R - 30); X.fillText('S', cx, cy + R + 30); X.fillText('E', cx + R + 30, cy); X.fillText('W', cx - R - 30, cy);
  angles.forEach((a, i) => { const r = a * Math.PI / 180; arrow(cx, cy, cx + Math.sin(r) * R * .92, cy - Math.cos(r) * R * .92, cols[i], 7, 26); });
}

function phoneShot(img, r, scroll, label) {
  if (!img) return; panel({ x: r.x - 14, y: r.y - 14, w: r.w + 28, h: r.h + 28 }, null, C.cyan);
  const s = r.w / img.width, sy = Math.max(0, Math.min(img.height - r.h / s, scroll * (img.height - r.h / s)));
  X.drawImage(img, 0, sy, img.width, Math.min(img.height - sy, r.h / s), r.x, r.y, r.w, Math.min(r.h, (img.height - sy) * s));
  if (label) tag(label, r.x + 14, r.y + 40, C.cyan, 28);
}

const VIDEOS = {
  dev_slip: { label: 'THE MOONWALK', games: { old: 'old/gait/games/aero/index.html#s2', now: 'public/games/aero/index.html?capture#s2' }, segs: [
    { setup(G) { this.a = walker(G.old); this.b = walker(G.now); G.old.login(); G.now.login(); },
      tick(G, lt, dt) { this.a.tick(dt); this.b.tick(dt); },
      draw(G, lt, t) {
        const ra = G.old.runners()[0], rb = G.now.runners()[0];
        sideCam(G.old, ra); const pa = shot(G.old, { x: 40, y: 250, w: 1000, h: 600 }, { label: 'BEFORE', col: C.pink }); this.a.track(ra, t); clipTo({ x: 40, y: 250, w: 1000, h: 600 }, () => this.a.draw(pa, t));
        sideCam(G.now, rb); const pb = shot(G.now, { x: 40, y: 900, w: 1000, h: 600 }, { label: 'AFTER', col: C.lime }); this.b.track(rb, t); clipTo({ x: 40, y: 900, w: 1000, h: 600 }, () => this.b.draw(pb, t));
        stamp('MOONWALK?', 720, 780, C.pink, lt - 2);
      }, cleanup(G) { this.a.stop(); this.b.stop(); } },
    { setup(G) { this.a = walker(G.old); G.old.login(); G.old.wire(true); this.hist = []; },
      tick(G, lt, dt) { this.a.tick(dt); },
      draw(G, lt, t) {
        const ra = G.old.runners()[0]; sideCam(G.old, ra, 3.6, 1.1, .95); const pw = shot(G.old, TOP, { label: 'BEFORE · SKELETON', col: C.pink }); clipTo(TOP, () => skeleton(G.old, ra, pw, C.pink));
        this.hist.push(ra.B[7].rotation.x); if (this.hist.length > 90) this.hist.shift();
        const gr = { x: 640, y: 290, w: 380, h: 200 }; X.fillStyle = 'rgba(8,14,40,.85)'; X.fillRect(gr.x, gr.y, gr.w, gr.h); X.strokeStyle = C.pink; X.lineWidth = 2; X.strokeRect(gr.x, gr.y, gr.w, gr.h);
        X.font = '700 22px Silkscreen'; X.fillStyle = C.pink; X.textAlign = 'left'; X.textBaseline = 'top'; X.fillText('HIP = SIN(TIME)', gr.x + 14, gr.y + 10);
        X.strokeStyle = C.yellow; X.lineWidth = 4; X.beginPath(); this.hist.forEach((v, i) => { const x = gr.x + 10 + i / 90 * (gr.w - 20), y = gr.y + gr.h / 2 + 18 - v * 90; i ? X.lineTo(x, y) : X.moveTo(x, y); }); X.stroke();
        code(BOT, 'OLD  animateRunner()', OLD_GAIT, [0, 1, 3], lt / 3, C.pink);
        stamp('NO GROUND', 820, 860, C.pink, lt - 3.2, .1, 46);
      }, cleanup(G) { this.a.stop(); G.old.wire(false); } },
    { setup(G) { this.a = walker(G.old); G.old.login(); },
      tick(G, lt, dt) { this.a.tick(dt); },
      draw(G, lt, t) {
        const ra = G.old.runners()[0]; sideCam(G.old, ra, 3.4, .9, .7); const p = shot(G.old, TOP, { label: 'BEFORE · FEET TRACKED', col: C.pink }); this.a.track(ra, t); clipTo(TOP, () => this.a.draw(p, t));
        panel(BOT, 'PLANTED FOOT SPEED / BODY SPEED', C.pink);
        const v = Math.min(1.2, this.a.ratio()), shownV = Math.round(lerp(0, 95, ease(lt / 3)));
        X.fillStyle = 'rgba(255,77,109,.25)'; X.fillRect(BOT.x + 40, BOT.y + 120, BOT.w - 80, 90); X.fillStyle = C.red; X.fillRect(BOT.x + 40, BOT.y + 120, (BOT.w - 80) * Math.min(1, v), 90);
        X.font = '700 26px Silkscreen'; X.fillStyle = C.dim; X.textAlign = 'left'; X.fillText('LIVE', BOT.x + 40, BOT.y + 240);
        bigNum(shownV + '%', BOT.x + BOT.w / 2, BOT.y + 380, C.red, 170);
        X.font = '600 30px "Open Sans"'; X.fillStyle = C.ink; X.textAlign = 'center'; X.fillText('measured over 4 s of walking', BOT.x + BOT.w / 2, BOT.y + 480);
      }, cleanup() { this.a.stop(); } },
    { setup(G) { this.b = walker(G.now); G.now.login(); G.now.wire(true); },
      tick(G, lt, dt) { this.b.tick(dt); },
      draw(G, lt, t) {
        const rb = G.now.runners()[0]; sideCam(G.now, rb, 3.4, .9, .7); const p = shot(G.now, TOP, { label: 'AFTER · PINNED FEET', col: C.lime }); this.b.track(rb, t);
        clipTo(TOP, () => { skeleton(G.now, rb, p, C.lime); this.b.draw(p, t); const seen = {}; for (const q of this.b.prints) { const k = q.side + Math.round(q.p.x * 20); if (seen[k]) continue; seen[k] = 1; const s = p(q.p); X.fillStyle = q.side === 'l' ? C.cyan : C.pink; X.beginPath(); X.moveTo(s.x, s.y + 4); X.lineTo(s.x - 9, s.y - 18); X.lineTo(s.x + 9, s.y - 18); X.closePath(); X.fill(); X.beginPath(); X.arc(s.x, s.y - 26, 11, 0, 7); X.fill(); } });
        code(BOT, 'NEW  footTarget()', NEW_FOOT, [1, 2, 3], lt / 3, C.lime);
      }, cleanup(G) { this.b.stop(); G.now.wire(false); } },
    { setup(G) { this.b = walker(G.now); G.now.login(); },
      tick(G, lt, dt) { this.b.tick(dt, 3); },
      draw(G, lt, t) {
        const rb = G.now.runners()[0]; sideCam(G.now, rb, 2.6, .8, .7); const p = shot(G.now, TOP, { label: 'AFTER · TWO-BONE IK', col: C.lime });
        G.now.S().scene.updateMatrixWorld(true);
        const B = rb.B, hip = p(B[7].getWorldPosition(G.now.V(0, 0, 0))), knee = p(B[8].getWorldPosition(G.now.V(0, 0, 0))), foot = p(B[8].localToWorld(G.now.V(0, -.445, 0)));
        clipTo(TOP, () => {
          X.strokeStyle = C.yellow; X.lineWidth = 7; X.beginPath(); X.moveTo(hip.x, hip.y); X.lineTo(knee.x, knee.y); X.lineTo(foot.x, foot.y); X.stroke();
          X.setLineDash([14, 10]); X.strokeStyle = C.cyan; X.lineWidth = 4; X.beginPath(); X.moveTo(hip.x, hip.y); X.lineTo(foot.x, foot.y); X.stroke(); X.setLineDash([]);
          for (const [q, n] of [[hip, 'HIP'], [knee, 'KNEE'], [foot, 'FOOT']]) { X.fillStyle = '#fff'; X.beginPath(); X.arc(q.x, q.y, 12, 0, 7); X.fill(); X.font = '700 26px Silkscreen'; X.fillStyle = C.yellow; X.textAlign = 'left'; X.fillText(n, q.x + 22, q.y); }
          const dx = (hip.x + foot.x) / 2, dy = (hip.y + foot.y) / 2; X.font = '700 30px Silkscreen'; X.fillStyle = C.cyan; X.textAlign = 'right'; X.fillText('d', dx - 14, dy);
        });
        code(BOT, 'NEW  legIK(), simplified', NEW_IK, [1, 2], lt / 3, C.lime);
      }, cleanup() { this.b.stop(); } },
    { setup(G) { this.a = walker(G.old); this.b = walker(G.now); G.old.login(); G.now.login(); },
      tick(G, lt, dt) { this.a.tick(dt); this.b.tick(dt); },
      draw(G, lt, t) {
        const ra = G.old.runners()[0], rb = G.now.runners()[0];
        const rA = { x: 40, y: 250, w: 490, h: 640 }, rB = { x: 550, y: 250, w: 490, h: 640 };
        sideCam(G.old, ra, 3.2, .9, .6); const pa = shot(G.old, rA, { label: 'BEFORE', col: C.pink }); this.a.track(ra, t); clipTo(rA, () => this.a.draw(pa, t));
        sideCam(G.now, rb, 3.2, .9, .6); const pb = shot(G.now, rB, { label: 'AFTER', col: C.lime }); this.b.track(rb, t); clipTo(rB, () => this.b.draw(pb, t));
        panel({ x: 40, y: 940, w: 1000, h: 560 }, 'SLIP WHILE WALKING', C.yellow);
        const k = ease((lt - .3) / 2.2);
        bigNum('95%', 245, 1180, C.red, 96); arrow(410, 1180, 560, 1180, C.yellow, 10, 34);
        bigNum(k < 1 ? Math.max(.6, 95 * (1 - k)).toFixed(1) + '%' : '0.6%', 800, 1180, C.lime, 96);
        X.font = '600 30px "Open Sans"'; X.fillStyle = C.ink; X.textAlign = 'center'; X.fillText('same measure, same walk speed', 540, 1340);
        sparkle(800, 1180, (lt - 2.5) / .8, C.lime);
      }, cleanup() { this.a.stop(); this.b.stop(); } },
    { setup(G) { this.a = walker(G.old); this.b = walker(G.now); G.old.login(); G.now.login(); },
      tick(G, lt, dt) { this.b.tick(dt); this.a.tick(dt, 99); if (lt < dt * 1.5) { G.old.key('KeyD', false); G.old.key('KeyA', true); } },
      draw(G, lt, t) {
        const rb = G.now.runners()[0], ra = G.old.runners()[0];
        sideCam(G.now, rb); shot(G.now, TOP, { label: 'AFTER', col: C.lime }); stamp('PLANTED', 760, 860, C.lime, lt - .3, -.08, 54);
        const r2 = { x: 290, y: 1000, w: 500, h: 420 }; sideCam(G.old, ra, 3.4, 1, .8); shot(G.old, r2, { label: 'BY REQUEST', col: C.pink });
        stamp('MOONWALK MODE', 540, 1440, C.pink, lt - 1.4, .06, 40);
      }, cleanup(G) { this.a.stop(); this.b.stop(); G.old.key('KeyA', false); } },
    { end: true },
  ] },

  dev_merge: { label: 'MEET IN THE MIDDLE', games: { old: 'old/merge/games/aero/index.html#s2', now: 'public/games/aero/index.html?capture#s2' }, segs: [
    { setup(G) { this.m = mergeRun(G.now, { delay: .3 }); this.m.setup(); },
      tick(G, lt) { this.m.tick(lt); },
      draw(G, lt) { shot(G.now, { x: 40, y: 250, w: 1000, h: 1000 }, { label: 'NOW', col: C.lime });
        const n = G.now.runners().length; if (n > 1 || lt < 1) this.done = false; else if (lt > 3) this.done = true; bigNum('4', 380, 1380, C.yellow, 110); arrow(450, 1380, 610, 1380, C.ink, 10, 32); bigNum(this.done ? '1' : '?', 700, 1380, this.done ? C.lime : C.yellow, 110); stamp('WHICH ONE?', 760, 1160, C.yellow, lt - 4.2, -.1, 48); } },
    { setup(G) { this.m = mergeRun(G.old, { delay: 1.4 }); this.m.setup(); },
      tick(G, lt) { this.m.tick(lt); },
      draw(G, lt) { const p = shot(G.old, TOP, { label: 'BEFORE', col: C.pink }); const L = this.m.order[0];
        if (L && L.visible) clipTo(TOP, () => { const s = p(L.position.clone().setY(2.35)); crown(s.x, s.y); });
        topDown(BOT, G.old, 'leader', lt, L); } },
    { setup(G) { this.m = mergeRun(G.old, { delay: .8 }); this.m.setup(); },
      tick(G, lt) { this.m.tick(lt); },
      draw(G, lt) { const p = shot(G.old, { x: 40, y: 250, w: 1000, h: 600 }, { label: 'BEFORE', col: C.pink }); const L = this.m.order[0];
        if (L && L.visible) clipTo({ x: 40, y: 250, w: 1000, h: 600 }, () => { const s = p(L.position.clone().setY(2.35)); crown(s.x, s.y); });
        code({ x: 40, y: 900, w: 1000, h: 330 }, 'OLD  stepMerges()', OLD_MERGE, [0, 2], lt / 2.5, C.pink);
        panel({ x: 40, y: 1260, w: 1000, h: 250 }, 'CREW, IN LIST ORDER', C.pink);
        ['crew[0]', 'crew[1]', 'crew[2]', 'crew[3]'].forEach((s, i) => { const x = 110 + i * 235, y = 1390; X.fillStyle = i ? 'rgba(255,255,255,.12)' : 'rgba(255,216,77,.3)'; X.fillRect(x - 10, y - 40, 210, 90); X.font = '700 30px Silkscreen'; X.fillStyle = i ? C.ink : C.yellow; X.textAlign = 'left'; X.fillText(s, x + 10, y + 6); });
        stamp('ALWAYS WINS', 230, 1290, C.yellow, lt - 3, -.1, 34); } },
    { setup(G) { this.m = mergeRun(G.now, { delay: 1.4 }); this.m.setup(); },
      tick(G, lt) { this.m.tick(lt); },
      draw(G, lt) { shot(G.now, TOP, { label: 'AFTER', col: C.lime }); topDown(BOT, G.now, 'avg', lt); } },
    { draw(G, lt, t, L) {
        panel({ x: 40, y: 250, w: 1000, h: 1260 }, 'AVERAGE OF 350 AND 10 DEGREES', C.yellow);
        const k = ease((lt - 3.5) / 1.5); compass(540, 820, 330, [350, 10].concat(lt > 3.5 ? [lerp(0, 180, k)] : []), [C.cyan, C.cyan, C.red]);
        X.font = '700 40px Silkscreen'; X.textAlign = 'center'; X.fillStyle = C.ink; X.fillText('(350 + 10) / 2 = ' + (lt > 3.5 ? Math.round(lerp(0, 180, k)) : '?'), 540, 1300);
        stamp('SOUTH?!', 540, 1420, C.red, lt - 5.4, -.06, 60);
      } },
    { draw(G, lt) {
        panel({ x: 40, y: 250, w: 1000, h: 760 }, 'ADD THEM AS ARROWS', C.lime);
        const cx = 540, by = 900, R = 260, a1 = -10 * Math.PI / 180, a2 = 10 * Math.PI / 180, k = ease((lt - .5) / 1.5);
        const p1 = { x: cx + Math.sin(a1) * R, y: by - Math.cos(a1) * R }, p2 = { x: p1.x + Math.sin(a2) * R * k, y: p1.y - Math.cos(a2) * R * k };
        arrow(cx, by, p1.x, p1.y, C.cyan, 8, 28); if (k > .05) arrow(p1.x, p1.y, p2.x, p2.y, C.cyan, 8, 28);
        if (lt > 2.2) { arrow(cx, by, p2.x, p2.y, C.lime, 10, 34); X.font = '700 36px Silkscreen'; X.fillStyle = C.lime; X.textAlign = 'left'; X.fillText('SUM POINTS NORTH', cx + 40, p2.y + 20); sparkle(p2.x, p2.y, (lt - 2.2) / .8, C.lime); }
        code({ x: 40, y: 1050, w: 1000, h: 460 }, 'NEW  circMean()', CIRC, [0, 1, 2], (lt - .8) / 2.5, C.lime);
      } },
    { setup(G) { this.m = mergeRun(G.now, { fov: 34, delay: 1 }); this.m.setup(); },
      tick(G, lt) { this.m.tick(lt); },
      draw(G, lt) {
        shot(G.now, TOP, { label: 'AFTER · IN STEP', col: C.lime });
        panel(BOT, 'WALK CYCLE PHASE', C.lime);
        const cx = 540, cy = BOT.y + 280, R = 180, start = [.3, 2.1, 3.6, 5.2], mean = Math.atan2(start.reduce((s, x) => s + Math.sin(x), 0), start.reduce((s, x) => s + Math.cos(x), 0)), k = ease((lt - .6) / 2.4);
        X.strokeStyle = 'rgba(182,255,106,.5)'; X.lineWidth = 3; X.beginPath(); X.arc(cx, cy, R, 0, 7); X.stroke();
        start.forEach((a0, i) => { let d = mean - a0; d = Math.atan2(Math.sin(d), Math.cos(d)); const a = a0 + d * k; X.fillStyle = [C.cyan, C.pink, C.yellow, '#fff'][i]; X.beginPath(); X.arc(cx + Math.cos(a) * R, cy + Math.sin(a) * R, 20, 0, 7); X.fill(); });
        if (k >= 1) sparkle(cx + Math.cos(mean) * R, cy + Math.sin(mean) * R, (lt - 3) / .8, C.lime);
        X.font = '700 26px Silkscreen'; X.fillStyle = C.dim; X.textAlign = 'center'; X.fillText('ILLUSTRATION', cx, BOT.y + BOT.h - 30);
      } },
    { end: true },
  ] },

  dev_site: { label: 'THE SITE', games: {}, segs: [
    { draw(G, lt) {
        const r = { x: 290, y: 280, w: 500, h: 1180 }, k = ease(lt / 1.6);
        X.setLineDash([16, 10]); X.strokeStyle = C.cyan; X.lineWidth = 4; X.beginPath(); X.roundRect(r.x, r.y, r.w, r.h * k, 40); X.stroke(); X.setLineDash([]);
        const boxes = [[340, 380, 400, 60, 'TITLE'], [340, 480, 400, 300, 'GAME?'], [340, 820, 400, 200, 'CLIPS?'], [340, 1060, 400, 200, 'SKY?']];
        boxes.forEach(([x, y, w, h, s], i) => { const u = ease((lt - .6 - i * .25) * 3); if (u <= 0) return; X.globalAlpha = u; X.strokeStyle = C.ink; X.lineWidth = 3; X.strokeRect(x, y, w, h); X.beginPath(); X.moveTo(x, y); X.lineTo(x + w, y + h); X.moveTo(x + w, y); X.lineTo(x, y + h); X.strokeStyle = 'rgba(238,242,255,.25)'; X.stroke(); X.font = '700 30px Silkscreen'; X.fillStyle = C.cyan; X.textAlign = 'center'; X.fillText(s, x + w / 2, y + h / 2); X.globalAlpha = 1; });
      } },
    { draw(G, lt) { phoneShot(IMG.site0, { x: 290, y: 280, w: 500, h: 900 }, 0, 'VERSION 1'); stamp('JUST THE GAME', 540, 1300, C.pink, lt - 1.2, -.06, 48); } },
    { draw(G, lt, t, L) { phoneShot(IMG.site1, { x: 60, y: 280, w: 440, h: 1200 }, ease(lt / L) * .6, 'VERSION 2');
        code({ x: 530, y: 280, w: 510, h: 330 }, 'NATIVE SHAPES', SHAPE, [0, 1], lt / 2, C.cyan);
        if (VID.sq) { const r = { x: 560, y: 680, w: 450, h: 450 }; X.drawImage(VID.sq, r.x, r.y, r.w, r.h); X.strokeStyle = C.cyan; X.lineWidth = 3; X.strokeRect(r.x, r.y, r.w, r.h); corners(r); tag('1:1 CLIP', r.x + 14, r.y + 40, C.cyan, 26); } } },
    { draw(G, lt) { const img = IMG.sky; const r = { x: 40, y: 300, w: 1000, h: 558 }; X.drawImage(img, r.x, r.y, r.w, r.h); corners(r);
        const k = ease((lt - .8) * 2); X.strokeStyle = C.yellow; X.lineWidth = 6; X.strokeRect(r.x, r.y, r.w * k, 46);
        panel({ x: 40, y: 940, w: 1000, h: 520 }, 'TOP ROW, SAMPLED', C.yellow);
        SWATCH.forEach((s, i) => { const u = ease((lt - 1.2 - i * .12) * 4); if (u <= 0) return; const x = 80 + i * 116, y = 1040; X.globalAlpha = u; X.fillStyle = s; X.fillRect(x, y, 96, 190); X.font = '400 18px "IBM Plex Mono"'; X.fillStyle = C.ink; X.textAlign = 'center'; X.fillText(s, x + 48, y + 220); X.globalAlpha = 1; });
        stamp('UNEVEN', 540, 1380, C.yellow, lt - 3.5, -.05, 50); } },
    { draw(G, lt) { const img = IMG.sky, r = { x: 40, y: 560, w: 1000, h: 558 };
        X.fillStyle = '#1b75be'; X.fillRect(40, 280, 1000, 280); X.drawImage(img, r.x, r.y, r.w, r.h); corners({ x: 40, y: 280, w: 1000, h: 838 });
        const k = ease((lt - .6) * 2); X.setLineDash([18, 12]); X.strokeStyle = C.red; X.lineWidth = 6; X.beginPath(); X.moveTo(40, 560); X.lineTo(40 + 1000 * k, 560); X.stroke(); X.setLineDash([]);
        const zr = 150, zy = 1330, sx = 40 + 140, sy = 560; X.save(); X.beginPath(); X.arc(540, zy, zr, 0, 7); X.clip(); X.imageSmoothingEnabled = false; X.drawImage(cv, sx - 50, sy - 50, 100, 100, 540 - zr, zy - zr, zr * 2, zr * 2); X.imageSmoothingEnabled = true; X.restore();
        X.strokeStyle = 'rgba(255,77,109,.7)'; X.lineWidth = 3; X.beginPath(); X.moveTo(sx, sy + 50); X.lineTo(540 - zr * .7, zy - zr * .7); X.stroke(); X.strokeRect(sx - 50, sy - 50, 100, 100);
        X.strokeStyle = C.red; X.lineWidth = 6; X.beginPath(); X.arc(540, zy, zr, 0, 7); X.stroke();
        stamp('SEAM', 820, 1260, C.red, lt - 1.2, .1, 56); } },
    { draw(G, lt) { const img = IMG.sky, r = { x: 40, y: 280, w: 1000, h: 840 }, k = ease((lt - .5) / 1.8);
        X.fillStyle = '#1b75be'; X.fillRect(r.x, r.y, r.w, r.h);
        const off = MASKC.getContext('2d'); off.clearRect(0, 0, MASKC.width, MASKC.height); off.globalCompositeOperation = 'source-over'; off.drawImage(img, 0, 280, 1000, 558);
        off.globalCompositeOperation = 'destination-in'; const gr = off.createLinearGradient(0, 280, 0, 280 + 558 * Math.max(.001, .32 * k)); gr.addColorStop(0, k > 0 ? 'rgba(0,0,0,0)' : '#000'); gr.addColorStop(1, '#000'); off.fillStyle = gr; off.fillRect(0, 0, MASKC.width, MASKC.height);
        X.drawImage(MASKC, r.x, r.y); corners(r, C.lime); tag(k < .1 ? 'HARD EDGE' : 'MASK 0 TO 32%', r.x + 18, r.y + 44, C.lime, 28);
        code({ x: 40, y: 1150, w: 1000, h: 360 }, 'CSS', CSS_MASK, [4, 5], (lt - .3) / 2.5, C.lime); } },
    { draw(G, lt, t, L) { phoneShot(IMG.site2, { x: 290, y: 270, w: 500, h: 880 }, lerp(.15, 1, ease(lt / L)), 'NOW');
        code({ x: 40, y: 1190, w: 1000, h: 320 }, 'CLIPS PLAY ONLY WHEN SEEN', IO, [1, 2], lt / 2, C.cyan);
        stamp('ON THE CLOUDS', 820, 1060, C.lime, lt - (L - 2.2), -.08, 34); } },
    { draw(G, lt) {
        const rows = [['public/games/aero/index.html', C.ink], [LINES + ' lines · html, css, js', C.dim], ['assets/  media/', C.dim]];
        panel({ x: 40, y: 300, w: 1000, h: 300 }, 'ONE FILE', C.cyan);
        rows.forEach(([s, c], i) => { X.font = '400 30px "IBM Plex Mono"'; X.fillStyle = c; X.textAlign = 'left'; X.fillText(s, 80, 400 + i * 54); });
        const k = ease((lt - 1) * 1.5); arrow(540, 640, 540, 640 + 160 * k, C.cyan, 8, 28);
        if (lt > 1.3) { panel({ x: 240, y: 830, w: 600, h: 150 }, null, C.yellow); X.font = '700 40px Silkscreen'; X.fillStyle = C.yellow; X.textAlign = 'center'; X.fillText('CLOUDFLARE WORKER', 540, 905); }
        if (lt > 2) { arrow(540, 1000, 540, 1150, C.cyan, 8, 28); X.font = '700 52px Silkscreen'; X.fillStyle = '#fff'; X.textAlign = 'center'; X.fillText('mpts.ie/games/aero', 540, 1240); sparkle(540, 1240, (lt - 2) / .8, C.cyan); }
      } },
    { end: true },
  ] },
};
const IMG = {}, VID = {}; let SWATCH = [], LINES = 0, MASKC = null;

let V = null, G = {}, segs = [], starts = [], lines = [], cur = -1, total = 0;
window.__dev = {
  async load(name, timing) {
    V = VIDEOS[name];
    await document.fonts.load('700 40px Silkscreen'); await document.fonts.load('800 40px "Open Sans"'); await document.fonts.load('400 20px "IBM Plex Mono"'); await document.fonts.load('600 20px "Open Sans"');
    SKY = await loadImg('../public/games/aero/assets/sky_wide.jpg'); IMG.sky = SKY;
    if (name === 'dev_site') {
      for (const n of ['site0', 'site1', 'site2']) IMG[n] = await loadImg(`../shots/${n}_432.jpg`);
      const c = document.createElement('canvas'); c.width = SKY.width; c.height = 4; const cx = c.getContext('2d'); cx.drawImage(SKY, 0, 0);
      const d = cx.getImageData(0, 0, SKY.width, 1).data; SWATCH = Array.from({ length: 8 }, (_, i) => { const x = Math.round((i + .5) / 8 * SKY.width), o = x * 4; return '#' + [d[o], d[o + 1], d[o + 2]].map(v => v.toString(16).padStart(2, '0')).join(''); });
      LINES = (await fetch('../public/games/aero/index.html').then(r => r.text())).split('\n').length;
      MASKC = document.createElement('canvas'); MASKC.width = 1000; MASKC.height = 840;
      VID.sq = await loadImg('../clipframes/sq_merge/f0001.jpg');
    }
    G = {}; let slot = 0;
    for (const [k, url] of Object.entries(V.games)) G[k] = await makeGame('../' + url, slot++);
    lines = timing.lines; segs = V.segs; starts = timing.starts; total = timing.total; cur = -1;
    return { frames: Math.round(total * FPS) };
  },
  async frame(i) {
    const t = i / FPS, dt = 1 / FPS;
    let k = segs.length - 1; while (k > 0 && starts[k] > t + 1e-6) k--;
    const s = segs[k], lt = t - starts[k], L = (k + 1 < starts.length ? starts[k + 1] : total) - starts[k];
    if (k !== cur) { if (cur >= 0 && segs[cur].cleanup) segs[cur].cleanup(G); cur = k; if (s.setup) s.setup(G); }
    if (VID.sq) VID.sq = (await loadImg(`../clipframes/sq_merge/f${String(1 + i % 246).padStart(4, '0')}.jpg`)) || VID.sq;
    if (s.tick) s.tick(G, lt, dt);
    for (const g of Object.values(G)) g.step(dt);
    if (s.end) { endCard(lt); caption(lines[k], t); }
    else { bg(t); s.draw(G, lt, t, L); header(V.label, t); caption(lines[k], t); }
    const edge = Math.min(lt, L - lt); if (edge < .07 && i > 0) { X.fillStyle = `rgba(255,255,255,${(.07 - edge) * 4})`; X.fillRect(0, 0, W, H); }
    return cv.toDataURL('image/jpeg', .9);
  },
};
})();
