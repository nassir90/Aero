({
  style: 'ink',
  titleCard: { kicker: 'Devlog · Aero', title: 'Meet in the middle', hold: 3.0 },
  music: { level: 0.9, mix: 0.18, root: 45, drone: 0.1, pad: 0.07, piano: 0, boom: 0, beat: 0,
    chords: [{ at: 0, notes: [57, 64, 69, 71] }, { at: 13, notes: [53, 60, 65, 69] }, { at: 27, notes: [55, 62, 67, 71] }, { at: 45, notes: [57, 64, 69, 72] }] },
  segments: [
    { say: 0, layers: [{ type: 'clip', clip: 'merge_now', from: 0 }], sfx: [{ at: 0.1, type: 'whoosh', vol: 0.3 }] },
    { say: 1, layers: [{ type: 'clip', clip: 'merge_old_lead', from: 0 }] },
    { say: 2, layers: [{ type: 'clip', clip: 'merge_old_lead2', from: 0 }, { type: 'code', snip: ['const keep = b === lead', 2, 0, '53a2df9'] }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 3, layers: [{ type: 'split', top: 0, h: 960, a: { clip: 'merge_old_split', from: 0, fy: 0.5, label: 'before' }, b: { clip: 'merge_avg', from: 0, fy: 0.5, label: 'after' } }] },
    { say: 4, layers: [{ type: 'clip', clip: 'merge_now', from: 'cont' }, { type: 'inkdraw', fn: (g, tl, K) => {
      const cx = 540, cy = 760, R = 290, a = K.ease(tl / 0.5); if (a <= 0) return;
      const arrow = (deg, len, w) => { const r = deg * Math.PI / 180, x = cx + Math.sin(r) * len, y = cy - Math.cos(r) * len, ang = Math.atan2(y - cy, x - cx);
        g.lineWidth = w; g.beginPath(); g.moveTo(cx, cy); g.lineTo(x, y); g.stroke();
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(ang - .45) * 20, y - Math.sin(ang - .45) * 20); g.lineTo(x - Math.cos(ang + .45) * 20, y - Math.sin(ang + .45) * 20); g.fill(); };
      const label = (t, x, y, grp, al = 'center') => { g.textAlign = al; g.fillText(t, x, y); K.tbox(grp, g, t, x, y, 36); };
      g.save(); g.globalAlpha = a; g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineCap = 'round'; g.font = `400 36px ${K.SERIF}`;
      g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
      label('north', cx, cy - R - 24, 'dia.n'); label('south', cx, cy + R + 52, 'dia.s');
      const b = K.ease((tl - 1.6) / 0.6);
      if (b > 0) { g.globalAlpha = a * b; arrow(350, R - 10, 4); arrow(10, R - 10, 4); label('350°', cx - 150, cy - R + 60, 'dia.350', 'right'); label('10°', cx + 150, cy - R + 60, 'dia.10', 'left'); }
      const c = K.ease((tl - 6.2) / 1.6);
      if (c > 0) { g.globalAlpha = a; arrow(c * 180, R - 10, 6); g.globalAlpha = a * K.ease((tl - 7.4) / 0.5); label('(350 + 10) ÷ 2 = 180', cx, cy + R + 130, 'dia.eq'); }
      g.restore(); } }] },
    { say: 5, layers: [{ type: 'clip', clip: 'merge_now', from: 'cont' }, { type: 'code', snip: ['const circMean = a =>', 1] }, { type: 'inkdraw', fn: (g, tl, K) => {
      const bx = 540, by = 1180, L = 330, a = K.ease(tl / 0.5); if (a <= 0) return;
      const seg = (x0, y0, deg, len, w) => { const r = deg * Math.PI / 180, x = x0 + Math.sin(r) * len, y = y0 - Math.cos(r) * len, ang = Math.atan2(y - y0, x - x0);
        g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke();
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(ang - .45) * 20, y - Math.sin(ang - .45) * 20); g.lineTo(x - Math.cos(ang + .45) * 20, y - Math.sin(ang + .45) * 20); g.fill(); return [x, y]; };
      g.save(); g.globalAlpha = a; g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineCap = 'round'; g.font = `400 36px ${K.SERIF}`;
      const [x1, y1] = seg(bx, by, 350, L, 4);
      const k = K.ease((tl - 1.2) / 1.4); if (k > 0) seg(x1, y1, 10, L * k, 4);
      const s = K.ease((tl - 3.0) / 0.8);
      if (s > 0) { const tip = [x1 + Math.sin(10 * Math.PI / 180) * L, y1 - Math.cos(10 * Math.PI / 180) * L]; g.globalAlpha = a * s; g.setLineDash([14, 10]); g.lineWidth = 5; g.beginPath(); g.moveTo(bx, by); g.lineTo(tip[0], tip[1]); g.stroke(); g.setLineDash([]);
        g.textAlign = 'left'; const t = 'the sum points north'; g.fillText(t, bx + 60, tip[1] + 40); K.tbox('dia.sum', g, t, bx + 60, tip[1] + 40, 36); }
      g.restore(); } }], sfx: [{ at: 0.3, type: 'blip' }] },
    { say: 6, layers: [{ type: 'clip', clip: 'merge_close', from: 0 }] },
    { say: 7, tail: 1.2, layers: [{ type: 'clip', clip: 'ocean', from: 0 }, { type: 'end', dim: 0.3, title: null, lines: [{ text: 'After a reel by @snaptic_', italic: true, y: 1060 }] }] },
  ],
})
