({
  style: 'ink',
  titleCard: { kicker: 'Aero', title: 'Four of me', hold: 3.0 },
  music: { level: 0.9, mix: 0.2, root: 45, drone: 0.1, pad: 0.08, piano: 0.16, boom: 0, beat: 0,
    chords: [{ at: 0, notes: [57, 64, 69, 71] }, { at: 13, notes: [55, 62, 67, 71] }, { at: 23, notes: [57, 64, 69, 72] }],
    notes: [{ at: 0.6, m: 76 }, { at: 14, m: 79, v: 0.4 }, { at: 17.5, m: 81, v: 0.5 }, { at: 30, m: 76, v: 0.4 }] },
  segments: [
    { say: 0, layers: [{ type: 'clip', clip: 'promo_v2', from: 0 }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'clip', clip: 'promo_v2', from: 6.5 }] },
    { say: 2, layers: [{ type: 'clip', clip: 'promo_v2', from: 13.8 }] },
    { say: 3, layers: [{ type: 'clip', clip: 'promo_v2', from: 17.2 }] },
    { say: 4, layers: [{ type: 'clip', clip: 'promo_v2', from: 22.9 }] },
    { say: 5, tail: 1.2, layers: [{ type: 'clip', clip: 'ocean', from: 0 }, { type: 'end', dim: 0.3, title: null, lines: [{ text: 'After a reel by @snaptic_', italic: true, y: 1060 }] }] },
  ],
})
