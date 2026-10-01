import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const [name, timingFile, out, ...flags] = process.argv.slice(2);
const BASE = process.env.DEV_URL || 'http://localhost:8794/studio/dev.html';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const timing = JSON.parse(fs.readFileSync(timingFile, 'utf8'));
const sample = flags.includes('--sample');
fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1080,1920'] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('pageerror', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console', m.text()); });
await page.goto(BASE, { waitUntil: 'networkidle0' });
const info = await page.evaluate((n, tm) => __dev.load(n, tm), name, timing);
fs.writeFileSync(path.join(out, 'timeline.json'), JSON.stringify({ frames: info.frames, timing }, null, 1));
const picks = sample ? new Set(timing.starts.map(s => Math.round((s + .9) * 30)).concat(timing.starts.map((s, i) => Math.round(((timing.starts[i + 1] ?? timing.total) - .4) * 30)))) : null;
const t0 = Date.now();
for (let i = 0; i < info.frames; i++) {
  const url = await page.evaluate(k => __dev.frame(k), i);
  if (picks && !picks.has(i)) continue;
  fs.writeFileSync(path.join(out, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
  if (i % 300 === 0) console.log(name, i, '/', info.frames, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
console.log(name, 'done', info.frames, ((Date.now() - t0) / 1000).toFixed(0) + 's');
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 4000))]);
process.exit(0);
