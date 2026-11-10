import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.setTimeout(30_000);

const posixTest = process.platform === 'win32' ? test.skip : test;

describe('owned desktop service interrupts', () => {
  posixTest('a second interrupt during cleanup force-stops a service that ignores the graceful stop', async () => {
    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'furn-owned-service-')));
    const marker = path.join(root, 'service.pid');
    const descriptor = path.join(root, 'service.json');
    // Fixture code is constant; the marker path reaches it through process.argv (R-SCAN-002).
    fs.writeFileSync(
      descriptor,
      JSON.stringify({
        command: {
          command: process.execPath,
          args: [
            '-e',
            "process.on('SIGTERM', () => {}); require('node:fs').writeFileSync(process.argv[1], String(process.pid)); setInterval(() => {}, 1000);",
            marker,
          ],
          cwd: root,
        },
        stopPath: path.join(root, 'service.stop'),
        label: 'fixture',
      }),
    );
    let servicePid: number | undefined;
    const child = spawn(process.execPath, [path.resolve(__dirname, '../config/service.cjs'), descriptor], { cwd: root, stdio: 'ignore' });
    const exited = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) =>
      child.once('exit', (code, signal) => resolve({ code, signal })),
    );
    try {
      await waitUntil(() => fs.existsSync(marker) && fs.readFileSync(marker, 'utf8').length > 0);
      servicePid = Number(fs.readFileSync(marker, 'utf8'));
      child.kill('SIGINT');
      // The graceful stop is still waiting on the service when the second interrupt arrives.
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(isAlive(servicePid)).toBe(true);
      const escalated = Date.now();
      child.kill('SIGINT');
      expect((await exited).signal).toBeNull();
      expect(Date.now() - escalated).toBeLessThan(8_000);
      await waitUntil(() => !isAlive(servicePid!));
    } finally {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
      if (servicePid && isAlive(servicePid)) process.kill(servicePid, 'SIGKILL');
      fs.rmSync(root, { force: true, recursive: true, maxRetries: 20, retryDelay: 100 });
    }
  });
});

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

async function waitUntil(condition: () => boolean, timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!condition()) {
    if (Date.now() > deadline) throw new Error('Timed out waiting for the condition.');
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}
