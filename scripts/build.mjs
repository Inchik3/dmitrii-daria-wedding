import { mkdirSync, copyFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const source = join(from, name);
    const target = join(to, name);
    if (statSync(source).isDirectory()) copyDir(source, target);
    else copyFileSync(source, target);
  }
}

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
copyFileSync('index.html', 'dist/index.html');
copyDir('src', 'dist/src');
copyDir('public/original-assets', 'dist/original-assets');
console.log('build ok');
