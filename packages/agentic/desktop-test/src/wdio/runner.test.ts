import { spawn } from 'node:child_process';
import path from 'node:path';

import { createDesktopWdioConfiguration } from './configuration.js';
import type { DesktopWdioSettings } from './configuration.js';

describe('protected standalone WDIO runner', () => {
  test.each([
    ['session', 'launch'],
    ['supervisor', 'attach'],
    ['external', 'attach'],
  ] as const)('uses %s application ownership with %s capabilities', async (ownership, launchMode) => {
    const settings: DesktopWdioSettings = {
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- The fixture uses a loopback driver address.
      url: 'http://127.0.0.1:1234',
      targetId: 'fixture',
      endpoint: 'macos',
      ownership,
      specs: [],
      framework: 'jasmine',
      reporter: 'fixture',
      rootDir: process.cwd(),
      specFileRetries: 0,
      bail: 1,
      timeoutMs: 1000,
      launchTimeoutMs: 1000,
    };
    const configuration = await createDesktopWdioConfiguration(settings);
    expect(configuration.capabilities).toMatchObject([{ 'furn:launchMode': launchMode }]);
  });

  test.each(['handoff', 'worker-crash', 'managed', 'managed-drain-failure'] as const)(
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
