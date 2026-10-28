import type { SpawnOptions } from 'node:child_process';
import spawn from 'cross-spawn';
import { PackageContext } from '../pkgContext.ts';
import os from 'node:os';

export const yarnVerb = os.platform() === 'win32' ? 'yarn.cmd' : 'yarn';

const cmdToModule: Record<string, string> = {
  tsc: 'typescript',
};

/**
 * Get the path to a bin entrypoint for a js package.
 */
function getBinPath(command: string): string | undefined {
  const wdRoot = PackageContext.init(process.cwd());
  const cmdModule = cmdToModule[command] ?? command;
  return wdRoot.openModule(cmdModule).getBinPath(command);
}

function resolveScript(command: string, args: string[], options?: SpawnOptions): [string, string[], SpawnOptions] {
  const binPath = getBinPath(command);
  const verb = binPath ? process.execPath : yarnVerb;
  const spawnArgs = binPath ? [binPath, ...args] : ['exec', command, ...args];
  const spawnOptions: SpawnOptions = {
    cwd: process.cwd(),
    stdio: 'inherit',
    ...options,
  };
  return [verb, spawnArgs, spawnOptions];
}

export async function runScript(command: string, args: string[], options?: SpawnOptions): Promise<number> {
  const [verb, spawnArgs, spawnOptions] = resolveScript(command, args, options);

  return new Promise((resolve, reject) => {
    spawn(verb, spawnArgs, spawnOptions)
      .on('error', reject)
      .on('close', (code) => {
        resolve(code ?? -1);
      });
  });
}

/**
 * Run a script like {@link runScript}, but capture its standard output instead of inheriting it.
 * Standard error still streams to this process so failures remain visible.
 */
export async function captureScript(command: string, args: string[], options?: SpawnOptions): Promise<{ code: number; stdout: string }> {
  const [verb, spawnArgs, spawnOptions] = resolveScript(command, args, options);

  return new Promise((resolve, reject) => {
    const child = spawn(verb, spawnArgs, { ...spawnOptions, stdio: ['ignore', 'pipe', 'inherit'] });
    let stdout = '';
    child.stdout?.setEncoding('utf8').on('data', (chunk: string) => {
      stdout += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code: code ?? -1, stdout });
    });
  });
}

export async function runYarn(command: string, ...args: string[]): Promise<number> {
  const verb = yarnVerb;
  const spawnArgs = [command, ...args];
  return new Promise((resolve, reject) => {
    spawn(verb, spawnArgs, {
      cwd: process.cwd(),
      stdio: 'inherit',
    })
      .on('error', reject)
      .on('close', (code) => {
        resolve(code ?? -1);
      });
  });
}
