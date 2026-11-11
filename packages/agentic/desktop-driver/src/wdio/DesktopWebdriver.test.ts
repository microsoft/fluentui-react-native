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

  describe('setValue', () => {
    const secret = 'hunter2-masked-value';
    const run = (harness: Awaited<ReturnType<typeof createDesktopDriverTestHarness>>, scenario: string) =>
      runContract(harness.server.url, harness.target.id, os.tmpdir(), 'setValue.contract.cjs', undefined, { scenario, secret });

    test('keeps a masked value out of the output, and the value still reaches the field', async () => {
      const harness = await createDesktopDriverTestHarness();
      try {
        // Without the mask the same run does log the value, so the absence below is a property of the mask.
        expect(await run(harness, 'unmasked')).toMatchObject({ result: 'ok', logged: true });
        expect(await run(harness, 'masked')).toEqual({ result: 'ok', logged: false });
        expect(harness.host.actions.filter((action) => action.type === 'send-keys')).toHaveLength(2);
      } finally {
        await harness.close();
      }
    }, 60_000);

    test('asks the session for its input mode when an attach carries no capability, before anything is cleared', async () => {
      const harness = await createDesktopDriverTestHarness();
      try {
        const response = await run(harness, 'partial-attach');
        expect(response).toEqual({ capabilityMode: null, typed: expect.stringContaining('never delivers'), logged: false });
        expect(harness.host.actions.filter((action) => action.type === 'clear' || action.type === 'send-keys')).toEqual([]);
      } finally {
        await harness.close();
      }
    }, 60_000);

    test('follows the browser to its new session after reloadSession', async () => {
      const harness = await createDesktopDriverTestHarness();
      try {
        const response = await run(harness, 'reload');
        expect(response).toMatchObject({
          boundToReloaded: true,
          changed: true,
          input: { mode: 'compatibility' },
          typed: 'ok',
        });
        expect(harness.host.actions).toContainEqual({ elementId: 'input', text: 'after reload', type: 'send-keys' });
      } finally {
        await harness.close();
      }
    }, 60_000);

    test('does not run the web-only stubborn-value path, which the driver rejects after the field was cleared', async () => {
      const harness = await createDesktopDriverTestHarness();
      const clear = harness.host.clear.bind(harness.host);
      const sendKeys = harness.host.sendKeys.bind(harness.host);
      harness.host.clear = async (id, signal, mechanism) => {
        const used = await clear(id, signal, mechanism);
        if (id === 'input') await sendKeys(id, '0');
        return used;
      };
      try {
        expect(await run(harness, 'stubborn')).toMatchObject({ typed: 'ok' });
        expect(harness.host.actions.filter((action) => action.type === 'clear')).toHaveLength(1);
      } finally {
        await harness.close();
      }
    }, 60_000);
  });
});

function runContract(
  url: string,
  targetId: string,
  artifactsRoot: string,
  fixture = 'wdioRunner.contract.cjs',
  grant?: string,
  extra: { scenario?: string; secret?: string } = {},
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, fixture), url, targetId, artifactsRoot, ...(extra.scenario ? [extra.scenario] : [])],
      {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, FURN_DESKTOP_DRIVER_GRANT_TOKEN: grant ?? '' },
      },
    );
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      const output = Buffer.concat([...stdout, ...stderr]);
      if (grant && output.includes(grant)) {
        reject(new Error('The WebdriverIO contract exposed a grant in its output.'));
        return;
      }
      if (extra.secret && output.includes(extra.secret) && extra.scenario !== 'unmasked') {
        reject(new Error('The WebdriverIO contract exposed a masked value in its output.'));
        return;
      }
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `WebdriverIO runner exited with code ${code}.`));
        return;
      }
      const lines = Buffer.concat(stdout).toString('utf8').trim().split('\n');
      const marked = lines.findLast((line) => line.startsWith('FURN_RESULT '));
      try {
        const result = JSON.parse(marked ? marked.slice('FURN_RESULT '.length) : lines.at(-1)!) as Record<string, unknown>;
        resolve(extra.secret ? { ...result, logged: output.includes(extra.secret) } : result);
      } catch (error) {
        reject(error);
      }
    });
  });
}
