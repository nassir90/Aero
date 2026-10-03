import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const here = path.dirname(fileURLToPath(import.meta.url));
const SINK = process.env.SINK || 'http://127.0.0.1:8785';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const src = fs.readFileSync(path.join(here, 'clips.js'), 'utf8');
const box = { window: {} }; vm.runInNewContext(src, box);
const DEFS = box.window.CLIP_DEFS;
const names = process.argv.slice(2).flatMap(a => a.split(',')).filter(Boolean);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
  args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
page.on('pageerror', e => console.error('pageerror', e.message));
for (const name of names) {
  const d = DEFS[name]; if (!d) { console.error('no clip', name); continue; }
  const W = d.w || 1080, H = d.h || 1920, dpr = d.dpr || 1, n = Math.round(d.dur * 30), out = path.join(here, 'clips', name);
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  await page.setViewport({ width: Math.round(W / dpr), height: Math.round(H / dpr), deviceScaleFactor: dpr, isMobile: !!d.mobile, hasTouch: !!d.mobile });
  await page.goto(SINK + d.url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 1500));
  await page.addScriptTag({ content: src });
  await page.evaluate(nm => window.CLIP_RUN.start(nm), name);
  const meta = [], t0 = Date.now();
  for (let f = 0; f < n; f++) {
    meta.push(await page.evaluate(k => window.CLIP_RUN.frame(k), f));
    await page.screenshot({ path: path.join(out, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 90 });
  }
  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ fps: 30, w: W, h: H, frames: meta }));
  console.log(name, n, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 4000))]);
process.exit(0);
