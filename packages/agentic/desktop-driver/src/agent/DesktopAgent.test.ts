import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { DesktopStoryManifest } from '../storybook.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import { createDesktopDriverStoryHarness } from '../testing/protocolHarness.js';
import { connectDesktopAgent } from './DesktopAgent.js';

describe('DesktopAgent', () => {
  test('lists, explains, inspects, acts, checks, captures, and runs the same authored plan', async () => {
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
                id: 'agent-plan',
                steps: [{ expect: { state: 'enabled', target: { testId: 'button-primary' }, value: true } }],
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
    const artifactsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-agent-'));
    try {
      const response = await runContract(harness.server.url, harness.target.id, artifactsRoot);
      expect(response).toMatchObject({
        check: { passed: true },
        run: { status: 'passed', tests: [{ testId: 'agent-plan' }] },
        screenshot: { kind: 'screenshot', name: 'agent-button' },
        stories: 1,
        tree: 1,
      });
      expect(fs.existsSync(path.join(artifactsRoot, 'run.json'))).toBe(true);
    } finally {
      await harness.close();
      fs.rmSync(artifactsRoot, { force: true, recursive: true });
    }
  });

  test('validates the artifact root before reserving a target session', async () => {
    const harness = await createDesktopDriverTestHarness();
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-agent-invalid-'));
    const invalidRoot = path.join(temporaryDirectory, 'file');
    fs.writeFileSync(invalidRoot, 'not a directory');
    try {
      await expect(
        connectDesktopAgent({
          artifactsRoot: invalidRoot,
          platformName: 'windows',
          targetId: harness.target.id,
          url: harness.server.url,
        }),
      ).rejects.toThrow();

      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      await session.delete();
    } finally {
      await harness.close();
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });
});

function runContract(url: string, targetId: string, artifactsRoot: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'agent.contract.cjs'), url, targetId, artifactsRoot], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(stderr).toString('utf8') || `Desktop agent exited with code ${code}.`));
        return;
      }
      resolve(JSON.parse(Buffer.concat(stdout).toString('utf8')) as Record<string, unknown>);
    });
  });
}
