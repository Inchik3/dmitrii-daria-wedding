import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const css = readFileSync('src/styles/original-local.css', 'utf8');
const data = readFileSync('src/data/original-content.ts', 'utf8');

for (const [name, text] of [['index.html', html], ['original-local.css', css], ['original-content.ts', data]]) {
  if (!text.trim()) throw new Error(`${name} is empty`);
}
if (!html.includes('src/scripts/local-behavior.js')) throw new Error('runtime script is not linked');
if (!css.includes('Heather Script Two') || !css.includes('Poiret One')) throw new Error('font faces are missing');
if (!data.includes('Дмитрий') || !data.includes('Дарья')) throw new Error('original content text is missing');
console.log('typecheck ok');
