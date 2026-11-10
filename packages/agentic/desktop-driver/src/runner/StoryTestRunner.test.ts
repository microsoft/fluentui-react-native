import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { DesktopStoryTests } from '../authoring/storyTests.js';
import { ArtifactManager } from '../artifacts/ArtifactManager.js';
import { DesktopDriverClientError, createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import { WebDriverError } from '../protocol/errors.js';
import { createDesktopDriverStoryHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopStoryManifest } from '../storybook.js';
import { assertDesktopExpectation, findDesktopElement, runDesktopStoryTests, selectDesktopStoryTests } from './StoryTestRunner.js';
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
  test('reports each settled result before navigating to the next test', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        { id: 'a-fails', steps: [{ expect: { state: 'role', target: { testId: 'button-primary' }, value: 'checkbox' } }] },
        { id: 'b-passes', steps: [{ action: 'note', message: 'passed' }] },
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    const events: string[] = [];
    const select = harness.storyOrchestrator!.selectStory.bind(harness.storyOrchestrator);
    jest.spyOn(harness.storyOrchestrator!, 'selectStory').mockImplementation(async (request) => {
      events.push(`select:${request.runId}`);
      return select(request);
    });
    try {
      const session = await createDesktopDriverClient({ url: harness.server.url }).newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        runId: 'logging',
        session,
        targetId: harness.target.id,
        onTestResult: async (test) => {
          await Promise.resolve();
          events.push(`result:${test.testId}:${test.status}`);
        },
      });
      expect(events).toEqual(['select:logging-1', 'result:a-fails:failed', 'select:logging-2', 'result:b-passes:passed']);
      expect(result.status).toBe('failed');
      await session.delete();
    } finally {
      await harness.close();
    }
  });

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

  test.each(['checked', 'required'] as const)('does not turn unsupported %s state into a passing skip', async (state) => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        {
          id: `unsupported-${state}`,
          steps: [{ expect: { state, target: { testId: 'button-primary' }, value: true } }],
        },
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    harness.host.setElementStateUnsupported('button', state, 'not exposed by this platform');
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

  test('matches selectors the way the native helpers do', async () => {
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
              id: 'save',
              name: 'Save draft',
              rect: { height: 20, width: 100, x: 0, y: 30 },
              role: 'button',
              scope: 'preview',
              windowId: 'window-1',
            },
            {
              id: 'field',
              rect: { height: 20, width: 100, x: 0, y: 60 },
              role: 'textbox',
              scope: 'preview',
              value: 'Ada',
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
      await expect(findDesktopElements(session, { text: 'Visible text' })).resolves.toHaveLength(1);
      await expect(findDesktopElements(session, { text: 'Visible' })).resolves.toHaveLength(0);
      await expect(findDesktopElements(session, { text: 'Save draft' })).resolves.toHaveLength(1);
      await expect(findDesktopElements(session, { text: 'Ada' })).resolves.toHaveLength(1);
      await expect(findDesktopElements(session, { accessibleName: 'Save' })).resolves.toHaveLength(0);
      await expect(findDesktopElements(session, { role: ' Edit ' })).resolves.toHaveLength(1);
      await expect(findDesktopElements(session, { role: 'Button' })).resolves.toHaveLength(1);
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('allows count and existence checks but rejects ambiguous element reads and actions', async () => {
    const harness = await createDesktopDriverStoryHarness(makeManifest(passingPlan), {
      windows: [
        {
          id: 'window-1',
          title: 'Ambiguous selectors',
          elements: [
            {
              id: 'first',
              automationId: 'duplicate',
              name: 'Save',
              rect: { height: 20, width: 100, x: 0, y: 0 },
              role: 'button',
              scope: 'application',
              windowId: 'window-1',
            },
            {
              id: 'second',
              automationId: 'duplicate',
              name: 'Save',
              rect: { height: 20, width: 100, x: 0, y: 30 },
              role: 'button',
              scope: 'application',
              windowId: 'window-1',
            },
          ],
        },
      ],
    });
    try {
      const session = await createDesktopDriverClient({ url: harness.server.url }).newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });

      await expect(
        assertDesktopExpectation(session, { state: 'count', target: { testId: 'duplicate' }, value: 2 }),
      ).resolves.toBeUndefined();
      await expect(
        assertDesktopExpectation(session, { state: 'exists', target: { testId: 'duplicate' }, value: true }),
      ).resolves.toBeUndefined();
      await expect(
        assertDesktopExpectation(session, { state: 'enabled', target: { testId: 'duplicate' }, value: true }),
      ).rejects.toMatchObject({
        code: 'invalid selector',
        message: expect.stringContaining('matched 2 elements'),
      });
      await expect(findDesktopElement(session, { testId: 'duplicate' })).rejects.toMatchObject({ code: 'invalid selector' });
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
        tests: [{ skipReason: 'Unsupported capabilities: focus', status: 'skipped', steps: [] }],
        status: 'incomplete',
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
      const running = runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        signal: controller.signal,
        targetId: harness.target.id,
      });
      await waitUntil(() => harness.host.actions.some(({ type }) => type === 'actions-start'));
      controller.abort();
      const result = await running;

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

describe('desktop story run classification', () => {
  const note = (id: string, extra: Partial<DesktopStoryTests['tests'][number]> = {}) => ({
    id,
    steps: [{ action: 'note' as const, message: id }],
    ...extra,
  });

  async function openSession(harness: DesktopDriverTestHarness, inputMode?: 'accessible' | 'compatibility' | 'physical') {
    return createDesktopDriverClient({ url: harness.server.url }).newSession({
      alwaysMatch: {
        platformName: 'windows',
        'furn:target': harness.target.id,
        ...(inputMode ? { 'furn:inputMode': inputMode } : {}),
      },
    });
  }

  test('classifies a lost connection as an infrastructure error, not a failed test', async () => {
    const manifest = makeManifest({ version: 1, tests: [note('connection')] });
    const harness = await createDesktopDriverStoryHarness(manifest);
    const session = await openSession(harness);
    await harness.close();

    const result = await runDesktopStoryTests({
      endpoint: 'windows',
      manifest,
      platformName: 'windows',
      session,
      targetId: harness.target.id,
    });

    expect(result.tests[0]).toMatchObject({ status: 'infrastructure-error' });
    expect(result.status).toBe('failed');
  });

  test('stops waiting as soon as the session is gone', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [{ id: 'gone', steps: [{ action: 'wait', target: { testId: 'missing' }, timeoutMs: 5000 }] }],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    try {
      const session = await openSession(harness);
      jest.spyOn(session, 'findElements').mockRejectedValue(new WebDriverError('invalid session id', 'The session was deleted.'));
      const started = Date.now();
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });

      expect(Date.now() - started).toBeLessThan(2000);
      expect(result.tests[0]).toMatchObject({ status: 'infrastructure-error', error: expect.stringContaining('session was deleted') });
    } finally {
      await harness.close();
    }
  });

  test('stops waiting on a transport failure but keeps waiting for a missing element', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [{ id: 'transport', steps: [{ action: 'wait', target: { testId: 'missing' }, timeoutMs: 5000 }] }],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    try {
      const session = await openSession(harness);
      jest.spyOn(session, 'findElements').mockRejectedValue(new DesktopDriverClientError('transport', 'The driver did not answer.'));
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });
      expect(result.tests[0]).toMatchObject({ status: 'infrastructure-error' });

      jest.restoreAllMocks();
      const timedOut = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest: makeManifest({
          version: 1,
          tests: [{ id: 'absent', steps: [{ action: 'wait', target: { testId: 'missing' }, timeoutMs: 100 }] }],
        }),
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });
      expect(timedOut.tests[0]).toMatchObject({ status: 'timed-out' });
    } finally {
      await harness.close();
    }
  });

  test('skips a test whose required input the session mode masks, and reports a lane run with a skip as incomplete', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [note('accessible'), note('physical-only', { requires: ['physical-click'] })],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    try {
      const options = { endpoint: 'windows', manifest, platformName: 'windows', targetId: harness.target.id } as const;

      const accessible = await openSession(harness, 'accessible');
      const lane = await runDesktopStoryTests({ ...options, session: accessible });
      expect(lane.tests.map(({ status }) => status)).toEqual(['passed', 'skipped']);
      expect(lane.tests[1].skipReason).toBe('Unsupported capabilities: physical-click');
      expect(lane.status).toBe('incomplete');
      await accessible.delete();

      const compatibility = await openSession(harness);
      const unconstrained = await runDesktopStoryTests({ ...options, session: compatibility });
      expect(unconstrained.tests.map(({ status }) => status)).toEqual(['passed', 'passed']);
      expect(unconstrained.status).toBe('passed');
      await compatibility.delete();
    } finally {
      await harness.close();
    }
  });

  test('keeps a run without an input lane passed when some tests are skipped and others pass', async () => {
    const manifest = makeManifest({ version: 1, tests: [note('runs'), note('needs-focus', { requires: ['focus'] })] });
    const harness = await createDesktopDriverStoryHarness(manifest, { features: { focus: false } });
    try {
      const session = await openSession(harness);
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });
      expect(result.tests.map(({ status }) => status)).toEqual(['skipped', 'passed']);
      expect(result.status).toBe('passed');
    } finally {
      await harness.close();
    }
  });

  test('a failure outranks a lane skip', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        { id: 'fails', steps: [{ expect: { state: 'role', target: { testId: 'button-primary' }, value: 'checkbox' } }] },
        note('physical-only', { requires: ['physical-click'] }),
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    try {
      const session = await openSession(harness, 'accessible');
      const result = await runDesktopStoryTests({
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });
      expect(result.tests.map(({ status }) => status)).toEqual(['failed', 'skipped']);
      expect(result.status).toBe('failed');
    } finally {
      await harness.close();
    }
  });

  test('keeps evidence of tests whose ids collide in separate directories, and failure evidence apart from authored artifacts', async () => {
    const step = (name: string) => [
      { action: 'screenshot' as const, name: 'shot' },
      { action: 'source' as const, name },
      { expect: { state: 'role' as const, target: { testId: 'button-primary' }, value: 'checkbox' } },
    ];
    const manifest = {
      ...makeManifest({ version: 1, tests: [] }),
      entries: [
        { ...makeManifest({ version: 1, tests: [{ id: 'c', steps: step('tree') }] }).entries[0], id: 'a-b' },
        { ...makeManifest({ version: 1, tests: [{ id: 'b-c', steps: step('tree') }] }).entries[0], id: 'a' },
      ],
    };
    const harness = await createDesktopDriverStoryHarness(manifest);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-collide-'));
    try {
      const session = await openSession(harness);
      const result = await runDesktopStoryTests({
        artifacts: new ArtifactManager(temporaryDirectory),
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });

      const paths = result.tests.flatMap(({ artifacts }) => artifacts.map(({ path: artifactPath }) => artifactPath));
      expect(new Set(paths).size).toBe(paths.length);
      for (const artifactPath of paths) {
        expect(fs.existsSync(path.join(temporaryDirectory, artifactPath))).toBe(true);
      }
      const [first, second] = result.tests.map(({ artifacts }) => artifacts);
      expect(first.map(({ name }) => name)).toEqual(['shot', 'tree', 'failure', 'failure-source', 'failure-tree']);
      expect(first.filter(({ name }) => name.startsWith('failure')).every(({ path: p }) => p.includes('/failure/'))).toBe(true);
      expect(first.filter(({ name }) => !name.startsWith('failure')).some(({ path: p }) => p.includes('/failure/'))).toBe(false);
      expect(path.dirname(first[0].path)).not.toBe(path.dirname(second[0].path));
    } finally {
      await harness.close();
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });

  test('fails a test that reuses an authored artifact name or one reserved for failure evidence', async () => {
    const manifest = makeManifest({
      version: 1,
      tests: [
        {
          id: 'duplicate',
          steps: [
            { action: 'screenshot', name: 'Shot' },
            { action: 'screenshot', name: 'shot' },
          ],
        },
        { id: 'reserved', steps: [{ action: 'source', name: 'failure-source' }] },
      ],
    });
    const harness = await createDesktopDriverStoryHarness(manifest);
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'desktop-driver-names-'));
    try {
      const session = await openSession(harness);
      const result = await runDesktopStoryTests({
        artifacts: new ArtifactManager(temporaryDirectory),
        endpoint: 'windows',
        manifest,
        platformName: 'windows',
        session,
        targetId: harness.target.id,
      });

      expect(result.tests[0]).toMatchObject({ status: 'failed', error: expect.stringContaining('more than one step') });
      expect(result.tests[1]).toMatchObject({ status: 'failed', error: expect.stringContaining('reserved for failure evidence') });
    } finally {
      await harness.close();
      fs.rmSync(temporaryDirectory, { force: true, recursive: true });
    }
  });

  test('rejects a malformed expectation instead of reading it as a passing check', async () => {
    const harness = await createDesktopDriverStoryHarness(makeManifest({ version: 1, tests: [] }));
    try {
      const session = await openSession(harness);
      await expect(assertDesktopExpectation(session, { state: 'unknown', target: { testId: 'button-primary' } } as never)).rejects.toThrow(
        TypeError,
      );
    } finally {
      await harness.close();
    }
  });
});

