import path from 'node:path';

import type { DesktopStorybookConfig, ResolvedStoryPackage } from '../config/makeDesktopStorybookConfig.js';
import { createDesktopStoryManifest } from './storyManifest.js';

const projectRoot = path.resolve(__dirname, '../../../../../apps/storybook');
const fixtureRoot = path.resolve(__dirname, 'fixtures');

function fixtureConfig() {
  const storyPackage: ResolvedStoryPackage = {
    manifest: { name: '@fluentui-react-native/storybook-fixture' },
    name: '@fluentui-react-native/storybook-fixture',
    root: fixtureRoot,
    storyPatterns: ['**/*.stories.ts'],
  };
  return {
    projectRoot,
    getStoryPackages: () => [storyPackage],
  } satisfies Pick<DesktopStorybookConfig, 'projectRoot' | 'getStoryPackages'>;
}

describe('createDesktopStoryManifest', () => {
  test('extracts serializable plans and creates stable platform and portable digests', async () => {
    const tools = {
      loadCsf: () => ({
        parse: () => ({
          meta: { title: 'Components/FixtureButton' },
          stories: [
            {
              id: 'components-fixturebutton--default',
              name: 'Default',
              parameters: {
                desktopDriver: {
                  version: 1,
                  tests: [
                    {
                      id: 'clicks-button',
                      requires: ['physical-click'],
                      steps: [{ action: 'click', target: { testId: 'fixture-button' } }],
                    },
                  ],
                },
              },
            },
          ],
        }),
      }),
    };
    const windows = await createDesktopStoryManifest(fixtureConfig(), 'windows', tools);
    const macos = await createDesktopStoryManifest(fixtureConfig(), 'macos', tools);

    expect(windows).toMatchObject({
      endpoint: 'windows',
      schemaVersion: 1,
      entries: [
        {
          id: 'components-fixturebutton--default',
          packageName: '@fluentui-react-native/storybook-fixture',
          sourcePath: 'button.stories.ts',
          tests: {
            version: 1,
            tests: [{ id: 'clicks-button' }],
          },
        },
      ],
    });
    expect(windows.platformManifestDigest).not.toBe(macos.platformManifestDigest);
    expect(windows.portablePlanDigest).toBe(macos.portablePlanDigest);
  });
});
