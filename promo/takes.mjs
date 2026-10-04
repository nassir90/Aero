import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const read = p => fs.readFileSync(path.join(HERE, p), 'utf8');
const RIGS = read('rigs.js');
const LEGACY = read('../studio/shadow/clips.js')
  .replace('window.CLIP_RUN = {', 'window.CLIP_RUN_OLD = {')
  .replace("v.src = `/clips/_sq/", "v.src = `http://127.0.0.1:8782/clips_sq/")
  .replace("(0, eval)(await (await fetch('/studio/promo.js')).text());", '')
  .replace(/const segStarts = async[\s\S]*?\n};\n/, 'const segStarts = async () => window.__SEGSTARTS;\n');
const PROMO = read('../studio/promo.js')
  .replace("end: (dur, vo) => ({ dur, vo, end: true,\n    setup() { go('title'); step(1); } }),",
           "end: (dur, vo) => ({ dur, vo, end: true,\n    setup() { go('title'); document.querySelector('#titleOv .plate').style.visibility = 'hidden'; step(1); } }),");

const LEAD0 = 1.4, LEAD = 0.35, TAIL = 0.5, TAIL_END = 1.2;
export function plan(id) {
  const vo = JSON.parse(read(`videos/${id}/vo.json`)), n = vo.lines.length;
  const words = fs.existsSync(path.join(HERE, `videos/${id}/words.json`)) ? JSON.parse(read(`videos/${id}/words.json`)) : null;
  let t = 0; const segs = vo.lines.map((l, i) => {
    const lead = i === 0 ? LEAD0 : LEAD, tail = i === n - 1 ? TAIL_END : TAIL, dur = lead + (l.end - l.start) + tail;
    const s = { t0: t, dur, lead, line: l }; t += dur; return s;
  });
  const wordAt = (li, wi) => { const s = segs[li]; return s.t0 + s.lead + (words[li][wi].t0 - s.line.start); };
  return { segs, total: t, d: segs.map(s => s.dur), at: segs.map(s => s.t0), wordAt };
}

const r2 = x => Math.round(x * 100) / 100;
const sum = a => a.reduce((x, y) => x + y, 0);
const TAKES = {}, SPEC = {};
const seq = (name, list, extra = {}) => { TAKES[name] = { seq: list.map(([k, d, o]) => [k, r2(d), o || {}]) }; SPEC[name] = { seconds: r2(sum(list.map(x => x[1]))) + 0.2, ...extra }; };
const legacy = (name, def, seconds, extra = {}) => { TAKES[name] = { legacy: def }; SPEC[name] = { seconds, ...extra }; };

{ const p = plan('01-aero'), d = p.d, f = .47;
  TAKES.v01 = { legacy: 'promo_v1' }; SPEC.v01 = { seconds: r2(p.total) + .2, durs: [d[0], d[1], d[2], d[3], d[4], d[5] * f, d[5] * (1 - f), d[6], d[7], d[8] + .5].map(r2), promoVideo: 'v1_whole' }; }
{ const p = plan('02-copies'), d = p.d;
  TAKES.v02 = { legacy: 'promo_v2' }; SPEC.v02 = { seconds: r2(p.total) + .2, durs: [d[0], d[1], d[2], d[3], d[4] + d[5] + .3, .5].map(r2), promoVideo: 'v2_merge' }; }

legacy('walk_before', 'walk_before', 26, { rev: 'a1ed95b' });
legacy('walk_after', 'walk_after', 22);
legacy('run_after', 'run_after', 13);
legacy('ik_close', 'ik_close', 9);
legacy('merge_now', 'merge_now', 30);
legacy('merge_old_lead', 'merge_old_lead', 8, { rev: '53a2df9' });
legacy('merge_old_lead2', 'merge_old_lead2', 8, { rev: '53a2df9' });
legacy('merge_old_split', 'merge_old_split', 8, { rev: '53a2df9' });
legacy('merge_avg', 'merge_avg', 8);
legacy('merge_close', 'merge_close', 15);
const SITE = { page: 'games/aero/index.html', size: [540, 960], dpr: 2, ready: () => document.readyState === 'complete', settle: 1.5 };
legacy('site_now_top', 'site_now_top', 5, SITE);
legacy('site_v1', 'site_v1', 6, { ...SITE, rev: 'ac84f9f' });
legacy('site_v2', 'site_v2', 7, { ...SITE, rev: 'a1ed95b' });
legacy('site_bottom', 'site_bottom', 22, SITE);
{ const p = plan('06-site-promo'); legacy('site_tour', 'site_tour', r2(p.total) + .2, { ...SITE, segStarts: p.at }); }
for (const [name, mode] of [['sky_edge', 'edge'], ['sky_seam', 'seam'], ['sky_mask', 'mask']])
  SPEC[name] = { app: 'pages', page: `sky.html?mode=${mode}&dur=${mode === 'edge' ? 12 : 8}`, seconds: mode === 'edge' ? 12 : 8, ready: () => window.__ready, annotate: () => ({ ann: window.__ann }), inject: null, setup: null, each: null };

