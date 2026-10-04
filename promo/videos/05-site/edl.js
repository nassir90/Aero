({
  style: 'ink',
  thumbnail: 1.0,
  titleCard: { kicker: "Devlog \u00b7 Aero", title: "The site", hold: 3.0 },
  music: { level: 0.9, mix: 0.18, root: 45, drone: 0.1, pad: 0.07, piano: 0, boom: 0, beat: 0, chords: [{ at: 0.0, notes: [57, 64, 69, 71] }, { at: 12.6, notes: [53, 60, 65, 69] }, { at: 25.3, notes: [55, 62, 67, 71] }, { at: 37.9, notes: [57, 64, 69, 72] }] },
  segments: [
    { say: 0, lead: 1.4, layers: [{ type: 'clip', clip: 'sky_edge', from: 0, ann: false }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'clip', clip: 'site_v1', from: 0 }] },
    { say: 2, layers: [{ type: 'clip', clip: 'site_v2', from: 0 }] },
    { say: 3, layers: [{ type: 'clip', clip: 'sky_edge', from: 'cont' }] },
    { say: 4, layers: [{ type: 'clip', clip: 'sky_seam', from: 0 }] },
    { say: 5, layers: [{ type: 'clip', clip: 'sky_mask', from: 0 }] },
    { say: 6, layers: [{ type: 'clip', clip: 'site_bottom', from: 0 }, { type: 'code', snip: ["if (!CAPTURE && 'IntersectionObserver'", 3] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 7, layers: [{ type: 'clip', clip: 'site_bottom', from: 'cont' }, { type: 'stat', label: 'lines in index.html', from: 0, to: 1797, top: 230, note: 'html, css and javascript in one file' }] },
    { dur: 4.6, layers: [{ type: 'clip', clip: 'site_bottom', from: 'cont' }, { type: 'end', title: 'Aero', titleStyle: { text: 'AERO', font: '700 104px Silkscreen', css: 'https://fonts.googleapis.com/css2?family=Silkscreen:wght@700&display=swap', bg: '#f2f1f6', spacing: 0.06, pad: [0.5, 1.1], y: 630 }, credits: ['After a reel by @snaptic_', 'Playable in your browser'], link: 'mpts.ie/games/aero' }] },
  ],
})
