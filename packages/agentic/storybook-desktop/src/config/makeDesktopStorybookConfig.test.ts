import path from 'node:path';

import { makeDesktopStorybookConfig } from './makeDesktopStorybookConfig';
import type { Platforms } from './platforms';

const storybookRoot = path.resolve(__dirname, '../../../../../apps/storybook');

function makeAgenticConfig() {
  return makeDesktopStorybookConfig({
    projectRoot: storybookRoot,
    storyPackages: [
      [
        '@fluentui-react-native/components',
        {
          platformSettings: {
            win32: {
              storyPatterns: ['src/primitives/**/*.stories.?(ts|tsx)', 'src/components/!(accordion|list-item)/**/*.stories.?(ts|tsx)'],
            },
          },
        },
      ],
      '@fluentui-react-native/callout',
    ],
  });
}

describe('DesktopStorybookConfig', () => {
  test('reads consuming app metadata on demand', () => {
    const config = makeAgenticConfig();

    expect(config.packageName).toBe('@fluentui-react-native/agentic-components-storybook');
    expect(config.appName).toBe('AgenticStorybook');
    expect(config.displayName).toBe('Agentic Components Storybook');
  });

  test('resolves package roots and default story patterns', () => {
    const config = makeAgenticConfig();
    const packages = config.getStoryPackages('macos');

    expect(packages.map(({ name }) => name)).toEqual(['@fluentui-react-native/components', '@fluentui-react-native/callout']);
    expect(packages[0].root).toBe(path.resolve(storybookRoot, '../../packages/agentic/components'));
    expect(packages[0].storyPatterns).toEqual(['src/**/*.stories.?(ts|tsx)']);
  });

  test('builds platform-specific Storybook story globs', () => {
    const config = makeAgenticConfig();

    expect(config.getStoryGlobs('macos')).toEqual([
      '../../../packages/agentic/components/src/**/*.stories.?(ts|tsx)',
      '../../../packages/native/Callout/src/**/*.stories.?(ts|tsx)',
    ]);
    expect(config.getStoryGlobs('win32')).toEqual([
      '../../../packages/agentic/components/src/primitives/**/*.stories.?(ts|tsx)',
      '../../../packages/agentic/components/src/components/!(accordion|list-item)/**/*.stories.?(ts|tsx)',
      '../../../packages/native/Callout/src/**/*.stories.?(ts|tsx)',
    ]);
  });

  test('filters packages by platform and applies addon defaults', () => {
    const config = makeDesktopStorybookConfig({
      projectRoot: storybookRoot,
      storyPackages: [['@fluentui-react-native/callout', { platforms: ['macos'] }]],
    });

    expect(config.getStorybookConfig('windows')).toMatchObject({
      stories: [],
      deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
    });
  });

  test('rejects invalid platforms, duplicate packages, and escaping patterns', () => {
    expect(() => makeAgenticConfig().getStorybookConfig('ios' as Platforms)).toThrow('must be one of');
    expect(() =>
      makeDesktopStorybookConfig({
        projectRoot: storybookRoot,
        storyPackages: ['@fluentui-react-native/callout', '@fluentui-react-native/callout'],
      }),
    ).toThrow('configured more than once');
    expect(() =>
      makeDesktopStorybookConfig({
        projectRoot: storybookRoot,
        storyPatterns: ['../outside/**/*.stories.tsx'],
      }),
    ).toThrow('must stay within its package');
  });
});
