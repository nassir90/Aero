({
  style: 'ink',
  thumbnail: 1.0,
  titleCard: { kicker: "Devlog \u00b7 Aero", title: "The moonwalk", hold: 3.0 },
  music: { level: 0.9, mix: 0.18, root: 45, drone: 0.1, pad: 0.07, piano: 0, boom: 0, beat: 0, chords: [{ at: 0.0, notes: [57, 64, 69, 71] }, { at: 12.8, notes: [53, 60, 65, 69] }, { at: 25.5, notes: [55, 62, 67, 71] }, { at: 38.3, notes: [57, 64, 69, 72] }] },
  segments: [
    { say: 0, lead: 1.4, layers: [{ type: 'clip', clip: 'walk_before', from: 0 }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'split', top: 0, h: 960, a: { clip: 'walk_before', from: 'cont', fy: 0.2, label: 'before' }, b: { clip: 'walk_after', from: 0, fy: 0.2, label: 'after' } }] },
    { say: 2, layers: [{ type: 'clip', clip: 'walk_before', from: 2, ann: false }, { type: 'graph', title: 'How fast the planted foot slides', unit: 'm/s', dur: 4, h: 470, ymax: 4, series: [{ label: 'before', clip: 'walk_before', from: 2, f: m => m.footSpeed }, { label: 'after', clip: 'walk_after', from: 2, f: m => m.footSpeed }] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 3, layers: [{ type: 'clip', clip: 'walk_after', from: 1.5 }] },
    { say: 4, layers: [{ type: 'clip', clip: 'ik_close', from: 0 }] },
    { say: 5, layers: [{ type: 'clip', clip: 'walk_after', from: 'cont', ann: false }, { type: 'stat', label: 'foot slip while walking', from: 95, to: 0.6, dp: 1, unit: '%', top: 1180, note: '95% with the old gait · 0.6% now' }] },
    { say: 6, layers: [{ type: 'clip', clip: 'run_after', from: 0 }] },
    { dur: 4.6, layers: [{ type: 'clip', clip: 'run_after', from: 'cont' }, { type: 'end', title: 'Aero', titleStyle: { text: 'AERO', font: '700 104px Silkscreen', css: 'https://fonts.googleapis.com/css2?family=Silkscreen:wght@700&display=swap', bg: '#f2f1f6', spacing: 0.06, pad: [0.5, 1.1], y: 630 }, credits: ['After a reel by @snaptic_', 'Playable in your browser'], link: 'mpts.ie/games/aero' }] },
  ],
})
