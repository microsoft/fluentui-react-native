import { scriptsDir } from '../utils/ispnpm.ts';
import { spawn } from 'node:child_process';
import { yarnVerb } from '../utils/runScript.js';
import path from 'node:path';

export async function runAlignDeps(targetDir: string, fixMode: boolean): Promise<number> {
  const spawnArgs = ['exec', 'rnx-align-deps', '--no-unmanaged'];
  if (fixMode) {
    spawnArgs.push('--write');
  }
  spawnArgs.push(path.resolve(targetDir));
  return new Promise((resolve) => {
    spawn(yarnVerb, spawnArgs, {
      cwd: scriptsDir(),
      stdio: 'inherit',
      shell: true,
    }).on('close', (code) => {
      resolve(code ?? -1);
    });
  });
}
