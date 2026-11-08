import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { DesktopAuthority } from '../authority/grants.js';
import type { DesktopStoryManifest } from '../storybook.js';
import { createDesktopDriverStoryHarness, createDesktopDriverTestHarness } from '../testing/protocolHarness.js';

describe('sanctioned WebdriverIO API', () => {
  test.each([
    [true, false],
    [false, false],
    [true, true],
  ])(
    'routes element screenshots without falling back to window capture (supported: %s, protected: %s)',
    async (elementScreenshot, protectedService) => {
      const authority = protectedService ? new DesktopAuthority() : undefined;
      const grant = authority?.issue({ label: 'wdio', targets: '*' });
      const harness = await createDesktopDriverTestHarness({ features: { elementScreenshot } }, undefined, { authority });
      const captureElement = jest.spyOn(harness.host, 'captureElement');
      const captureWindow = jest.spyOn(harness.host, 'captureWindow');
      const windowImage = await harness.host.captureWindow('window-1');
      const elementImage = Buffer.from('element-image');
      captureWindow.mockClear();
      if (elementScreenshot) {
        captureElement.mockResolvedValue({ ...windowImage, data: elementImage });
      }
      const artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-screenshots-'));
      try {
        const response = await runContract(harness.server.url, harness.target.id, artifactsRoot, 'screenshots.contract.cjs', grant?.token);
        for (const mode of ['connected', 'attached', 'managed']) {
          expect(response[mode]).toEqual({
            window: Buffer.from(windowImage.data).toString('base64'),
            element: elementScreenshot ? elementImage.toString('base64') : 'unsupported',
            savedElement: elementScreenshot ? elementImage.toString('base64') : 'unsupported',
          });
        }
        expect(captureElement.mock.calls.length).toBeGreaterThanOrEqual(6);
        expect(captureElement.mock.calls.every(([id]) => id === 'button')).toBe(true);
        expect(captureWindow).toHaveBeenCalledTimes(3);
      } finally {
        await harness.close();
        fs.rmSync(artifactsRoot, { force: true, recursive: true });
      }
    },
    60_000,
  );

  test('lists and runs an authored plan through registered browser commands', async () => {
    const manifest: DesktopStoryManifest = {
      endpoint: 'windows',
      entries: [
        {
          id: 'components-button--default',
          name: 'Default',
          packageName: '@fluentui-react-native/components',
          sourcePath: 'src/components/button/button.stories.tsx',
          tags: ['e2e', 'story'],
          tests: {
            version: 1,
            tests: [
              {
                id: 'click',
                steps: [
                  { action: 'click', target: { testId: 'button-primary' } },
                  { expect: { state: 'focused', target: { testId: 'button-primary' }, value: true } },
                ],
              },
            ],
          },
          title: 'Components/Button',
        },
      ],
      platformManifestDigest: 'platform-digest',
      portablePlanDigest: 'portable-digest',
      schemaVersion: 1,
    };
    const harness = await createDesktopDriverStoryHarness(manifest);
    const find = harness.host.find.bind(harness.host);
    let delayedLookups = 0;
    harness.host.find = async (root, selector) => {
      if (selector.value === 'button-delayed') {
        if (++delayedLookups < 3) return [];
        return find(root, { ...selector, value: 'button-primary' });
      }
      return find(root, selector);
    };
    const artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-wdio-'));
    try {
      const response = await runContract(harness.server.url, harness.target.id, artifactsRoot);
      expect(response).toMatchObject({
        attachedWaitOptions: { waitforInterval: 100, waitforTimeout: 5000 },
        attachedWaitPolls: 3,
        delayedDisplayed: true,
        manifestEntries: 1,
        result: {
          status: 'passed',
          tests: [{ status: 'passed', storyId: 'components-button--default', testId: 'click' }],
        },
      });
      expect(delayedLookups).toBeGreaterThanOrEqual(3);
      expect(fs.existsSync(path.join(artifactsRoot, 'run.json'))).toBe(true);
    } finally {
      await harness.close();
      fs.rmSync(artifactsRoot, { force: true, recursive: true });
    }
  }, 60_000);

  test('opens a session with an input mode, and performs a named accessibility action through an element command', async () => {
    const harness = await createDesktopDriverTestHarness({ features: { accessibilityActions: true, performAccessibilityAction: true } });
    harness.host.setElementActions('button', ['Increment', 'Decrement']);
    try {
      const response = await runContract(harness.server.url, harness.target.id, os.tmpdir(), 'input.contract.cjs');
      expect(response).toEqual({
        attachedInputMode: 'accessible',
        input: { mode: 'accessible', receipts: { 'accessibility-action': 1, 'semantic-clear': 1 } },
        inputMode: 'accessible',
        typed: expect.stringContaining('never delivers'),
      });
      expect(harness.host.actions).toContainEqual({ elementId: 'button', name: 'Increment', type: 'accessibility-action' });
      expect(harness.host.actions).toContainEqual({ elementId: 'input', type: 'clear', mechanism: 'semantic' });
      expect(harness.host.actions.some((action) => action.type === 'send-keys')).toBe(false);
      expect(harness.host.actions.filter((action) => action.type === 'clear')).toHaveLength(1);
    } finally {
      await harness.close();
    }
  }, 60_000);
});

function runContract(
  url: string,
  targetId: string,
  artifactsRoot: string,
  fixture = 'wdioRunner.contract.cjs',
  grant?: string,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, fixture), url, targetId, artifactsRoot], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FURN_DESKTOP_DRIVER_GRANT_TOKEN: grant ?? '' },
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (grant && (Buffer.concat(stdout).includes(grant) || Buffer.concat(stderr).includes(grant))) {
        reject(new Error('The WebdriverIO contract exposed a grant in its output.'));
        return;
      }
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `WebdriverIO runner exited with code ${code}.`));
        return;
      }
      resolve(JSON.parse(Buffer.concat(stdout).toString('utf8')) as Record<string, unknown>);
    });
  });
}
