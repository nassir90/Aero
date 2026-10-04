({
  style: 'ink',
  thumbnail: 1.0,
  titleCard: { kicker: "Part 1 of 2", title: "Are gamedevs cooked?", hold: 3.0 },
  music: { level: 0.9, mix: 0.18, root: 45, drone: 0.1, pad: 0.07, piano: 0, boom: 0, beat: 0, chords: [{ at: 0.0, notes: [57, 64, 69, 71] }, { at: 10.1, notes: [53, 60, 65, 69] }, { at: 20.1, notes: [55, 62, 67, 71] }, { at: 30.2, notes: [57, 64, 69, 72] }] },
  segments: [
    { say: 0, lead: 1.4, layers: [{ type: 'clip', clip: 't12', from: 0 }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'clip', clip: 't12', from: 'cont' }] },
    { say: 2, layers: [{ type: 'clip', clip: 's12', from: 0 }] },
    { say: 3, layers: [{ type: 'clip', clip: 's12', from: 'cont' }] },
    { say: 4, layers: [{ type: 'clip', clip: 't12', from: 'cont' }, { type: 'stat', label: 'versions', from: 1, to: 16, top: 300 }] },
    { say: 5, tail: 1.2, layers: [{ type: 'clip', clip: 't12', from: 'cont' }, { type: 'end', title: 'Aero', credits: ['After a reel by @snaptic_', 'Playable in your browser'], link: 'mpts.ie/games/aero' }] },
  ],
})
