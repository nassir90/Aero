({
  style: 'ink',
  thumbnail: 1.0,
  titleCard: { kicker: "Part 2 of 2", title: "Are gamedevs cooked?", hold: 3.0 },
  music: { level: 0.9, mix: 0.18, root: 45, drone: 0.1, pad: 0.07, piano: 0, boom: 0, beat: 0, chords: [{ at: 0.0, notes: [57, 64, 69, 71] }, { at: 10.5, notes: [53, 60, 65, 69] }, { at: 21.0, notes: [55, 62, 67, 71] }, { at: 31.6, notes: [57, 64, 69, 72] }] },
  segments: [
    { say: 0, lead: 1.4, layers: [{ type: 'clip', clip: 't13', from: 0 }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'clip', clip: 't13', from: 'cont' }, { type: 'stat', label: 'lines in the game’s one file', from: 0, to: 1797, top: 300 }] },
    { say: 2, layers: [{ type: 'split', top: 0, h: 960, a: { clip: 's13', from: 0, fy: 0.5, label: 'before' }, b: { clip: 't13', from: 'cont', fy: 0.5, label: 'after' } }] },
    { say: 3, layers: [{ type: 'clip', clip: 't13', from: 'cont' }] },
    { say: 4, layers: [{ type: 'clip', clip: 't13', from: 'cont' }] },
    { say: 5, layers: [{ type: 'clip', clip: 't13', from: 'cont' }] },
    { dur: 4.6, layers: [{ type: 'clip', clip: 't13', from: 'cont' }, { type: 'end', title: 'Aero', titleStyle: { text: 'AERO', font: '700 104px Silkscreen', css: 'https://fonts.googleapis.com/css2?family=Silkscreen:wght@700&display=swap', bg: '#f2f1f6', spacing: 0.06, pad: [0.5, 1.1], y: 630 }, credits: ['After a reel by @snaptic_', 'Playable in your browser'], link: 'mpts.ie/games/aero' }] },
  ],
})
