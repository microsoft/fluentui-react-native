import { spawn } from 'node:child_process';
import path from 'node:path';

import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';

describe('WebdriverIO compatibility', () => {
  test('drives the fake host without an Appium service', async () => {
    const harness = await createDesktopDriverTestHarness();
    try {
      const result = await runContract(harness.server.url, harness.target.id);
      expect(result).toMatchObject({
        enabled: true,
        screenshot: expect.any(String),
        tagName: 'button',
      });
      expect(harness.host.actions).toContainEqual({ type: 'click', elementId: 'button', mode: 'physical' });
    } finally {
      await harness.close();
    }
  });
});

function runContract(url: string, target: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'webdriverio.contract.cjs'), url, target], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `WebdriverIO contract process exited with code ${code}.`));
        return;
      }
      resolve(JSON.parse(Buffer.concat(stdout).toString('utf8')) as Record<string, unknown>);
    });
  });
}
