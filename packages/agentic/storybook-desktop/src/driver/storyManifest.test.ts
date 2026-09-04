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
      catalogSetDigest: expect.any(String),
      endpoint: 'windows',
      excluded: [],
      schemaVersion: 2,
      entries: [
        {
          id: 'components-fixturebutton--default',
          packageName: '@fluentui-react-native/storybook-fixture',
          sourcePath: 'button.stories.ts',
          supportedPlatforms: ['macos', 'windows', 'win32'],
          tests: {
            version: 1,
            tests: [{ id: 'clicks-button' }],
          },
        },
      ],
    });
    expect(windows.platformManifestDigest).not.toBe(macos.platformManifestDigest);
    expect(windows.catalogSetDigest).toBe(macos.catalogSetDigest);
    expect(windows.portablePlanDigest).toBe(macos.portablePlanDigest);
  });

  test('applies story support and complete platform-specific test variants', async () => {
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
                  supportedPlatforms: ['macos', 'windows'],
                  traversePlatforms: ['macos'],
                  version: 1,
                  tests: [
                    {
                      id: 'activation',
                      requires: ['focus', 'physical-click'],
                      steps: [{ expect: { state: 'focused', target: { testId: 'fixture-button' }, value: true } }],
                      platformVariants: {
                        macos: {
                          requires: ['physical-click'],
                          steps: [{ expect: { state: 'exists', target: { testId: 'fixture-button' }, value: true } }],
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        }),
      }),
    };

    const macos = await createDesktopStoryManifest(fixtureConfig(), 'macos', tools);
    const windows = await createDesktopStoryManifest(fixtureConfig(), 'windows', tools);
    const win32 = await createDesktopStoryManifest(fixtureConfig(), 'win32', tools);

    expect(macos.entries[0]).toMatchObject({
      supportedPlatforms: ['macos', 'windows'],
      tests: {
        tests: [
          {
            id: 'activation',
            requires: ['physical-click'],
            steps: [{ expect: { state: 'exists' } }],
          },
        ],
      },
    });
    expect(windows.entries[0].tests?.tests[0]).toMatchObject({
      requires: ['focus', 'physical-click'],
      steps: [{ expect: { state: 'focused' } }],
    });
    expect(windows.entries[0].traverse).toBe(false);
    expect(macos.entries[0].traverse).toBeUndefined();
    expect(win32.entries).toEqual([]);
    expect(win32.excluded).toEqual([expect.objectContaining({ id: 'components-fixturebutton--default', reason: 'unsupported-platform' })]);
    expect(macos.catalogSetDigest).toBe(windows.catalogSetDigest);
    expect(windows.catalogSetDigest).toBe(win32.catalogSetDigest);
    expect(macos.portablePlanDigest).toBe(windows.portablePlanDigest);
    expect(windows.portablePlanDigest).toBe(win32.portablePlanDigest);
  });

  test('rejects dynamic, spread, and computed parameter containers and plan keys', async () => {
    const story = { id: 'components-fixturebutton--default', name: 'Default' };
    const dynamicParameterTools = {
      loadCsf: () => ({
        parse: () => ({
          _stories: { Default: story },
          _storyAnnotations: {
            Default: {
              parameters: { type: 'CallExpression', loc: { start: { line: 8 } } },
            },
          },
          meta: { title: 'Components/FixtureButton' },
          stories: [story],
        }),
      }),
    };
    await expect(createDesktopStoryManifest(fixtureConfig(), 'windows', dynamicParameterTools)).rejects.toThrow('static object literal');

    const spreadParameterTools = {
      loadCsf: () => ({
        parse: () => ({
          _stories: { Default: story },
          _storyAnnotations: {
            Default: {
              parameters: {
                type: 'ObjectExpression',
                properties: [{ type: 'SpreadElement', argument: { type: 'Identifier', name: 'shared' } }],
              },
            },
          },
          meta: { title: 'Components/FixtureButton' },
          stories: [story],
        }),
      }),
    };
    await expect(createDesktopStoryManifest(fixtureConfig(), 'windows', spreadParameterTools)).rejects.toThrow('use a spread');

    const computedParameterTools = {
      loadCsf: () => ({
        parse: () => ({
          _stories: { Default: story },
          _storyAnnotations: {
            Default: {
              parameters: {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'ObjectProperty',
                    computed: true,
                    key: { type: 'Identifier', name: 'planKey' },
                    value: { type: 'ObjectExpression', properties: [] },
                    loc: { start: { line: 12 } },
                  },
                ],
              },
            },
          },
          meta: { title: 'Components/FixtureButton' },
          stories: [story],
        }),
      }),
    };
    await expect(createDesktopStoryManifest(fixtureConfig(), 'windows', computedParameterTools)).rejects.toThrow('computed property');

    const computedPlanTools = {
      loadCsf: () => ({
        parse: () => ({
          _stories: { Default: story },
          _storyAnnotations: {
            Default: {
              parameters: {
                type: 'ObjectExpression',
                properties: [
                  {
                    type: 'ObjectProperty',
                    key: { type: 'Identifier', name: 'desktopDriver' },
                    value: {
                      type: 'ObjectExpression',
                      properties: [
                        {
                          type: 'ObjectProperty',
                          computed: true,
                          key: { type: 'Identifier', name: 'version' },
                          value: { type: 'NumericLiteral', value: 1 },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
          meta: { title: 'Components/FixtureButton' },
          stories: [story],
        }),
      }),
    };
    await expect(createDesktopStoryManifest(fixtureConfig(), 'windows', computedPlanTools)).rejects.toThrow('Computed object properties');
  });
});
