import { createHash } from 'node:crypto';
import fs from 'node:fs';
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
  test('records executable digests without code and preserves existing static and portable digests', async () => {
    const story = {
      id: 'components-fixturebutton--default',
      name: 'Default',
      parameters: {
        desktopDriver: {
          version: 1,
          tests: [{ id: 'static', steps: [{ action: 'click', target: { testId: 'button' } }] }],
        },
      },
    };
    const tools = {
      loadCsf: () => ({
        parse: () => ({ _stories: { Default: story }, stories: [story], meta: { title: 'Components/FixtureButton' } }),
      }),
    };
    async function manifestForSource(source: string) {
      const read = jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(source);
      try {
        return await createDesktopStoryManifest(fixtureConfig(), 'windows', tools);
      } finally {
        read.mockRestore();
      }
    }
    const before = await manifestForSource(`export const Default = {};`);
    const first = await manifestForSource(`export const Default = { wdio: () => console.log('first-test') };`);
    const changed = await manifestForSource(`export const Default = { wdio: () => console.log('changed-test') };`);
    expect(before.entries[0]).not.toHaveProperty('wdio');
    expect(before.platformManifestDigest).toBe(
      createHash('sha256')
        .update(JSON.stringify({ endpoint: 'windows', entries: before.entries }))
        .digest('hex'),
    );
    expect(first.entries[0].wdio).toEqual({ digest: expect.stringMatching(/^[a-f0-9]{64}$/), exportName: 'Default' });
    expect(JSON.stringify(first)).not.toMatch(/console\.log|first-test/);
    expect(first.entries[0].tests).toEqual(before.entries[0].tests);
    expect(first.portablePlanDigest).toBe(before.portablePlanDigest);
    expect(changed.portablePlanDigest).toBe(before.portablePlanDigest);
    expect(first.platformManifestDigest).not.toBe(before.platformManifestDigest);
    expect(changed.platformManifestDigest).not.toBe(first.platformManifestDigest);
    expect(changed.entries[0].wdio!.digest).not.toBe(first.entries[0].wdio!.digest);
  });

  test('fails instead of silently dropping callbacks from excluded or unrecognized story exports', async () => {
    const read = jest.spyOn(fs, 'readFileSync').mockReturnValueOnce(`export const Excluded = { wdio: () => {} };`);
    try {
      await expect(
        createDesktopStoryManifest(fixtureConfig(), 'windows', {
          loadCsf: () => ({ parse: () => ({ _stories: {}, stories: [], meta: { title: 'Components/FixtureButton' } }) }),
        }),
      ).rejects.toThrow(/button\.stories\.ts.*"Excluded" is not a recognized story export/);
    } finally {
      read.mockRestore();
    }
  });

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
