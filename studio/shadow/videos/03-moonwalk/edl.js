({
  style: 'ink',
  titleCard: { kicker: 'Devlog · Aero', title: 'The moonwalk', hold: 3.0 },
  music: { level: 0.9, mix: 0.18, root: 45, drone: 0.1, pad: 0.07, piano: 0, boom: 0, beat: 0,
    chords: [{ at: 0, notes: [57, 64, 69, 71] }, { at: 13, notes: [53, 60, 65, 69] }, { at: 26, notes: [55, 62, 67, 71] }, { at: 39, notes: [57, 64, 69, 72] }] },
  segments: [
    { say: 0, layers: [{ type: 'clip', clip: 'walk_before', from: 0 }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'split', top: 0, h: 960, a: { clip: 'walk_before', from: 'cont', fy: 0.2, label: 'before' }, b: { clip: 'walk_after', from: 0, fy: 0.2, label: 'after' } }] },
    { say: 2, layers: [{ type: 'clip', clip: 'walk_before', from: 2, ann: false }, { type: 'graph', title: 'How fast the planted foot slides', unit: 'm/s', dur: 4, h: 470, ymax: 4,
      series: [{ label: 'before', clip: 'walk_before', from: 2, f: m => m.fs }, { label: 'after', clip: 'walk_after', from: 2, f: m => m.fs }] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 3, layers: [{ type: 'clip', clip: 'walk_after', from: 1.5 }, { type: 'code', snip: ['function footTarget(u, g) {', 6] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 4, layers: [{ type: 'clip', clip: 'ik_close', from: 0 }, { type: 'code', snip: ['const d = Math.min(THIGH + SHIN', 5] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 5, layers: [{ type: 'clip', clip: 'walk_after', from: 'cont', ann: false },
      { type: 'stat', label: 'foot slip while walking', from: 95, to: 0.6, dp: 1, unit: '%', top: 1180, note: '95% with the old gait · 0.6% now' }] },
    { say: 6, tail: 1.2, layers: [{ type: 'clip', clip: 'run_after', from: 0 }] },
    { say: 7, tail: 1.2, layers: [{ type: 'clip', clip: 'ocean', from: 0 }, { type: 'end', dim: 0.3, title: null, lines: [{ text: 'After a reel by @snaptic_', italic: true, y: 1060 }] }] },
  ],
})
