import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const { nativeRunnerEnabled, nativeRunnerCaptureEnabled } = require('./nativeRunnerSupport.cjs');
let cleanupConfirmed = true;
type NativeRunnerResult = {
  cleanupConfirmed?: boolean;
  passed?: boolean;
  capture?: string;
  captureSkipped?: boolean;
  captureSkipReason?: string;
};

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
      const contract = path.join(__dirname, 'nativeRunner.contract.cjs');
      const parent = path.resolve(__dirname, '..', '..', '..', '..', '..', 'artifacts', 'desktop', 'f11');
      fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
      const root = fs.mkdtempSync(path.join(parent, `native-${mode}-`));
      let ownerPid: number | undefined;
      let childClosed = false;
      let result: NativeRunnerResult | undefined;
      try {
        result = await new Promise<NativeRunnerResult>((resolve, reject) => {
          const child = spawn(process.execPath, [contract, mode, root], {
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: 180_000,
          });
          ownerPid = child.pid;
          let spawnError: Error | undefined;
          const stdout: Buffer[] = [];
          const stderr: Buffer[] = [];
          child.stdout.on('data', (data: Buffer) => stdout.push(data));
          child.stderr.on('data', (data: Buffer) => stderr.push(data));
          child.once('error', (error) => (spawnError = error));
          child.once('close', (code) => {
            childClosed = true;
            try {
              if (spawnError) throw spawnError;
              const value = JSON.parse(Buffer.concat(stdout).toString('utf8'));
              if (code !== 0 && value.passed) throw new Error('The native process failed after reporting a pass.');
              resolve(value);
            } catch (error) {
              reject(new Error(Buffer.concat(stderr).toString('utf8') || String(error)));
            }
          });
        });
        cleanupConfirmed = result.cleanupConfirmed === true;
        expect(result).toMatchObject({ mode, passed: true, cleanupConfirmed: true, evidence: path.join(root, 'evidence.json') });
        if (result.captureSkipped) console.info(`Native capture ${result.capture}: ${result.captureSkipReason}; ownership/cleanup only.`);
      } finally {
        if ((!result?.passed || !cleanupConfirmed) && childClosed && ownerPid !== undefined) {
          const removed = spawnSync(process.execPath, [contract, 'cleanup', root, String(ownerPid)], {
            encoding: 'utf8',
            timeout: 15_000,
          });
          if (removed.error || removed.status !== 0) {
            cleanupConfirmed = false;
            console.warn('Failed-case descriptor cleanup is unconfirmed; no further native case is allowed.');
          }
        }
      }
    },
    210_000,
  );
}
