import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const behavior = readFileSync('src/scripts/local-behavior.js', 'utf8');

const requiredTexts = [
  'Дмитрий &amp; Дарья',
  'приглашают Вас на свадьбу',
  'Дорогие гости!',
  'Август 2026',
  'Дресс-код',
  'Опросник',
  'Место проведения',
  'До встречи на свадьбе!',
  'Понятно',
];

const missing = requiredTexts.filter((text) => !html.includes(text));
if (missing.length) {
  console.error(`Missing required text: ${missing.join(', ')}`);
  process.exit(1);
}

const requiredControls = ['Я приду', 'Маршрут', 'Отправить ответ', 'Открыть на Яндекс Картах'];
const absentControls = requiredControls.filter((text) => !html.includes(text));
if (absentControls.length) {
  console.error(`Missing controls: ${absentControls.join(', ')}`);
  process.exit(1);
}

if (!html.includes('onclick="svdOpenEnvelope()"')) {
  console.error('Envelope inline click hook is missing');
  process.exit(1);
}

if (!behavior.includes('window.svdOpenEnvelope = closeEnvelope') || !behavior.includes('#svd-env')) {
  console.error('Envelope open behavior is not wired to #svd-env');
  process.exit(1);
}

if (!behavior.includes("new URL('../../original-assets/be-my-baby.mp3', import.meta.url).href") || !html.includes('id="svd-speaker"')) {
  console.error('Music control is not wired');
  process.exit(1);
}

if (!behavior.includes('function startSilkBackground') || !behavior.includes('requestAnimationFrame(render)')) {
  console.error('Animated silk background is not wired');
  process.exit(1);
}

const removedTexts = [
  ['Реги', 'страция'].join(''),
  ['реги', 'страцию'].join(''),
  ['Коммунисти', 'ческая'].join(''),
  ['13', ':00'].join(''),
  ['12', ':45'].join(''),
  ['15', ':45'].join(''),
  ['answer_', '3016'].join(''),
  ['arrival', '_time'].join(''),
  ['Открыть ', 'реги', 'страцию'].join(''),
];
const oldMentions = removedTexts.filter((text) => html.includes(text) || behavior.includes(text));
if (oldMentions.length) {
  console.error(`Old registration details are still present: ${oldMentions.join(', ')}`);
  process.exit(1);
}

console.log('test ok');
