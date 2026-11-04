import { createDesktopDriverClient } from '../client/DesktopDriverClient.js';
import type { DesktopSessionClient } from '../client/DesktopDriverClient.js';
import type { DesktopStoryManifest } from '../storybook.js';
import { createDesktopDriverStoryHarness } from '../testing/protocolHarness.js';
import type { DesktopDriverTestHarness } from '../testing/protocolHarness.js';

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

async function withStories(body: (fixture: Fixture) => Promise<void>): Promise<void> {
  const harness = await createDesktopDriverStoryHarness(manifest, { features: { accessibilityActions: true, boundedObservation: true } });
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

  test('leave the target usable after a story that did not render', async () => {
    await withStories(async ({ harness, session }) => {
      const orchestrator = harness.storyOrchestrator!;
      const selectStory = orchestrator.selectStory.bind(orchestrator);
      orchestrator.selectStory = async () => {
        throw new Error('The story threw while rendering.');
      };
      await expect(session.story({ storyId: 'components-button--default' })).rejects.toMatchObject({
        data: { mutation: { disposition: 'indeterminate', effect: 'unknown', quarantined: false }, reason: 'story-not-ready' },
      });
      await expect(session.getCurrentStory()).resolves.toBeNull();

      orchestrator.selectStory = selectStory;
      await expect(session.story({ storyId: 'components-button--default' })).resolves.toMatchObject({
        result: { disposition: 'applied' },
        session: { incarnation: expect.any(Number) },
      });
      expect((await session.story({ storyId: 'components-button--default' })).session).not.toHaveProperty('quarantined');
    });
  });
});
