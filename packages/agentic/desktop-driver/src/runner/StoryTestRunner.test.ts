import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStoryTests } from '../authoring/storyTests.js';
import { ArtifactManager } from '../artifacts/ArtifactManager.js';
import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import { createDesktopDriverStoryHarness } from '../testing/protocolHarness.js';
import type { DesktopStoryManifest } from '../storybook.js';
import { runDesktopStoryTests, selectDesktopStoryTests } from './StoryTestRunner.js';
import { findDesktopElements } from './StoryTestRunner.js';

const passingPlan: DesktopStoryTests = {
  version: 1,
  tests: [
    {
      id: 'button-contract',
      requires: ['focus', 'keyboard', 'screenshot', 'wheel'],
      steps: [
        { action: 'wait', target: { testId: 'button-primary' }, timeoutMs: 100 },
        { expect: { state: 'role', target: { testId: 'button-primary' }, value: 'button' } },
        { expect: { state: 'enabled', target: { testId: 'button-primary' }, value: true } },
        { action: 'click', target: { testId: 'button-primary' } },
        { expect: { state: 'focused', target: { testId: 'button-primary' }, value: true } },
        { action: 'type', target: { testId: 'input-name' }, text: 'Ada' },
        { expect: { state: 'value', target: { testId: 'input-name' }, value: 'Ada' } },
        { action: 'keys', value: ['\uE004'] },
        { action: 'scroll', deltaY: 120 },
        { action: 'setArgs', args: { disabled: false } },
        { action: 'screenshot', name: 'button' },
        { action: 'source', name: 'source' },
      ],
      title: 'Button contract',
    },
  ],
};

