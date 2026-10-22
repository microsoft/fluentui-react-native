import { spawn } from 'node:child_process';
import path from 'node:path';

describe('neutral desktop harness contracts', () => {
  test.each([
    'config',
    'reporting',
    'commands',
    'transport',
    'delegated-cli',
    'services',
    'owned-service',
    'wdio',
    'typescript',
    'retry',
    'hook-failure',
    'config-hook-failure',
    'config-load-failure',
    'crash',
    'bail',
  ])(
    '%s contract',
    async (mode) => {
      const result = await runContract(mode);
      expect(result).toEqual({ mode, passed: true });
    },
    120_000,
  );
});

function runContract(mode: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'contracts.contract.cjs'), mode], { stdio: ['ignore', 'pipe', 'pipe'] });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code !== 0) reject(new Error(Buffer.concat(stderr).toString('utf8') || Buffer.concat(stdout).toString('utf8')));
      else {
        try {
          resolve(JSON.parse(Buffer.concat(stdout).toString('utf8')));
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