describe('selectDesktopStoryTests', () => {
  const manifestOf = (ids: readonly string[]): DesktopStoryManifest => ({
    ...makeManifest({ version: 1, tests: [] }),
    entries: ids.map((id) => ({
      ...makeManifest({ version: 1, tests: [{ id: 'only', steps: [{ action: 'note', message: id }] }] }).entries[0],
      id,
    })),
  });

  test('orders by code point so every machine builds the same shards', () => {
    const manifest = manifestOf(['z', 'é', 'b', 'B', 'a', 'Z']);
    const order = selectDesktopStoryTests(manifest, 'windows').map(({ entry }) => entry.id);
    expect(order).toEqual(['B', 'Z', 'a', 'b', 'z', 'é']);
    expect(selectDesktopStoryTests(manifest, 'windows', { shardCount: 2, shardIndex: 1 }).map(({ entry }) => entry.id)).toEqual([
      'Z',
      'b',
      'é',
    ]);
  });

  test('matches * as any run of characters and everything else literally', () => {
    const manifest = manifestOf(['components-button--default', 'components-button--primary', 'components-input--default', 'a.c', 'abc']);
    const select = (story: string) => selectDesktopStoryTests(manifest, 'windows', { story }).map(({ entry }) => entry.id);
    expect(select('components-button--*')).toEqual(['components-button--default', 'components-button--primary']);
    expect(select('*--default')).toEqual(['components-button--default', 'components-input--default']);
    expect(select('*button*primary')).toEqual(['components-button--primary']);
    expect(select('a.c')).toEqual(['a.c']);
    expect(select('a?c')).toEqual([]);
    expect(select('*')).toHaveLength(5);
    expect(select('**abc**')).toEqual(['abc']);
  });

  test('stays linear on a pattern with many wildcards that cannot match', () => {
    const manifest = manifestOf(['a'.repeat(60)]);
    const started = Date.now();
    expect(selectDesktopStoryTests(manifest, 'windows', { story: `${'*a'.repeat(20)}b` })).toEqual([]);
    expect(selectDesktopStoryTests(manifest, 'windows', { story: `${'*a'.repeat(20)}*` })).toHaveLength(1);
    expect(Date.now() - started).toBeLessThan(250);
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

async function waitUntil(predicate: () => boolean, timeoutMs = 1000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() >= deadline) {
      throw new Error('Timed out waiting for the expected test condition.');
    }
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}
