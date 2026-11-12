import { spawn } from 'node:child_process';
import path from 'node:path';

const nativeTest =
  process.platform === 'darwin' && process.env.FURN_NATIVE_DRIVER_TEST === '1' && process.env.FURN_NATIVE_HANDOFF_APP_PATH
    ? test
    : test.skip;

nativeTest(
  'real private-descriptor MCP/WDIO handoff preserves the attached app and drains a crashed worker',
  async () => {
    for (const mode of ['handoff', 'worker-crash']) {
      const result = await new Promise<unknown>((resolve, reject) => {
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
      expect(result).toMatchObject({ mode, passed: true });
    }
  },
  420_000,
);
