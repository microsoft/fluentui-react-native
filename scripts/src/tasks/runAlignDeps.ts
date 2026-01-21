import { scriptsDir } from '../utils/ispnpm.ts';
import { spawn } from 'node:child_process';
import { yarnVerb } from '../utils/runScript.js';

export async function runAlignDeps(targetDir: string, fixMode: boolean): Promise<number> {
  const spawnArgs = ['rnx-align-deps', '--no-unmanaged'];
  if (fixMode) {
    spawnArgs.push('--write');
  }
  spawnArgs.push(targetDir);
  return new Promise((resolve) => {
    spawn(yarnVerb, spawnArgs, {
      cwd: scriptsDir(),
      stdio: 'inherit',
    }).on('close', (code) => {
      resolve(code ?? -1);
    });
  });
}
