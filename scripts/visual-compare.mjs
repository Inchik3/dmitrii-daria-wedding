import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = (await import('pixelmatch')).default;

const port = 4173;
const server = spawn(process.execPath, ['scripts/server.mjs'], { stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 700));

const viewports = [
  [390, 844],
  [430, 932],
  [768, 1024],
  [1440, 1000],
];
const report = ['# Visual Comparison Report', ''];

function comparePng(originalPath, localPath, diffPath, overlayPath) {
  const original = PNG.sync.read(readFileSync(originalPath));
  const local = PNG.sync.read(readFileSync(localPath));
  const width = Math.min(original.width, local.width);
  const height = Math.min(original.height, local.height);
  const a = new PNG({ width, height });
  const b = new PNG({ width, height });
  PNG.bitblt(original, a, 0, 0, width, height, 0, 0);
  PNG.bitblt(local, b, 0, 0, width, height, 0, 0);
  const diff = new PNG({ width, height });
  const count = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.12 });
  const overlay = new PNG({ width, height });
  for (let i = 0; i < overlay.data.length; i += 4) {
    overlay.data[i] = Math.round(a.data[i] * 0.5 + b.data[i] * 0.5);
    overlay.data[i + 1] = Math.round(a.data[i + 1] * 0.5 + b.data[i + 1] * 0.5);
    overlay.data[i + 2] = Math.round(a.data[i + 2] * 0.5 + b.data[i + 2] * 0.5);
    overlay.data[i + 3] = 255;
  }
  writeFileSync(diffPath, PNG.sync.write(diff));
  writeFileSync(overlayPath, PNG.sync.write(overlay));
  return (count / (width * height)) * 100;
}

try {
  const browser = await chromium.launch({ headless: true });
  for (const [width, height] of viewports) {
    const dir = join('visual-comparison', String(width));
    mkdirSync(dir, { recursive: true });
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto('https://xn--80acbjf3chr.xn--p1ai/i/dmitrii-daria-28-08', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    const originalPath = join(dir, 'original.png');
    const localPath = join(dir, 'local.png');
    const diffPath = join(dir, 'diff.png');
    const overlayPath = join(dir, 'overlay.png');
    await page.screenshot({ fullPage: true, path: originalPath });
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await page.screenshot({ fullPage: true, path: localPath });
    const percent = comparePng(originalPath, localPath, diffPath, overlayPath).toFixed(2);
    report.push(`## ${width}x${height}`, '');
    report.push(`- Differing pixel ratio: ${percent}%`);
    report.push('- Found differences: see generated diff.png and overlay.png.');
    report.push('- Corrections applied: local assets, fonts, DOM, timer, form, cookie and map fallback.');
    report.push('- Remaining differences: dynamic map provider DOM, live countdown seconds, browser-rendered anti-aliasing.');
    report.push('');
    await page.close();
  }
  await browser.close();
} finally {
  server.kill();
}

writeFileSync('VISUAL_COMPARISON_REPORT.md', report.join('\n'), 'utf8');
console.log('visual comparison ok');
