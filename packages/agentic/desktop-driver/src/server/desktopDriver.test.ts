import { Buffer } from 'node:buffer';

import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import { FakeDesktopHost } from '../hosts/fake/FakeDesktopHost.js';
import { webElementIdentifier } from '../protocol/constants.js';
import { HostWebDriverError } from '../protocol/errors.js';
import { runDesktopStoryTests } from '../runner/StoryTestRunner.js';
import { createDesktopDriverServer } from './createDesktopDriverServer.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopStoryManifest, StoryOrchestrator, StoryReadyResult } from '../storybook.js';

describe('Desktop Driver W3C remote end', () => {
  test('serves status and a complete fake-host session through raw HTTP', async () => {
    const harness = await createDesktopDriverTestHarness();
    try {
      const status = await getJson(`${harness.server.url}/status`);
      expect(status.value).toMatchObject({ ready: true });

      const created = await getJson(`${harness.server.url}/session`, {
        method: 'POST',
        body: JSON.stringify({
          capabilities: {
            alwaysMatch: {
              browserName: 'furn-native-desktop',
              platformName: 'windows',
              'furn:target': harness.target.id,
              'furn:clickMode': 'physical',
            },
          },
        }),
      });
      const sessionId = created.value.sessionId as string;
      expect(created.value.capabilities).toMatchObject({
        browserName: 'furn-native-desktop',
        platformName: 'windows',
        'furn:clickMode': 'physical',
        'furn:endpoint': 'windows',
      });

      const found = await getJson(`${harness.server.url}/session/${sessionId}/element`, {
        method: 'POST',
        body: JSON.stringify({ using: 'accessibility id', value: 'button-primary' }),
      });
      const elementId = found.value[webElementIdentifier] as string;
      expect(elementId).toEqual(expect.any(String));

      await getJson(`${harness.server.url}/session/${sessionId}/element/${elementId}/click`, {
        method: 'POST',
        body: '{}',
      });
      expect(harness.host.actions).toContainEqual({ type: 'click', elementId: 'button', mode: 'physical' });

      await getJson(`${harness.server.url}/session/${sessionId}/element/${elementId}/furn/focus`, {
        method: 'POST',
        body: '{}',
      });
      expect(harness.host.actions).toContainEqual({ type: 'focus', elementId: 'button' });

      const screenshot = await getJson(`${harness.server.url}/session/${sessionId}/screenshot`);
      expect(
        Buffer.from(screenshot.value as string, 'base64')
          .subarray(1, 4)
          .toString(),
      ).toBe('PNG');

      const source = await getJson(`${harness.server.url}/session/${sessionId}/source`);
      expect(source.value).toContain('id="button-primary"');

      const malformedActions = await getJson(`${harness.server.url}/session/${sessionId}/actions`, {
        method: 'POST',
        body: JSON.stringify({
          actions: [{ id: 'invalid', type: 'not-a-source', actions: [{ type: 'not-an-action' }] }],
        }),
        expectStatus: 400,
      });
      expect(malformedActions.value).toMatchObject({ error: 'invalid argument' });

      const shadow = await getJson(`${harness.server.url}/session/${sessionId}/element/${elementId}/shadow`, {
        expectStatus: 500,
      });
      expect(shadow.value).toMatchObject({ error: 'unsupported operation' });

      const unsupported = await getJson(`${harness.server.url}/session/${sessionId}/url`, { expectStatus: 500 });
      expect(unsupported.value).toMatchObject({ error: 'unsupported operation' });

      await getJson(`${harness.server.url}/session/${sessionId}`, { method: 'DELETE' });
      expect(harness.host.actions).toContainEqual(expect.objectContaining({ type: 'release-actions' }));
    } finally {
      await harness.close();
    }
  });

  test('uses stable WebDriver element IDs and reports stale references', async () => {
    const harness = await createDesktopDriverTestHarness();
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      const first = await session.findElement('accessibility id', 'button-primary');
      const second = await session.findElement('accessibility id', 'button-primary');
      expect(second.id).toBe(first.id);

      harness.host.removeElement('button');
      await expect(first.getText()).rejects.toMatchObject({ code: 'stale element reference' });
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('rejects duplicate capabilities and concurrent sessions per target', async () => {
    const harness = await createDesktopDriverTestHarness({ launchDelayMs: 50 });
    try {
      const duplicate = await getJson(`${harness.server.url}/session`, {
        method: 'POST',
        body: JSON.stringify({
          capabilities: {
            alwaysMatch: { platformName: 'windows' },
            firstMatch: [{ platformName: 'windows' }],
          },
        }),
        expectStatus: 400,
      });
      expect(duplicate.value).toMatchObject({ error: 'invalid argument' });

      const client = createDesktopDriverClient({ url: harness.server.url });
      const capabilities = { alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id } };
      const [first, second] = await Promise.allSettled([client.newSession(capabilities), client.newSession(capabilities)]);
      expect([first.status, second.status].sort()).toEqual(['fulfilled', 'rejected']);
      const session = first.status === 'fulfilled' ? first.value : second.status === 'fulfilled' ? second.value : undefined;
      expect(session).toBeDefined();
      if (!session) {
        throw new Error('Expected one concurrent session request to succeed.');
      }
      expect(harness.host.actions.filter(({ type }) => type === 'launch')).toHaveLength(1);
      await expect(client.newSession(capabilities)).rejects.toMatchObject({ code: 'session not created' });
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('reports native launch failures as session not created', async () => {
    const harness = await createDesktopDriverTestHarness();
    jest.spyOn(harness.host, 'launch').mockRejectedValue(
      new HostWebDriverError('invalid argument', 'The native launch descriptor was rejected.', {
        operation: 'launch',
      }),
    );
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      await expect(
        client.newSession({
          alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
        }),
      ).rejects.toMatchObject({
        code: 'session not created',
        data: { operation: 'launch' },
        message: 'The native launch descriptor was rejected.',
      });
    } finally {
      await harness.close();
    }
  });

  test('reports native probe failures as session not created', async () => {
    const harness = await createDesktopDriverTestHarness();
    jest.spyOn(harness.host, 'probe').mockRejectedValue(
      new HostWebDriverError('unable to capture screen', 'The native helper could not initialize.', {
        operation: 'probe',
      }),
    );
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      await expect(
        client.newSession({
          alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
        }),
      ).rejects.toMatchObject({
        code: 'session not created',
        data: { operation: 'probe' },
        message: 'The native helper could not initialize.',
      });
    } finally {
      await harness.close();
    }
  });

  test.each([
    ['furn:clickMode', 'not-a-click-mode'],
    ['furn:launchMode', 'not-a-launch-mode'],
  ])('rejects invalid %s before probing the target', async (capability, value) => {
    const harness = await createDesktopDriverTestHarness();
    const probe = jest.spyOn(harness.host, 'probe');
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      await expect(
        client.newSession({
          alwaysMatch: {
            platformName: 'windows',
            'furn:target': harness.target.id,
            [capability]: value,
          },
        }),
      ).rejects.toMatchObject({ code: 'invalid argument' });
      expect(probe).not.toHaveBeenCalled();
    } finally {
      await harness.close();
    }
  });

  test('waits for in-flight session creation before server cleanup', async () => {
    const harness = await createDesktopDriverTestHarness({ launchDelayMs: 80 });
    const client = createDesktopDriverClient({ url: harness.server.url });
    const creating = client.newSession({
      alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
    });

    await waitUntil(() => harness.host.actions.some(({ type }) => type === 'launch'));

    const closing = harness.server.close();
    await expect(creating).rejects.toMatchObject({ code: 'session not created' });
    await closing;
    expect(harness.host.actions).toContainEqual(expect.objectContaining({ type: 'release-actions' }));
    expect(harness.host.actions).toContainEqual(expect.objectContaining({ type: 'close-application' }));
  });

  test('retries host cleanup after the listener has already closed', async () => {
    const harness = await createDesktopDriverTestHarness();
    const dispose = jest.spyOn(harness.host, 'dispose').mockRejectedValueOnce(new Error('first cleanup failed')).mockResolvedValueOnce();
    try {
      await expect(harness.server.close()).rejects.toThrow('Desktop Driver cleanup failed.');
      await expect(harness.server.close()).resolves.toBeUndefined();
      expect(dispose).toHaveBeenCalledTimes(2);
    } finally {
      await harness.server.close();
    }
  });

  test('serializes release behind a timed-out native action and drains the host operation', async () => {
    const harness = await createDesktopDriverTestHarness({ actionDelayMs: 50 });
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });

      harness.server.sessions.get(session.id).desktopTimeouts.nativeCommand = 10;
      const performing = session.performActions([{ id: 'key', type: 'key', actions: [{ type: 'keyDown', value: 'A' }] }]);
      await waitUntil(() => harness.host.actions.some(({ type }) => type === 'actions-start'));
      const releasing = session.releaseActions();

      await expect(performing).rejects.toMatchObject({ code: 'timeout' });
      await expect(releasing).resolves.toBeNull();
      const started = harness.host.actions.findIndex(({ type }) => type === 'actions-start');
      const released = harness.host.actions.findIndex(({ type }) => type === 'release-actions');
      expect(harness.host.actions.some(({ type }) => type === 'actions')).toBe(false);
      expect(released).toBeGreaterThan(started);
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('serializes programmatic focus across independent targets', async () => {
    const state = { active: 0, maximum: 0 };
    class DelayedFocusHost extends FakeDesktopHost {
      override async focus(elementId: string, signal?: AbortSignal): Promise<void> {
        state.active += 1;
        state.maximum = Math.max(state.maximum, state.active);
        try {
          await new Promise((resolve) => setTimeout(resolve, 30));
          await super.focus(elementId, signal);
        } finally {
          state.active -= 1;
        }
      }
    }
    const firstHost = new DelayedFocusHost();
    const secondHost = new DelayedFocusHost();
    const server = await createDesktopDriverServer({
      targets: [
        { endpoint: 'windows', host: firstHost, id: 'first', platformName: 'windows', renderer: 'fabric' },
        { endpoint: 'windows', host: secondHost, id: 'second', platformName: 'windows', renderer: 'fabric' },
      ],
    });
    const client = createDesktopDriverClient({ url: server.url });
    try {
      const firstSession = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': 'first' },
      });
      const secondSession = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': 'second' },
      });
      const firstButton = await firstSession.findElement('accessibility id', 'button-primary');
      const secondButton = await secondSession.findElement('accessibility id', 'button-primary');

      await Promise.all([firstButton.focus(), secondButton.focus()]);

      expect(state.maximum).toBe(1);
      await firstSession.delete();
      await secondSession.delete();
    } finally {
      await server.close();
    }
  });

  test('keeps a target reserved until application teardown completes', async () => {
    const harness = await createDesktopDriverTestHarness({ closeDelayMs: 50 });
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const capabilities = { alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id } };
      const session = await client.newSession(capabilities);
      const deleting = session.delete();
      await waitUntil(() => harness.host.actions.some(({ type }) => type === 'close-application-start'));

      await expect(client.newSession(capabilities)).rejects.toMatchObject({ code: 'session not created' });
      await deleting;
      const replacement = await client.newSession(capabilities);
      await replacement.delete();
    } finally {
      await harness.close();
    }
  });

  test('supports the typed client for elements, text entry, actions, and screenshots', async () => {
    const harness = await createDesktopDriverTestHarness({ endpoint: 'macos', platformName: 'macos' });
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: {
          platformName: 'macos',
          'furn:target': harness.target.id,
          'furn:clickMode': 'accessibility',
        },
      });
      const input = await session.findElement('accessibility id', 'input-name');
      await input.sendKeys('Ada');
      expect(await input.getText()).toBe('Ada');
      await input.clear();
      expect(await input.getText()).toBe('');
      await session.performActions([{ id: 'keyboard', type: 'key', actions: [{ type: 'keyDown', value: '\uE004' }] }]);
      await session.releaseActions();
      expect(await session.takeScreenshot()).toEqual(expect.any(String));
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('routes Storybook commands and invalidates only preview element references', async () => {
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
          tags: ['story'],
          title: 'Components/Button',
        },
      ],
      excluded: [],
      platformManifestDigest: 'platform',
      portablePlanDigest: 'portable',
      schemaVersion: 2,
    };
    let currentStory: StoryReadyResult | null = null;
    const hostRef: { current?: FakeDesktopHost } = {};
    const orchestrator: StoryOrchestrator = {
      async getManifest() {
        return manifest;
      },
      async getCurrentStory() {
        return currentStory;
      },
      async selectStory(request) {
        currentStory = { previewGeneration: 1, runId: request.runId, storyId: request.storyId };
        hostRef.current?.setElementName('story-root', JSON.stringify(currentStory));
        return currentStory;
      },
      async resetStory(request) {
        currentStory = { previewGeneration: 2, runId: request.runId, storyId: request.storyId };
        hostRef.current?.setElementName('story-root', JSON.stringify(currentStory));
        return currentStory;
      },
    };
    const harness = await createDesktopDriverTestHarness({}, orchestrator);
    hostRef.current = harness.host;
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      const previewBefore = await session.findElement('accessibility id', 'button-primary');
      const chromeBefore = await session.findElement('accessibility id', 'app-root');
      const elementOriginActions = [
        {
          id: 'wheel',
          type: 'wheel' as const,
          actions: [
            {
              type: 'scroll',
              deltaX: 0,
              deltaY: 100,
              origin: { [webElementIdentifier]: previewBefore.id },
              x: 0,
              y: 0,
            },
          ],
        },
      ];
      await session.performActions(elementOriginActions);
      expect(harness.host.actions).toContainEqual({
        type: 'actions',
        actions: [
          expect.objectContaining({
            actions: [expect.objectContaining({ origin: { elementId: 'button' } })],
          }),
        ],
      });

      await expect(session.getStoryManifest()).resolves.toEqual(manifest);
      await expect(session.selectStory('components-button--default', 'run-1')).resolves.toMatchObject({
        previewGeneration: 1,
        runId: 'run-1',
      });
      await expect(previewBefore.getText()).rejects.toMatchObject({ code: 'stale element reference' });
      await expect(session.performActions(elementOriginActions)).rejects.toMatchObject({ code: 'stale element reference' });
      await expect(chromeBefore.getTagName()).resolves.toBe('application');

      const previewAfter = await session.findElement('accessibility id', 'button-primary');
      expect(previewAfter.id).not.toBe(previewBefore.id);
      const runnerManifest: DesktopStoryManifest = {
        ...manifest,
        entries: [
          {
            ...manifest.entries[0],
            tests: {
              version: 1,
              tests: [
                {
                  id: 'clicks-button',
                  steps: [
                    { action: 'wait', target: { testId: 'button-primary' }, timeoutMs: 100 },
                    { action: 'click', target: { testId: 'button-primary' } },
                  ],
                },
              ],
            },
          },
        ],
      };
      await expect(
        runDesktopStoryTests({
          endpoint: 'windows',
          manifest: runnerManifest,
          platformName: 'windows',
          selection: { test: 'clicks-button' },
          session,
          targetId: harness.target.id,
        }),
      ).resolves.toMatchObject({ status: 'passed' });
      expect(harness.host.actions).toContainEqual({ type: 'click', elementId: 'button', mode: 'physical' });
      await expect(session.resetStory('components-button--default', 'run-2')).resolves.toMatchObject({
        previewGeneration: 2,
        runId: 'run-2',
      });
      await expect(previewAfter.getText()).rejects.toMatchObject({ code: 'stale element reference' });
      await session.delete();
    } finally {
      await harness.close();
    }
  });

  test('invalidates preview references before a reset whose marker verification fails', async () => {
    const manifest: DesktopStoryManifest = {
      catalogSetDigest: 'catalog-digest',
      endpoint: 'windows',
      entries: [
        {
          id: 'components-button--default',
          name: 'Default',
          packageName: '@fluentui-react-native/components',
          sourcePath: 'button.stories.tsx',
          supportedPlatforms: ['macos', 'windows', 'win32'],
          tags: ['story'],
          title: 'Components/Button',
        },
      ],
      excluded: [],
      platformManifestDigest: 'platform',
      portablePlanDigest: 'portable',
      schemaVersion: 2,
    };
    const hostRef: { current?: FakeDesktopHost } = {};
    const orchestrator: StoryOrchestrator = {
      async getCurrentStory() {
        return null;
      },
      async getManifest() {
        return manifest;
      },
      async resetStory(request) {
        hostRef.current?.resetPreview();
        return { previewGeneration: 1, runId: request.runId, storyId: request.storyId };
      },
      async selectStory(request) {
        return { previewGeneration: 1, runId: request.runId, storyId: request.storyId };
      },
    };
    const harness = await createDesktopDriverTestHarness({}, orchestrator);
    hostRef.current = harness.host;
    try {
      const client = createDesktopDriverClient({ url: harness.server.url });
      const session = await client.newSession({
        alwaysMatch: { platformName: 'windows', 'furn:target': harness.target.id },
      });
      harness.server.sessions.get(session.id).desktopTimeouts.storyRender = 20;
      const preview = await session.findElement('accessibility id', 'button-primary');

      await expect(session.resetStory('components-button--default', 'failed-run')).rejects.toMatchObject({
        code: 'timeout',
      });
      await expect(preview.getText()).rejects.toMatchObject({ code: 'stale element reference' });
      await session.delete();
    } finally {
      await harness.close();
    }
  });
});

type GetJsonOptions = RequestInit & {
  expectStatus?: number;
};

async function getJson(url: string, options: GetJsonOptions = {}): Promise<Record<string, any>> {
  const { expectStatus = 200, ...init } = options;
  const response = await fetch(url, {
    ...init,
    headers: init.body ? { 'Content-Type': 'application/json', ...init.headers } : init.headers,
  });
  expect(response.status).toBe(expectStatus);
  return response.json() as Promise<Record<string, any>>;
}

async function waitUntil(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error('Timed out waiting for the test condition.');
}
