({
  style: 'ink',
  music: { level: 0.9, mix: 0.2, root: 45, drone: 0.1, pad: 0.08, piano: 0.16, boom: 0, beat: 0,
    chords: [{ at: 0, notes: [57, 64, 69, 71] }, { at: 10, notes: [53, 60, 65, 69] }, { at: 20, notes: [55, 62, 67, 71] }, { at: 30, notes: [57, 64, 69, 72] }],
    notes: [{ at: 0.6, m: 76 }, { at: 9.8, m: 81, v: 0.4 }, { at: 24, m: 79, v: 0.4 }, { at: 31, m: 76, v: 0.5 }] },
  segments: [
    { say: 0, layers: [{ type: 'clip', clip: 'site_tour', from: 0 }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'clip', clip: 'site_tour', from: 'cont' }] },
    { say: 2, layers: [{ type: 'clip', clip: 'site_tour', from: 'cont' }] },
    { say: 3, layers: [{ type: 'clip', clip: 'site_tour', from: 'cont' }] },
    { say: 4, layers: [{ type: 'clip', clip: 'site_tour', from: 'cont' }] },
    { say: 5, layers: [{ type: 'clip', clip: 'site_tour', from: 'cont' }] },
    { say: 6, layers: [{ type: 'clip', clip: 'site_tour', from: 'cont' }] },
    { say: 7, tail: 1.2, layers: [{ type: 'clip', clip: 'ocean', from: 0 }, { type: 'end', dim: 0.3, title: null, lines: [{ text: 'After a reel by @snaptic_', italic: true, y: 1060 }] }] },
  ],
})
