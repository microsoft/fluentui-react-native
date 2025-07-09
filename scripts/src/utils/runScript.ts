// @ts-check

import { spawn } from 'child_process';
import * as os from 'os';

const BASE_COMMAND = os.platform() === 'win32' ? 'yarn.cmd' : 'yarn';
const USE_SHELL = os.platform() === 'win32' && (BASE_COMMAND.endsWith('.bat') || BASE_COMMAND.endsWith('.cmd'));

/**
 * @param {string} command
 * @param {...string} args
 * @returns {Promise<number>}
 */
export async function runScript(command, ...args) {
  const spawnArgs = [command, ...args];
  return new Promise((resolve) => {
    spawn(BASE_COMMAND, spawnArgs, {
      shell: USE_SHELL,
      cwd: process.cwd(),
      stdio: 'inherit',
    }).on('close', (code) => {
      resolve(code ?? -1);
    });
  });
}
