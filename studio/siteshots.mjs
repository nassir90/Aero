import puppeteer from 'puppeteer-core';
const [base, out, ...names] = process.argv.slice(2);
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--mute-audio'] });
const page = await browser.newPage();
for (const n of names) {
  const [path, w, h, dpr] = n.split(',');
  await page.setViewport({ width: +w, height: +h, deviceScaleFactor: +dpr });
  await page.goto(`${base}/${path}`, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.querySelectorAll('video').forEach(v => { v.pause(); v.currentTime = 1.5; }));
  await new Promise(r => setTimeout(r, 1500));
  const file = `${out}/${path.split('/')[1]}_${w}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 88, fullPage: true });
  console.log(file);
}
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 3000))]);
process.exit(0);
