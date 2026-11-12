import { spawn } from 'node:child_process';
import path from 'node:path';

const { nativeRunnerEnabled, nativeRunnerCaptureEnabled } = require('./nativeRunnerSupport.cjs');
let cleanupConfirmed = true;

for (const mode of ['handoff', 'operator-preempt', 'worker-crash', 'lost-response', 'capture']) {
  const nativeTest =
    nativeRunnerEnabled(process.platform, process.env) && (mode !== 'capture' || nativeRunnerCaptureEnabled(process.platform, process.env))
      ? test
      : test.skip;
  nativeTest(
    `real private-descriptor MCP/WDIO ${mode} preserves the attached app and confirms cleanup`,
    async () => {
      if (!cleanupConfirmed) throw new Error('Not run: the preceding native scenario did not confirm cleanup.');
      cleanupConfirmed = false;
      const result = await new Promise<{ cleanupConfirmed?: boolean; passed?: boolean }>((resolve, reject) => {
        const child = spawn(process.execPath, [path.join(__dirname, 'nativeRunner.contract.cjs'), mode], {
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 180_000,
        });
        const stdout: Buffer[] = [];
        const stderr: Buffer[] = [];
        child.stdout.on('data', (data: Buffer) => stdout.push(data));
        child.stderr.on('data', (data: Buffer) => stderr.push(data));
        child.once('error', reject);
        child.once('close', (code) => {
          try {
            const value = JSON.parse(Buffer.concat(stdout).toString('utf8'));
            if (code !== 0 && value.passed) throw new Error('The native process failed after reporting a pass.');
            resolve(value);
          } catch (error) {
            reject(new Error(Buffer.concat(stderr).toString('utf8') || String(error)));
          }
        });
      });
      cleanupConfirmed = result.cleanupConfirmed === true;
      expect(result).toMatchObject({ mode, passed: true, cleanupConfirmed: true });
    },
    210_000,
  );
}
