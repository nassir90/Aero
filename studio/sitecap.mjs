import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [timingFile, out, ...flags] = process.argv.slice(2);
const URL = process.env.SITE_URL || 'http://localhost:8793/games/aero/';
const CLIPS = process.env.CLIP_FRAMES || 'http://localhost:8794/clipframes';
const COUNTS = JSON.parse(process.env.CLIP_COUNTS || '{}');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const timing = JSON.parse(fs.readFileSync(timingFile, 'utf8'));
const sample = flags.includes('--sample');
fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--mute-audio'] });
const page = await browser.newPage();
await page.setViewport({ width: 432, height: 768, deviceScaleFactor: 2.5, isMobile: true, hasTouch: true });
page.on('pageerror', e => console.error('pageerror', e.message));
await page.goto(URL + '#s0', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 1500));
const frames = await page.evaluate(async (tm) => {
  window.requestAnimationFrame = () => 0;
  document.documentElement.style.scrollBehavior = 'auto';
  const vids = [...document.querySelectorAll('.clip video')].map(v => { v.pause(); const img = new Image(); img.className = 'sc-vf'; img.dataset.name = v.src.split('/').pop().replace('.mp4', ''); img.src = v.poster; v.replaceWith(img); return img; });
  const css = document.createElement('style');
  css.textContent = `.clip img.sc-vf { width: 100%; aspect-ratio: 1; display: block; border-radius: 6px; box-shadow: 0 18px 40px rgba(16,40,110,.35), 0 0 0 1px rgba(255,255,255,.6); }
#sc-cap { position: fixed; left: 6%; right: 6%; bottom: 9%; z-index: 99; text-align: center; text-wrap: balance; pointer-events: none; }
#sc-cap span { font: 800 22px/1.5 'Open Sans', sans-serif; color: #fff; background: rgba(14,12,40,.72); padding: .14em .5em; box-decoration-break: clone; -webkit-box-decoration-break: clone; border-radius: .3em; }
#sc-end { position: fixed; inset: 0; z-index: 100; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 22px; background: linear-gradient(180deg, #1b75be 0, #1b75be 38%, rgba(27,117,190,0) 72%), #5b9ee6 url(assets/sky_tall.jpg) center bottom / cover; }
#sc-end .pl { font: 700 64px/1 Silkscreen, monospace; color: #000; background: #f2f1f6; padding: .25em .5em; mix-blend-mode: screen; }
#sc-end p { margin: 18px 0 0; font: 700 18px Silkscreen, monospace; color: #fff; background: rgba(16,24,70,.78); padding: .4em .7em; }
#sc-end .url { font: 700 22px/1 Silkscreen, monospace; color: #000; background: #f2f1f6; padding: .45em .7em; mix-blend-mode: screen; }`;
  document.head.appendChild(css);
  const cap = document.createElement('div'); cap.id = 'sc-cap'; document.body.appendChild(cap);
  const end = document.createElement('div'); end.id = 'sc-end'; end.innerHTML = '<div class="pl">AERO</div><p>you can play it at</p><div class="url">mpts.ie/games/aero</div>'; document.body.appendChild(end);
  const center = el => { const r = el.getBoundingClientRect(); return Math.max(0, r.top + scrollY - 36); };
  const stage = document.getElementById('stage');
  const max = document.documentElement.scrollHeight - innerHeight;
  window.__sc = { tm, vids, cap, end, stops: [0, center(vids[0]) * .55, center(vids[0]), center(vids[1]), center(vids[2]), center(vids[3]), max, max] };
  return Math.round(tm.total * 30);
}, timing);
await page.evaluate((c, n) => { __sc.base = c; __sc.counts = n; }, CLIPS, COUNTS);
fs.writeFileSync(path.join(out, 'timeline.json'), JSON.stringify({ frames, timing }, null, 1));
const picks = sample ? new Set(timing.starts.map(s => Math.round((s + 1.4) * 30))) : null;
const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  await page.evaluate(async (i) => {
    const { tm, vids, cap, end, stops } = __sc, t = i / 30, ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
    let k = tm.starts.length - 1; while (k > 0 && tm.starts[k] > t + 1e-6) k--;
    const lt = t - tm.starts[k], from = k ? stops[k - 1] : 0, to = stops[k], dur = k === 1 ? 4.5 : 1.3;
    scrollTo(0, from + (to - from) * ease(lt / dur));
    const txt = tm.lines[k]; if (cap.dataset.k !== String(k)) { cap.dataset.k = k; cap.innerHTML = k === tm.starts.length - 1 ? '' : `<span>${txt}</span>`; }
    end.style.display = k === tm.starts.length - 1 ? 'flex' : 'none';
    await Promise.all(vids.map(v => { const r = v.getBoundingClientRect(); if (r.bottom < -50 || r.top > innerHeight + 50) return 0; const n = __sc.counts[v.dataset.name] || 1; v.src = `${__sc.base}/${v.dataset.name}/f${String(1 + (i % n)).padStart(4, '0')}.jpg`; return v.decode().catch(() => 0); }));
    if (k === 6) { const f = document.getElementById('frame'), r = f.getBoundingClientRect(), ov = document.getElementById('titleOv');
      if (ov) { const x = r.left + r.width * (.25 + .5 * ease(lt / 3)), y = r.top + r.height * .72; ov.dispatchEvent(new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true }));
        if (Math.round(lt * 30) === 45) ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, bubbles: true })); } }
    __aeroStep(1 / 30);
  }, i);
  if (picks && !picks.has(i)) continue;
  await page.screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 90 });
  if (i % 300 === 0) console.log('site', i, '/', frames, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
console.log('site done', frames, ((Date.now() - t0) / 1000).toFixed(0) + 's');
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 4000))]);
process.exit(0);
