import { spawn } from 'node:child_process';
import { getProjectRoot } from './projectRoot.ts';
import os from 'node:os';

export const yarnVerb = os.platform() === 'win32' ? 'yarn.cmd' : 'yarn';

const cmdToModule: Record<string, string> = {
  tsc: 'typescript',
};

/**
 * Get the path to a bin entrypoint for a js package.
 */
function getBinPath(command: string): string | undefined {
  const wdRoot = getProjectRoot(process.cwd());
  const cmdModule = cmdToModule[command] ?? command;
  return wdRoot.openModule(cmdModule).getBinPath(command);
}

export async function runScript(command: string, ...args: string[]): Promise<number> {
  const binPath = getBinPath(command);
  const verb = binPath ? process.execPath : yarnVerb;
  const spawnArgs = binPath ? [binPath, ...args] : ['exec', command, ...args];

  return new Promise((resolve) => {
    spawn(verb, spawnArgs, {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: verb.endsWith('.cmd') || verb.endsWith('.bat') ? true : undefined,
    }).on('close', (code) => {
      resolve(code ?? -1);
    });
  });
}

export async function runYarn(command: string, ...args: string[]): Promise<number> {
  const verb = yarnVerb;
  const spawnArgs = [command, ...args];
  return new Promise((resolve) => {
    spawn(verb, spawnArgs, {
      cwd: process.cwd(),
      stdio: 'inherit',
    }).on('close', (code) => {
      resolve(code ?? -1);
    });
  });
}
