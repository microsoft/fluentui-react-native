// @ts-check

import { spawn } from 'child_process';
import { getProjectRoot } from './projectRoot.js';
import os from 'os';

const yarnVerb = os.platform() === 'win32' ? 'yarn.cmd' : 'yarn';

/** @type {Record<string, string>} */
const cmdToModule = {
  tsc: 'typescript',
};

/**
 * Get the path to a bin entrypoint for a js package.
 * @param {string} command
 * @returns {string | undefined}
 */
function getBinPath(command) {
  const wdRoot = getProjectRoot(process.cwd());
  const cmdModule = cmdToModule[command] ?? command;
  return wdRoot.openModule(cmdModule).getBinPath(command);
}

/**
 * @param {string} command
 * @param {...string} args
 * @returns {Promise<number>}
 */
export async function runScript(command, ...args) {
  const binPath = getBinPath(command);
  const verb = binPath ? process.execPath : yarnVerb;
  const spawnArgs = binPath ? [binPath, ...args] : ['exec', ...args];

  return new Promise((resolve) => {
    spawn(verb, spawnArgs, {
      cwd: process.cwd(),
      stdio: 'inherit',
    }).on('close', (code) => {
      resolve(code ?? -1);
    });
  });
}
