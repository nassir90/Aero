({
  style: 'ink',
  titleCard: { kicker: 'Devlog · Aero', title: 'The site', hold: 3.0 },
  music: { level: 0.9, mix: 0.18, root: 45, drone: 0.1, pad: 0.07, piano: 0, boom: 0, beat: 0,
    chords: [{ at: 0, notes: [57, 64, 69, 71] }, { at: 13, notes: [53, 60, 65, 69] }, { at: 27, notes: [55, 62, 67, 71] }, { at: 40, notes: [57, 64, 69, 72] }] },
  segments: [
    { say: 0, layers: [{ type: 'clip', clip: 'site_now_top', from: 0 }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'clip', clip: 'site_v1', from: 0 }] },
    { say: 2, layers: [{ type: 'clip', clip: 'site_v2', from: 0 }, { type: 'code', snip: ['const QS = new URLSearchParams', 2] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 3, layers: [{ type: 'clip', clip: 'sky_edge', from: 0 }] },
    { say: 4, layers: [{ type: 'clip', clip: 'sky_seam', from: 0 }] },
    { say: 5, layers: [{ type: 'clip', clip: 'sky_mask', from: 0 }, { type: 'code', snip: ['html:not(.capture) body {', 3] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 6, layers: [{ type: 'clip', clip: 'site_bottom', from: 0 }, { type: 'code', snip: ["if (!CAPTURE && 'IntersectionObserver'", 3] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 7, layers: [{ type: 'clip', clip: 'site_bottom', from: 'cont' }, { type: 'stat', label: 'lines in index.html', from: 0, to: 1797, top: 230, note: 'html, css and javascript in one file' }] },
    { say: 8, tail: 1.2, layers: [{ type: 'clip', clip: 'ocean', from: 0 }, { type: 'end', dim: 0.3, title: null, lines: [{ text: 'After a reel by @snaptic_', italic: true, y: 1060 }] }] },
  ],
})
