import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { DesktopSessionClient } from '../client/DesktopDriverClient.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import type { DesktopStoryManifest } from '../storybook.js';
import { createDesktopDriverStoryHarness, createDesktopDriverTestHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';

/** The failure of a command the driver refuses to send because its target is quarantined. */
const blockedByQuarantine = {
  code: 'unknown error',
  data: { mutation: { disposition: 'rejected', effect: 'none', quarantined: true }, reason: 'target-quarantined' },
};

const keyDown = [{ id: 'key', type: 'key' as const, actions: [{ type: 'keyDown' as const, value: 'A' }] }];

type Fixture = {
  capabilities: { alwaysMatch: Record<string, unknown> };
  client: ReturnType<typeof createDesktopDriverClient>;
  element(): Promise<ReturnType<DesktopSessionClient['findElement']> extends Promise<infer T> ? T : never>;
  harness: DesktopDriverTestHarness;
  /** Runs `command` with a short native deadline, so a scripted fault surfaces as a timeout quickly. */
  withShortDeadline<T>(command: () => Promise<T>): Promise<T>;
  session: DesktopSessionClient;
};

async function withFixture(
  options: FakeDesktopHostOptions & { launchMode?: 'attach' | 'launch' },
  body: (fixture: Fixture) => Promise<void>,
): Promise<void> {
  const { launchMode = 'launch', ...hostOptions } = options;
  const harness = await createDesktopDriverTestHarness(hostOptions);
  try {
    const client = createDesktopDriverClient({ url: harness.server.url });
    const capabilities = {
      alwaysMatch: {
        'furn:clickMode': 'accessibility',
        'furn:launchMode': launchMode,
        'furn:target': harness.target.id,
        platformName: 'windows',
      },
    };
    const session = await client.newSession(capabilities);
    await body({
      capabilities,
      client,
      element: () => session.findElement('accessibility id', 'button-primary'),
      harness,
      session,
      withShortDeadline: async (command) => {
        const timeouts = harness.server.sessions.get(session.id).desktopTimeouts;
        const previous = timeouts.nativeCommand;
        timeouts.nativeCommand = 10;
        try {
          return await command();
        } finally {
          timeouts.nativeCommand = previous;
        }
      },
    });
  } finally {
    await harness.close();
  }
}

function recordedClicks(harness: DesktopDriverTestHarness): unknown[] {
  return harness.host.actions.filter(({ type }) => type === 'click');
}

async function readQuarantine(harness: DesktopDriverTestHarness): Promise<Record<string, unknown> | undefined> {
  const status = (await (await fetch(`${harness.server.url}/status`)).json()) as {
    value: { targets: { id: string; quarantine?: Record<string, unknown> }[] };
  };
  return status.value.targets.find(({ id }) => id === harness.target.id)?.quarantine;
}

describe('Desktop Driver mutation settlement', () => {
  test('quarantines the target when a mutation ends without a verdict, and never replays it', async () => {
    await withFixture(
      { faults: { click: { mode: 'lost-response' } } },
      async ({ element: findElement, harness, session, withShortDeadline }) => {
        const element = await findElement();

        await expect(withShortDeadline(() => element.click())).rejects.toMatchObject({
          code: 'timeout',
          data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: true } },
        });

        const before = harness.host.actions.length;
        await expect(element.click()).rejects.toMatchObject(blockedByQuarantine);
        await expect(element.sendKeys('x')).rejects.toMatchObject(blockedByQuarantine);
        await expect(element.clear()).rejects.toMatchObject(blockedByQuarantine);
        await expect(session.performActions(keyDown)).rejects.toMatchObject(blockedByQuarantine);
        await expect(session.command('POST', '/window/rect', { height: 300, width: 400 })).rejects.toMatchObject(blockedByQuarantine);
        expect(harness.host.actions).toHaveLength(before);
        expect(recordedClicks(harness)).toHaveLength(1);
        await expect(session.command('GET', '/window/rect')).resolves.toMatchObject({ height: 600, width: 800 });

        await expect(session.getTree()).resolves.not.toHaveLength(0);
        await expect(session.takeScreenshot()).resolves.toEqual(expect.any(String));
        await expect(session.releaseActions()).resolves.toBeNull();
        await expect(readQuarantine(harness)).resolves.toMatchObject({
          effect: 'unknown',
          sessionId: session.id,
          targetId: harness.target.id,
        });
      },
    );
  });

  test('blocks a mutation queued behind one that ends without a verdict', async () => {
    await withFixture({ faults: { click: { mode: 'hang' } } }, async ({ element: findElement, harness, withShortDeadline }) => {
      const element = await findElement();

      await withShortDeadline(async () => {
        const clicking = element.click();
        await waitUntil(() => harness.host.actions.some(({ type }) => type === 'fault'));
        const typing = element.sendKeys('x');

        await expect(clicking).rejects.toMatchObject({ code: 'timeout' });
        await expect(typing).rejects.toMatchObject(blockedByQuarantine);
      });
      expect(harness.host.actions.some(({ type }) => type === 'send-keys')).toBe(false);
    });
  });

  test('keeps the target usable after a mutation the provider reports as having no effect', async () => {
    await withFixture({ faults: { click: { mode: 'reject' } } }, async ({ element: findElement, harness }) => {
      const element = await findElement();

      await expect(element.click()).rejects.toMatchObject({
        data: { mutation: { disposition: 'rejected', effect: 'none', quarantined: false } },
      });
      await expect(element.click()).resolves.toBeNull();
      expect(recordedClicks(harness)).toHaveLength(1);
      await expect(readQuarantine(harness)).resolves.toBeUndefined();
    });
  });

  test('fails closed when a provider does not report the effect of a failed mutation', async () => {
    await withFixture({ faults: { click: { effect: 'unreported', mode: 'reject' } } }, async ({ element: findElement }) => {
      const element = await findElement();

      await expect(element.click()).rejects.toMatchObject({
        data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: true } },
      });
      await expect(element.click()).rejects.toMatchObject(blockedByQuarantine);
    });
  });

  test('reports a mutation that lands after its deadline as applied without quarantining the target', async () => {
    await withFixture(
      { faults: { click: { delayMs: 40, mode: 'late-success' } } },
      async ({ element: findElement, harness, withShortDeadline }) => {
        const element = await findElement();

        await expect(withShortDeadline(() => element.click())).rejects.toMatchObject({
          code: 'timeout',
          data: { mutation: { disposition: 'applied', effect: 'applied', quarantined: false } },
        });
        expect(recordedClicks(harness)).toHaveLength(1);
        await expect(element.click()).resolves.toBeNull();
        expect(recordedClicks(harness)).toHaveLength(2);
      },
    );
  });

  test('lifts the quarantine when a launched application closes with its session', async () => {
    await withFixture(
      { faults: { click: { mode: 'lost-response' } } },
      async ({ capabilities, client, element: findElement, harness, session, withShortDeadline }) => {
        const element = await findElement();
        await expect(withShortDeadline(() => element.click())).rejects.toMatchObject({ code: 'timeout' });
        await expect(readQuarantine(harness)).resolves.toBeDefined();

        await session.delete();

        await expect(readQuarantine(harness)).resolves.toBeUndefined();
        const replacement = await client.newSession(capabilities);
        await expect(replacement.releaseActions()).resolves.toBeNull();
        await replacement.delete();
      },
    );
  });

  test('keeps an attached target quarantined after its session ends, so it is never terminated or silently reused', async () => {
    await withFixture(
      { faults: { click: { mode: 'lost-response' } }, launchMode: 'attach' },
      async ({ capabilities, client, element: findElement, harness, session, withShortDeadline }) => {
        const element = await findElement();
        await expect(withShortDeadline(() => element.click())).rejects.toMatchObject({ code: 'timeout' });

        await session.delete();

        await expect(client.newSession(capabilities)).rejects.toMatchObject({
          code: 'session not created',
          data: { reason: 'target-quarantined' },
        });
        await expect(readQuarantine(harness)).resolves.toMatchObject({ effect: 'unknown', targetId: harness.target.id });
      },
    );
  });

  test('blocks story navigation and arg updates while the target is quarantined', async () => {
    const manifest: DesktopStoryManifest = {
      endpoint: 'windows',
      entries: [
        {
          id: 'components-button--default',
          name: 'Default',
          packageName: '@fluentui-react-native/components',
          sourcePath: 'src/components/button/button.stories.tsx',
          tags: ['story'],
          title: 'Components/Button',
        },
      ],
      platformManifestDigest: 'platform-digest',
      portablePlanDigest: 'portable-digest',
      schemaVersion: 1,
    };
    const harness = await createDesktopDriverStoryHarness(manifest, { faults: { click: { mode: 'lost-response' } } });
    try {
      const session = await createDesktopDriverClient({ url: harness.server.url }).newSession({
        alwaysMatch: { 'furn:clickMode': 'accessibility', 'furn:target': harness.target.id, platformName: 'windows' },
      });
      await session.selectStory('components-button--default');
      const element = await session.findElement('accessibility id', 'button-primary');
      const timeouts = harness.server.sessions.get(session.id).desktopTimeouts;
      timeouts.nativeCommand = 10;
      await expect(element.click()).rejects.toMatchObject({ code: 'timeout' });
      timeouts.nativeCommand = 30_000;

      await expect(session.selectStory('components-button--default')).rejects.toMatchObject(blockedByQuarantine);
      await expect(session.resetStory('components-button--default')).rejects.toMatchObject(blockedByQuarantine);
      await expect(session.updateStoryArgs('components-button--default', { disabled: true })).rejects.toMatchObject(blockedByQuarantine);
    } finally {
      await harness.close();
    }
  });
});

async function waitUntil(predicate: () => boolean): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (predicate()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error('Timed out waiting for the test condition.');
}
