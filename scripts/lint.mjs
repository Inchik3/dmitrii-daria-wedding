import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['index.html', 'src', 'scripts'];
const problems = [];

function files(entry) {
  const st = statSync(entry);
  if (st.isFile()) return [entry];
  return readdirSync(entry).flatMap((name) => files(join(entry, name)));
}

for (const root of roots.flatMap(files)) {
  if (!/\.(html|css|js|mjs|ts)$/.test(root)) continue;
  const text = readFileSync(root, 'utf8');
  if (text.includes('\u0000')) problems.push(`${root}: contains NUL byte`);
  if (/\t/.test(text)) problems.push(`${root}: contains tab indentation`);
  if (/[ \t]$/m.test(text)) problems.push(`${root}: contains trailing whitespace`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('lint ok');
