import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStoryManifest } from '../storybook.js';
import { createDesktopDriverStoryHarness } from '../testing/protocolHarness.js';

describe('sanctioned WebdriverIO API', () => {
  test('lists and runs an authored plan through registered browser commands', async () => {
    const manifest: DesktopStoryManifest = {
      catalogSetDigest: 'catalog-digest',
      endpoint: 'windows',
      entries: [
        {
          id: 'components-button--default',
          name: 'Default',
          packageName: '@fluentui-react-native/components',
          sourcePath: 'src/components/button/button.stories.tsx',
          supportedPlatforms: ['macos', 'windows', 'win32'],
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
      excluded: [],
      platformManifestDigest: 'platform-digest',
      portablePlanDigest: 'portable-digest',
      schemaVersion: 2,
    };
    const harness = await createDesktopDriverStoryHarness(manifest);
    const artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-wdio-'));
    try {
      const response = await runContract(harness.server.url, harness.target.id, artifactsRoot);
      expect(response).toMatchObject({
        manifestEntries: 1,
        result: {
          status: 'passed',
          tests: [{ status: 'passed', storyId: 'components-button--default', testId: 'click' }],
        },
      });
      expect(fs.existsSync(path.join(artifactsRoot, 'run.json'))).toBe(true);
    } finally {
      await harness.close();
      fs.rmSync(artifactsRoot, { force: true, recursive: true });
    }
  });
});

function runContract(url: string, targetId: string, artifactsRoot: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'wdioRunner.contract.cjs'), url, targetId, artifactsRoot], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `WebdriverIO runner exited with code ${code}.`));
        return;
      }
      resolve(JSON.parse(Buffer.concat(stdout).toString('utf8')) as Record<string, unknown>);
    });
  });
}
