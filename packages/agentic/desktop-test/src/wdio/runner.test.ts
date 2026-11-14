import { spawn } from 'node:child_process';
import path from 'node:path';

describe('protected standalone WDIO runner', () => {
  test.each(['handoff', 'worker-crash'] as const)(
    '%s drains scoped worker authority without persisting credentials',
    async (mode) => {
      const result = await new Promise<unknown>((resolve, reject) => {
        const child = spawn(process.execPath, ['--throw-deprecation', path.join(__dirname, 'runner.contract.cjs'), mode], {
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];
        child.stdout.on('data', (data: Buffer) => stdout.push(data));
        child.stderr.on('data', (data: Buffer) => stderr.push(data));
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
      expect(result).toEqual({ mode, passed: true });
    },
    120_000,
  );
});
