import { DesktopAuthority } from '../authority/grants.js';
import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { FakeDesktopHostOptions } from '../hosts/fake/FakeDesktopHost.js';
import type { DesktopSessionClient } from '../client/DesktopDriverClient.js';
import { attachFailureEffect } from '../protocol/settlement.js';
import type { DesktopStoryManifest, StoryProviderContext } from '../storybook.js';
import { StoryBridgeUnavailableError, StoryProviderError } from '../storybook.js';
import { createOperationStories } from './sessionStories.js';
import { createDesktopDriverStoryHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';
import { createDesktopDriverTestHarness } from '../testing/protocolHarness.js';

const manifest: DesktopStoryManifest = {
  endpoint: 'windows',
  entries: [
    {
      id: 'components-button--default',
      name: 'Default',
      packageName: '@fluentui-react-native/components',
      sourcePath: 'src/components/button/button.stories.tsx',
      tags: [],
      title: 'Components/Button',
    },
    {
      id: 'components-checkbox--default',
      name: 'Default',
      packageName: '@fluentui-react-native/components',
      sourcePath: 'src/components/checkbox/checkbox.stories.tsx',
      tags: [],
      title: 'Components/Checkbox',
    },
  ],
  platformManifestDigest: 'platform-digest',
  portablePlanDigest: 'portable-digest',
  schemaVersion: 1,
};

type Fixture = { harness: DesktopDriverTestHarness; session: DesktopSessionClient };

async function withStories(body: (fixture: Fixture) => Promise<void>, options: FakeDesktopHostOptions = {}): Promise<void> {
  const harness = await createDesktopDriverStoryHarness(manifest, {
    ...options,
    features: { accessibilityActions: true, boundedObservation: true },
  });
  try {
    const session = await createDesktopDriverClient({ url: harness.server.url }).newSession({
      alwaysMatch: { 'furn:clickMode': 'accessibility', 'furn:target': harness.target.id, platformName: 'windows' },
    });
    await body({ harness, session });
  } finally {
    await harness.close();
  }
}

describe('story operations', () => {
  test('built-in manifest, current, reset and args routes all propagate local provider context', async () => {
    await withStories(async ({ harness, session }) => {
      const orchestrator = harness.storyOrchestrator!;
      const seen: StoryProviderContext[] = [];
      const save = (context?: StoryProviderContext) => {
        expect(context?.lifetimeId).toBe(session.id);
        expect(context?.signal).toBeInstanceOf(AbortSignal);
        seen.push(context!);
      };
      const getManifest = orchestrator.getManifest.bind(orchestrator);
      orchestrator.getManifest = (context) => {
        save(context);
        return getManifest(context);
      };
      const getCurrent = orchestrator.getCurrentStory.bind(orchestrator);
      orchestrator.getCurrentStory = (context) => {
        save(context);
        return getCurrent(context);
      };
      const reset = orchestrator.resetStory.bind(orchestrator);
      orchestrator.resetStory = (request, context) => {
        save(context);
        return reset(request, context);
      };
      const update = orchestrator.updateArgs.bind(orchestrator);
      orchestrator.updateArgs = (storyId, args, context) => {
        save(context);
        return update(storyId, args, context);
      };
      const client = createDesktopDriverClient({ url: harness.server.url });
      await client.request('GET', `/session/${session.id}/furn/manifest`);
      await session.story({ storyId: manifest.entries[0].id, action: 'reset' });
      await session.getCurrentStory();
      await client.request('POST', `/session/${session.id}/furn/story/args`, { storyId: manifest.entries[0].id, args: {} });
      expect(seen).toHaveLength(5);
    });
  });

  test('a missing native marker consumes the shared deadline without committing readiness or releasing quarantine', async () => {
    await withStories(async ({ harness, session }) => {
      const state = harness.server.sessions.get(session.id);
      state.desktopTimeouts.storyRender = 20;
      harness.storyOrchestrator!.selectStory = async (request) => ({
        ...request,
        markerVersion: 1,
        connectionEpoch: 'epoch',
        previewGeneration: 1,
      });
      await expect(session.story({ storyId: manifest.entries[0].id })).rejects.toMatchObject({
        data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: true } },
      });
      expect(state.story).toBeNull();
    });
  });

  test('W3C preview mutations reject stale context while chrome and secondary-window references remain live', async () => {
    const rect = { x: 0, y: 0, width: 100, height: 100 };
    await withStories(
      async ({ harness, session }) => {
        await session.story({ storyId: manifest.entries[0].id });
        const preview = await session.findElement('accessibility id', 'preview');
        const chrome = await session.findElement('accessibility id', 'chrome');
        await session.switchToWindow('secondary');
        const secondary = await session.findElement('accessibility id', 'secondary-button');
        await session.switchToWindow('main');
        harness.storyOrchestrator!.getCurrentStory = async () => null;
        await expect(preview.click()).rejects.toMatchObject({ data: { reason: 'story-context-stale' } });
        await expect(chrome.click()).resolves.toBeNull();
        const freshPreview = await session.findElement('accessibility id', 'preview');
        await expect(freshPreview.click()).rejects.toMatchObject({ data: { reason: 'story-context-stale' } });
        await session.switchToWindow('secondary');
        await expect(secondary.click()).resolves.toBeNull();
      },
      {
        windows: [
          {
            id: 'main',
            title: 'Main',
            rect,
            elements: [
              { id: 'story-root', automationId: 'story-root', name: '{}', role: 'group', scope: 'preview', windowId: 'main', rect },
              { id: 'preview', automationId: 'preview', role: 'button', scope: 'preview', windowId: 'main', rect },
              { id: 'chrome', automationId: 'chrome', role: 'button', scope: 'chrome', windowId: 'main', rect },
            ],
          },
          {
            id: 'secondary',
            title: 'Secondary',
            rect,
            elements: [
              {
                id: 'secondary-button',
                automationId: 'secondary-button',
                role: 'button',
                scope: 'secondary-window',
                windowId: 'secondary',
                rect,
              },
            ],
          },
        ],
      },
    );
  });

  test('W3C element-origin actions cannot bypass preview epoch validation', async () => {
    await withStories(async ({ harness, session }) => {
      await session.story({ storyId: manifest.entries[0].id });
      const preview = await session.findElement('accessibility id', 'button-primary');
      harness.storyOrchestrator!.getCurrentStory = async () => null;
      await expect(
        session.performActions([
          {
            type: 'pointer',
            id: 'mouse',
            parameters: { pointerType: 'mouse' },
            actions: [{ type: 'pointerMove', duration: 0, x: 0, y: 0, origin: { 'element-6066-11e4-a52e-4f735466cecf': preview.id } }],
          },
        ]),
      ).rejects.toMatchObject({ data: { reason: 'story-context-stale' } });
    });
  });

  test('passes local session lifetime and deadline signal separately from serialized selection inputs', async () => {
    await withStories(async ({ harness, session }) => {
      const state = harness.server.sessions.get(session.id);
      state.desktopTimeouts.storyRender = 20;
      harness.storyOrchestrator!.selectStory = async (input, context) => {
        expect(Object.keys(input).sort()).toEqual(['requestId', 'runId', 'storyId']);
        expect(context?.lifetimeId).toBe(session.id);
        return new Promise((_resolve, reject) => {
          context!.signal.addEventListener('abort', () => reject(new StoryProviderError('Cancelled after dispatch.', 'unknown')), {
            once: true,
          });
        });
      };
      await expect(session.story({ storyId: manifest.entries[0].id })).rejects.toMatchObject({
        data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: true } },
      });
    });
  });

  test('an unavailable bridge rejects without quarantining and the operation catalog excludes source/test metadata', async () => {
    await withStories(async ({ harness, session }) => {
      const state = harness.server.sessions.get(session.id);
      const stories = createOperationStories(state, harness.server.sessions, new AbortController().signal)!;
      expect(await stories.catalog(new AbortController().signal)).toEqual(
        manifest.entries.map(({ id, name, tags, title }) => ({ id, name, tags, title })),
      );
      harness.storyOrchestrator!.selectStory = async () => {
        throw new StoryBridgeUnavailableError('windows', 'fabric', 'bridge-unavailable');
      };
      await expect(session.story({ storyId: manifest.entries[0].id })).rejects.toMatchObject({
        data: { mutation: { effect: 'none', quarantined: false } },
      });
    });
  });

  test('context-sensitive input rejects stale previews when the provider disconnects or changes epoch', async () => {
    await withStories(async ({ harness, session }) => {
      await session.story({ storyId: manifest.entries[0].id });
      const found = (await session.find({ automationId: 'button-primary' })).result;
      const getCurrent = harness.storyOrchestrator!.getCurrentStory.bind(harness.storyOrchestrator);
      harness.storyOrchestrator!.getCurrentStory = async () => null;
      await expect(session.act({ action: 'activate', ref: found.matches[0].ref, sample: found.sample.id })).rejects.toMatchObject({
        code: 'stale element reference',
        data: { reason: 'story-context-stale', mutation: { effect: 'none' } },
      });
      expect(harness.server.sessions.get(session.id).story).toBeNull();
      const fresh = (await session.find({ automationId: 'button-primary' })).result;
      await expect(session.act({ action: 'activate', ref: fresh.matches[0].ref, sample: fresh.sample.id })).rejects.toMatchObject({
        data: { reason: 'story-context-stale', mutation: { effect: 'none' } },
      });
      harness.storyOrchestrator!.getCurrentStory = getCurrent;
      await session.story({ storyId: manifest.entries[0].id });
      const selected = (await session.find({ automationId: 'button-primary' })).result;
      await expect(session.act({ action: 'activate', ref: selected.matches[0].ref, sample: selected.sample.id })).resolves.toBeDefined();
    });
  });

  test('context-sensitive input rejects mismatched native markers without needing an intervening stories read', async () => {
    await withStories(async ({ harness, session }) => {
      await session.story({ storyId: manifest.entries[0].id });
      const found = (await session.find({ automationId: 'button-primary' })).result;
      harness.host.setElementName('story-root', JSON.stringify({ storyId: manifest.entries[1].id }));
      await expect(session.act({ action: 'activate', ref: found.matches[0].ref, sample: found.sample.id })).rejects.toMatchObject({
        code: 'stale element reference',
        data: { reason: 'story-context-stale' },
      });
    });
  });

  test('select a story the story root confirms, and expire references into the preview it replaced', async () => {
    await withStories(async ({ session }) => {
      expect((await session.stories()).result).toEqual({
        entries: [
          { id: 'components-button--default', name: 'Default', title: 'Components/Button' },
          { id: 'components-checkbox--default', name: 'Default', title: 'Components/Checkbox' },
        ],
        matched: 2,
        total: 2,
      });
      const found = (await session.find({ automationId: 'button-primary' })).result;
      expect(found.outcome).toBe('unique');

      const selected = (await session.story({ storyId: 'components-button--default' })).result;
      expect(selected).toMatchObject({ disposition: 'applied', storyId: 'components-button--default', verification: 'marker' });
      expect(selected.region).toBeGreaterThan(found.sample.epoch.region);
      await expect(session.getCurrentStory()).resolves.toMatchObject({ storyId: 'components-button--default' });
      expect((await session.stories({ filter: 'checkbox' })).result).toMatchObject({
        current: { storyId: 'components-button--default', verification: 'marker' },
        matched: 1,
      });
      await expect(session.observe({ within: found.matches[0].ref })).rejects.toMatchObject({
        code: 'stale element reference',
        data: { reason: 'ref-region-changed' },
      });
    });
  });

  test('notice a story another client rendered, and forget the selection once', async () => {
    await withStories(async ({ harness, session }) => {
      await session.story({ storyId: 'components-button--default' });
      const region = (await session.story({ action: 'reset', storyId: 'components-button--default' })).result.region;
      harness.host.setElementName('story-root', JSON.stringify({ previewGeneration: 0, storyId: 'components-checkbox--default' }));

      const changed = (await session.stories()).result;
      expect(changed.changed).toBe(true);
      expect(changed).not.toHaveProperty('current');
      await expect(session.getCurrentStory()).resolves.toBeNull();
      const after = (await session.observe()).result;
      expect(after.sample.epoch.region).toBeGreaterThan(region);
      expect((await session.stories()).result).not.toHaveProperty('changed');
    });
  });

  test('same-session select/reset never revives old preview references when native records survive and are observed again', async () => {
    await withStories(async ({ harness, session }) => {
      // A native preview container can survive a React render; keep its fake native records alive too.
      jest.spyOn(harness.host, 'resetPreview').mockImplementation(() => {});
      const old = (await session.find({ automationId: 'button-primary' })).result;
      const oldRef = old.matches[0].ref;
      const native = harness.server.sessions.get(session.id).operations.refs.resolve(oldRef, old.sample.epoch.region);
      if (!native.ok) throw new Error('The initial preview reference must resolve.');
      for (const action of ['select', 'reset'] as const) {
        const before = (await session.find({ automationId: 'button-primary' })).result;
        const beforeRef = before.matches[0].ref;
        const changed = (await session.story({ action, storyId: manifest.entries[0].id })).result;
        expect(changed).toMatchObject({ disposition: 'applied', verification: 'marker' });
        expect(changed.region).toBeGreaterThan(before.sample.epoch.region);
        await expect(session.observe({ within: beforeRef })).rejects.toMatchObject({
          code: 'stale element reference',
          data: { reason: 'ref-region-changed' },
        });
        const current = (await session.find({ automationId: 'button-primary' })).result;
        await expect(session.observe({ within: beforeRef })).rejects.toMatchObject({ code: 'stale element reference' });
        expect(current.matches[0].ref).not.toBe(beforeRef);
        const resolved = harness.server.sessions.get(session.id).operations.refs.resolve(current.matches[0].ref, changed.region);
        expect(resolved).toMatchObject({ ok: true, entry: { nativeId: native.entry.nativeId } });
        await expect(session.observe({ within: current.matches[0].ref })).resolves.toBeDefined();
      }
      await expect(session.observe({ within: oldRef })).rejects.toMatchObject({ code: 'stale element reference' });
    });
  });

  test('fence further mutations after a story whose completion is unknown, without recording runtime text', async () => {
    await withStories(async ({ harness, session }) => {
      const orchestrator = harness.storyOrchestrator!;
      const selectStory = orchestrator.selectStory.bind(orchestrator);
      orchestrator.selectStory = async () => {
        throw new Error('The story threw while rendering.');
      };
      await expect(session.story({ storyId: 'components-button--default' })).rejects.toMatchObject({
        data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: true }, reason: 'story-not-ready' },
      });
      await expect(session.getCurrentStory()).resolves.toBeNull();

      orchestrator.selectStory = selectStory;
      await expect(session.story({ storyId: 'components-button--default' })).rejects.toMatchObject({
        data: { reason: 'target-quarantined' },
      });
      expect(JSON.stringify(await session.journal())).not.toContain('The story threw');
      expect(JSON.stringify(harness.server.sessions.getQuarantine(harness.target.id))).not.toContain('The story threw');
      await expect(session.observe()).resolves.toBeDefined();
    });
  });

  test('refuses args on a protected service even for the session-owning grant', async () => {
    const storyHarness = await createDesktopDriverStoryHarness(manifest);
    const authority = new DesktopAuthority();
    const grant = authority.issue({ label: 'agent', targets: '*' });
    const harness = await createDesktopDriverTestHarness({}, storyHarness.storyOrchestrator, { authority });
    try {
      const client = createDesktopDriverClient({ grant: grant.token, url: harness.server.url });
      const session = await client.newSession({ alwaysMatch: { 'furn:target': harness.target.id } });
      const owner = harness.server.sessions.get(session.id);
      const foreign = authority.issue({ label: 'foreign', targets: '*' });
      const foreignClient = createDesktopDriverClient({ grant: foreign.token, url: harness.server.url });
      const anonymous = createDesktopDriverClient({ url: harness.server.url });
      const select = jest.spyOn(storyHarness.storyOrchestrator!, 'selectStory');
      const before = owner.story;
      for (const rejected of [foreignClient, anonymous]) {
        for (const route of ['/furn/story', '/furn/story/reset', '/furn/story/args']) {
          await expect(
            rejected.request('POST', `/session/${session.id}${route}`, {
              requestId: 'unauthorized',
              runId: 'unauthorized',
              storyId: 'components-button--default',
              args: { label: 'private-value-never-recorded' },
            }),
          ).rejects.toBeDefined();
        }
      }
      expect(select).not.toHaveBeenCalled();
      await expect(
        client.request('POST', `/session/${session.id}/furn/story/args`, {
          storyId: 'components-button--default',
          args: { label: 'not dispatched' },
        }),
      ).rejects.toMatchObject({ code: 'unsupported operation', data: { reason: 'story-args-unsupported' } });
      expect(storyHarness.storyOrchestrator!.argUpdates).toEqual([]);
      expect(owner.story).toEqual(before);
      expect(JSON.stringify(await session.journal())).not.toContain('private-value-never-recorded');
      expect(JSON.stringify(await session.journal())).not.toContain('not dispatched');
    } finally {
      await harness.close();
      await storyHarness.close();
    }
  });

  test('allows a new selection after a provider proves nothing was dispatched', async () => {
    await withStories(async ({ harness, session }) => {
      const orchestrator = harness.storyOrchestrator!;
      const select = orchestrator.selectStory.bind(orchestrator);
      orchestrator.selectStory = async () => {
        throw attachFailureEffect(new Error('Refused before dispatch'), 'none');
      };
      await expect(session.story({ storyId: 'components-button--default' })).rejects.toMatchObject({
        data: { mutation: { disposition: 'rejected', effect: 'none', quarantined: false } },
      });
      orchestrator.selectStory = select;
      await expect(session.story({ storyId: 'components-button--default' })).resolves.toMatchObject({
        result: { disposition: 'applied' },
      });
    });
  });

  test('keeps the session queue until a dispatched story settles after caller cancellation', async () => {
    await withStories(async ({ harness, session }) => {
      let dispatched!: () => void;
      const entered = new Promise<void>((resolve) => {
        dispatched = resolve;
      });
      let rejectRender!: (error: Error) => void;
      const render = new Promise<never>((_resolve, reject) => {
        rejectRender = reject;
      });
      harness.storyOrchestrator!.selectStory = async () => {
        dispatched();
        return render;
      };
      const caller = new AbortController();
      const selection = session.story({ storyId: 'components-button--default' }, { signal: caller.signal });
      const cancelled = expect(selection).rejects.toThrow();
      try {
        await entered;
        caller.abort();
        await cancelled;
        let nextCompleted = false;
        const next = session.story({ storyId: 'components-checkbox--default' }).finally(() => {
          nextCompleted = true;
        });
        const fenced = expect(next).rejects.toMatchObject({ data: { reason: 'target-quarantined' } });
        await new Promise((resolve) => setTimeout(resolve, 25));
        expect(nextCompleted).toBe(false);
        rejectRender(new Error('Unconfirmed remote render'));
        await fenced;
        expect(harness.server.sessions.getQuarantine(harness.target.id)).toBeDefined();
      } finally {
        rejectRender(new Error('Fixture cleanup'));
        caller.abort();
      }
    });
  });
});
