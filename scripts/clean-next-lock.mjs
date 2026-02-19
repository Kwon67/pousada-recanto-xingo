import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const lockPath = resolve(process.cwd(), '.next/lock');

if (!existsSync(lockPath)) {
  process.exit(0);
}

let runningBuilds = 0;

try {
  const output = execSync('ps -eo args', { encoding: 'utf8' });
  runningBuilds = output
    .split('\n')
    .filter((line) => line.includes('next build'))
    .filter((line) => !line.includes('clean-next-lock.mjs')).length;
} catch {
  // If process listing fails, keep the lock file untouched.
  process.exit(0);
}

if (runningBuilds === 0) {
  rmSync(lockPath, { force: true });
  console.log('Removed stale .next/lock file.');
}
