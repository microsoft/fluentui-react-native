// @ts-check

import { spawn } from 'child_process';
import path from 'path';
import { getProjectRoot } from './projectRoot.js';

/** @type {Record<string, string>} */
const cmdToModule = {
  tsc: 'typescript',
};

/**
 * Get the path to a bin entrypoint for a js package.
 * @param {string} command
 * @returns {string}
 */
function getBinPath(command) {
  const require = getProjectRoot().require;
  const cmdModule = cmdToModule[command] ?? command;
  const pkgJsonPath = require.resolve(`${cmdModule}/package.json`, {
    paths: [process.cwd()],
  });
  if (!pkgJsonPath) {
    throw new Error(`Could not find package.json for command: ${command}`);
  }
  const pkgJson = require(pkgJsonPath);
  const pkgBinPath = pkgJson.bin && pkgJson.bin[command];
  if (!pkgBinPath) {
    throw new Error(`Command "${command}" not found in package.json of ${cmdModule}`);
  }
  return path.join(path.dirname(pkgJsonPath), pkgBinPath);
}

/**
 * @param {string} command
 * @param {...string} args
 * @returns {Promise<number>}
 */
export async function runScript(command, ...args) {
  const spawnArgs = [await getBinPath(command), ...args];

  return new Promise((resolve) => {
    spawn(process.execPath, spawnArgs, {
      cwd: process.cwd(),
      stdio: 'inherit',
    }).on('close', (code) => {
      resolve(code ?? -1);
    });
  });
}