describe('runDesktopStoryTests', () => {
  test('runs a portable plan and writes a stable evidence report', async () => {
    const manifest = makeManifest(passingPlan);
    const harness = await createDesktopDriverStoryHarness(manifest);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-run-'));
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      const result = await runDesktopStoryTests({
        artifacts: new ArtifactManager(temporaryDirectory),
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        runId: 'run',
        session,
        targetId: harness.target.id,
      });

      expect(result).toMatchObject({
        status: 'passed',
        tests: [
          {
            status: 'passed',
            steps: expect.arrayContaining([expect.objectContaining({ status: 'passed' })]),
          },
        ],
      });
      expect(result.tests[0].artifacts.map(({ kind }) => kind)).toEqual(['screenshot', 'source']);
      expect(harness.storyOrchestrator?.argUpdates).toEqual([{ args: { disabled: false }, storyId: 'components-button--default' }]);
      expect(JSON.parse(fs.readFileSync(path.join(temporaryDirectory, 'run.json'), 'utf8'))).toMatchObject({
        runId: 'run',
        status: 'passed',
      });
      expect(JSON.parse(fs.readFileSync(path.join(temporaryDirectory, 'host.json'), 'utf8'))).toMatchObject({
        endpoint: 'windows',
        targetId: harness.target.id,
      });
      await session.delete();
    } finally {
      await harness.close();
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });

  test('distinguishes assertion failures and captures failure evidence', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        {
          id: 'fails',
          steps: [{ expect: { state: 'role', target: { testId: 'button-primary' }, value: 'checkbox' } }],
        },
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-failure-'));
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      const result = await runDesktopStoryTests({
        artifacts: new ArtifactManager(temporaryDirectory),
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });

      expect(result.status).toBe('failed');
      expect(result.tests[0]).toMatchObject({
        status: 'failed',
        error: expect.stringContaining('checkbox'),
      });
      expect(result.tests[0].artifacts.map(({ name }) => name)).toEqual(['failure', 'failure-source', 'failure-tree']);
      await session.delete();
    } finally {
      await harness.close();
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });

  test('filters and deterministically shards plans', () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        { id: 'one', steps: [{ action: 'note', message: 'one' }] },
        { id: 'two', steps: [{ action: 'note', message: 'two' }] },
        { id: 'three', steps: [{ action: 'note', message: 'three' }] },
        { id: 'four', steps: [{ action: 'note', message: 'four' }] },
      ],
    });

    const first = selectDesktopStoryTests(manifest, 'windows', { shardCount: 2, shardIndex: 0 });
    const second = selectDesktopStoryTests(manifest, 'windows', { shardCount: 2, shardIndex: 1 });
    expect([...first, ...second].map(({ test }) => test.id).sort()).toEqual(['four', 'one', 'three', 'two']);
    expect(first).toHaveLength(2);
    expect(second).toHaveLength(2);
  });

  test('does not turn an unsupported runtime property into a passing skip', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        {
          id: 'unsupported-checked',
          steps: [{ expect: { state: 'checked', target: { testId: 'button-primary' }, value: true } }],
        },
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    harness.host.setElementStateUnsupported('button', 'checked', 'not exposed by this platform');
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });

      expect(result).toMatchObject({
        status: 'failed',
        tests: [{ status: 'failed', error: expect.stringContaining('not exposed') }],
      });
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('matches text independently from accessible name', async () => {
    const harness = await createDesktopDriverStoryHarness(makeManifest(passingPlan), {
      windows: [
        {
          id: 'window-1',
          title: 'Text selector',
          elements: [
            {
              id: 'label',
              rect: { height: 20, width: 100, x: 0, y: 0 },
              role: 'text',
              scope: 'preview',
              text: 'Visible text',
              windowId: 'window-1',
            },
            {
              id: 'story-root',
              automationId: 'story-root',
              name: JSON.stringify({ previewGeneration: 0, storyId: 'initial--story' }),
              rect: { height: 100, width: 100, x: 0, y: 0 },
              role: 'group',
              scope: 'preview',
              windowId: 'window-1',
            },
          ],
        },
      ],
    });
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      await expect(findDesktopElements(session, { text: 'Visible' })).resolves.toHaveLength(1);
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('cancels an in-flight wait and releases input before the next test', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        {
          id: 'cancelled-wait',
          steps: [{ action: 'wait', target: { testId: 'missing' }, timeoutMs: 1000 }],
        },
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    const controller = new AbortController();
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      setTimeout(() => controller.abort(), 20);
      const started = Date.now();
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        signal: controller.signal,
        targetId: harness.target.id,
      });

      expect(Date.now() - started).toBeLessThan(500);
      expect(result).toMatchObject({ status: 'failed', tests: [{ status: 'cancelled' }] });
      expect(harness.host.actions).toContainEqual({ type: 'release-actions' });
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('skips a declared focus requirement when focused state is unavailable', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        {
          id: 'focus-required',
          requires: ['focus'],
          steps: [{ expect: { state: 'focused', target: { testId: 'button-primary' }, value: true } }],
        },
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest, { features: { focus: false } });
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });

      expect(result).toMatchObject({
        status: 'passed',
        tests: [{ skipReason: 'Unsupported capabilities: focus', status: 'skipped', steps: [] }],
      });
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('drains an aborted native action before releasing input', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        {
          id: 'cancelled-action',
          steps: [
            {
              action: 'actions',
              sequences: [{ id: 'key', type: 'key', actions: [{ type: 'keyDown', value: 'A' }] }],
            },
          ],
        },
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest, { actionDelayMs: 50 });
    const controller = new AbortController();
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      setTimeout(() => controller.abort(), 10);
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        signal: controller.signal,
        targetId: harness.target.id,
      });

      expect(result).toMatchObject({ status: 'failed', tests: [{ status: 'cancelled' }] });
      const completed = harness.host.actions.findIndex(({ type }) => type === 'actions');
      const released = harness.host.actions.findIndex(({ type }) => type === 'release-actions');
      expect(completed).toBeGreaterThan(-1);
      expect(released).toBeGreaterThan(completed);
      await session.delete();
    } finally {
      await harness.close();
    }
  });
});

function makeManifest(tests: DesktopStoryTests): DesktopStoryManifest {
  return {
    endpoint: 'windows',
    entries: [
      {
        id: 'components-button--default',
        name: 'Default',
        packageName: '@fluentui-react-native/components',
        sourcePath: 'src/components/button/button.stories.tsx',
        tags: ['e2e', 'story'],
        tests,
        title: 'Components/Button',
      },
    ],
    platformManifestDigest: 'platform-digest',
    portablePlanDigest: 'portable-digest',
    schemaVersion: 1,
  };
}
