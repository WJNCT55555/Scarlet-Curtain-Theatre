import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2] === 'check' ? 'check' : 'build';
const projects = ['shared/tsconfig.json','programme/carmen/tsconfig.json','programme/the-red-and-the-black/tsconfig.json','theatre-lobby/tsconfig.json'];

for (const project of projects) {
  const compiler = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
  const args = [compiler, '-p', project];
  if (mode === 'check') args.push('--noEmit');
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
