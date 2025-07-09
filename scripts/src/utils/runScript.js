// @ts-check

const { spawn } = require('child_process');

/**
 * @param {string} command
 * @param {...string} args
 * @returns {Promise<number>}
 */
export async function runScript(command, ...args) {
  const spawnArgs = [command, ...args];

  return new Promise((resolve) => {
    spawn(process.execPath, spawnArgs, {
      cwd: process.cwd(),
      stdio: 'inherit',
    }).on('close', (code) => {
      resolve(code ?? -1);
    });
  });
}
