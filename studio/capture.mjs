import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const [name, shape = '9x16', out = `frames/${name}`, ...flags] = process.argv.slice(2);
const SIZE = { '9x16': [1080, 1920], '1x1': [1080, 1080] }[shape];
const BASE = process.env.AERO_URL || 'http://localhost:8793/games/aero/';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const here = path.dirname(fileURLToPath(import.meta.url));
const limit = flags.includes('--sample') ? 12 : Infinity;
const upto = flags.includes('--first') ? 60 : Infinity;

fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true,
  args: [...(process.env.GPU === '0' ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist']), '--hide-scrollbars', '--mute-audio', `--window-size=${SIZE[0]},${SIZE[1]}`] });
const page = await browser.newPage();
await page.setViewport({ width: SIZE[0], height: SIZE[1], deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('pageerror', e.message));
await page.goto(`${BASE}?shape=${shape}&capture#s0`, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 1500));
await page.addScriptTag({ path: path.join(here, 'promo.js') });
const info = await page.evaluate((n, silent) => __promo.load(n, { silent }), name, shape === '1x1');
fs.writeFileSync(path.join(out, 'timeline.json'), JSON.stringify(info, null, 1));
const n = Math.min(info.frames, upto);
const pick = limit === Infinity ? null : new Set(Array.from({ length: limit }, (_, k) => Math.round(k * (n - 1) / (limit - 1))));
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  await page.evaluate(k => __promo.frame(k), i);
  if (pick && !pick.has(i)) continue;
  await page.screenshot({ path: path.join(out, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 90 });
  if (i % 150 === 0) console.log(name, i, '/', n, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
console.log(name, 'done', n, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's');
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 4000))]);
process.exit(0);