{ const p = plan('07-login'), d = p.d;
  seq('t07', [['orbit', d[0], { r: 30, h: 16, spin: .05, a0: 2.2 }], ['sea', d[1], { plate: false }], ['login', d[2]], ['arrive', d[3]], ['reveal', d[4] + d[5]]]); }
{ const p = plan('08-copy-yourself'), d = p.d, at = p.at;
  seq('t08', [['copyAll', p.total, { times: { login: .35, copy: r2(at[1] + .35), move: r2(at[2] + .3), cut: r2(at[3] + .3) } }]]); }
{ const p = plan('09-climb'), d = p.d, at = p.at, orb = { r: 32, h: 18, spin: .05 };
  seq('t09', [['orbit', d[0], orb], ['climb', d[1], { from: 3, dz: 1.4, goto: [0, 0], walkTo: 3, yaw: 0 }],
    ['climb', d[2] + d[3], { from: 0, walkTo: 1, yaw: .2, aims: [[r2(p.wordAt(2, 12) - at[2] - .1), 'Digit2', 2], [r2(d[2] + .3), 'Digit2', 3]] }],
    ['climb', d[4], { from: 12, collect: true, pipe: true }], ['orbit', d[5], { ...orb, t0: d[0] }]]); }
{ const p = plan('10-body'), d = p.d, orb = { r: 3.3, spin: .3 };
  seq('t10', [['body', d[0], { ...orb, r: 3.9, h: 1.7, lookY: 1.8 }], ['body', d[1], { ...orb, t0: d[0], ann: 'capsules', annAt: .5 }], ['body', d[2], { ...orb, t0: d[0] + d[1], ann: 'points', annAt: .5 }],
    ['side', d[3], { ann: 'bones', d: 3.6, annAt: .4 }], ['body', d[4], { a0: 0, spin: 0, r: 2.6, h: 1.25, lookY: 1.15, ann: 'measure', annAt: .6 }],
    ['body', d[5], { ...orb, t0: d[0] + d[1] + d[2] }]], { inject: [{ after: 'let RUNNER_GEO = null;', code: 'window.__runnerSDF = runnerSDF;' }] }); }
{ const p = plan('11-sky'), d = p.d, orb = { r: 30, h: 9, spin: .05, a0: .9 };
  seq('t11', [['orbit', d[0], orb], ['pillar', d[1], { box: 3, dur: d[1] }], ['ring', d[2], { box: 6, outline: true }], ['sweep', d[3], { dur: d[3] }],
    ['sea', d[4] + d[5], { plate: false, digit: [1.0, d[4] - .3] }]]); }
{ const p = plan('12-cooked-1'), d = p.d, orb = { r: 30, h: 16, spin: .05, a0: -1.7 };
  seq('t12', [['orbit', d[0], orb], ['sea', d[1], { plate: true }], ['climb', d[4] + d[5], { from: 0, walkTo: 3, yaw: .35 }]]);
  const a = d[2] / 2, b = d[3] / 3;
  SPEC.s12 = { app: 'pages', page: `stills.html?set=v01_start:.5:${r2(a)},v01_level:.5:${r2(a)},v05_capsules:.5:${r2(b)},v06_lumpy:.5:${r2(b)},v08_straight:.5:${r2(b)}`, seconds: r2(d[2] + d[3]) + .2,
    ready: () => window.__ready && window.__ready(), annotate: () => ({ state: window.__state }), inject: null, setup: null, each: null }; }
{ const p = plan('13-cooked-2'), d = p.d, orb = { r: 3.3, spin: .3 };
  const menuAt = r2(p.wordAt(3, 13) - p.at[3] - .15);
  seq('t13', [['body', d[0], { ...orb, r: 3.9, h: 1.7, lookY: 1.8 }], ['sea', d[1], { plate: false }], ['body', d[2], { ...orb, t0: d[0], r: 4.4 }],
    ['body', menuAt, { a0: .5, spin: .06, r: 2.9, ann: 'notes', notes: [.3, r2(p.wordAt(3, 9) - p.at[3] - .2)], annAt: 0 }], ['menu', d[3] - menuAt, { noteAt: 1.4 }],
    ['orbit', d[4], { r: 30, h: 16, spin: .05 }], ['climb', d[5] + d[6], { from: 0, walkTo: 3, yaw: .35 }]]);
  SPEC.s13 = { app: 'pages', page: `stills.html?set=v06_lumpy:.5:${r2(d[2])}`, seconds: r2(d[2]) + .2, ready: () => window.__ready && window.__ready(), annotate: () => ({ state: window.__state }), inject: null, setup: null, each: null }; }
TAKES.ocean_end = { seq: [['sea', 14, { plate: false }]] }; SPEC.ocean_end = { seconds: 14 };

const takes = {};
for (const [name, s] of Object.entries(SPEC)) {
  const { durs, promoVideo, segStarts, ...rest } = s;
  if (rest.app === 'pages') { const { inject, setup, each, ...pg } = rest; takes[name] = pg; continue; }
  const boot = `window.__TAKES = ${JSON.stringify(TAKES)}; window.__TAKE = ${JSON.stringify(name)};` + (segStarts ? `window.__SEGSTARTS = ${JSON.stringify(segStarts)};` : '');
  const body = boot + LEGACY + RIGS + (promoVideo ? PROMO : '');
  const start = promoVideo ? `() => { CLIP_RUN.start(window.__TAKE); __promo.load(${JSON.stringify(promoVideo)}, { silent: true, durs: ${JSON.stringify(durs)} }); }` : '() => CLIP_RUN.start(window.__TAKE)';
  const each = promoVideo ? 't => __promo.frame(Math.round(t * 30))' : 't => CLIP_RUN.each(t)';
  takes[name] = {
    ...rest,
    inject: [...(rest.inject || []), { before: 'window.__aeroStep = ', code: body + '\n' }],
    setup: start,
    each,
  };
}

export default {
  app: '../public',
  page: 'games/aero/index.html?shape=9x16&capture',
  size: [540, 960], dpr: 2,
  seed: 3,
  css: '#count { display: none !important; } #begin { left: 50% !important; bottom: auto !important; top: 58% !important; transform: translateX(-50%); }',
  settle: 1.5,
  ready: () => typeof window.__aeroActive === 'function' && !!window.__aeroActive(),
  annotate: () => (window.CLIP_RUN && CLIP_RUN.meta ? CLIP_RUN.meta() : null) || { ann: [] },
  takes,
};
