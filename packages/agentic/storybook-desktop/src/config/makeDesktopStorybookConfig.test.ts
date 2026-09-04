import path from 'node:path';

import { createWindowsSmokeCommand, createWindowsSmokeOptions, createWin32RunCommand, createWin32SmokeCommand } from './commands';
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
    expect(config.macosBundleIdentifier).toBe('com.microsoft.fluentui.agenticstorybook');
    expect(config.testIDPrefix).toBe('agentic-storybook');
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

  test('builds platform command defaults from app metadata with rnx-cli', () => {
    const config = makeAgenticConfig();

    expect(config.getCommandPlan('server', 'win32')).toEqual({
      command: process.execPath,
      args: [path.resolve(storybookRoot, '../../packages/agentic/storybook-desktop/config/server-runner.cjs')],
      env: {
        STORYBOOK_CONFIG_PATH: path.join(storybookRoot, 'src'),
        STORYBOOK_PROJECT_ROOT: storybookRoot,
      },
    });
    expect(config.getPlatformOptions('macos')).toMatchObject({
      nativeProject: {
        workspace: 'macos/AgenticStorybook.xcworkspace',
        scheme: 'AgenticStorybook',
      },
      build: {
        command: 'rnx-cli',
        args: ['build', '--platform', 'macos', '--workspace', 'macos/AgenticStorybook.xcworkspace', '--scheme', 'AgenticStorybook'],
      },
    });
    expect(config.getCommandPlan('build', 'macos')).toEqual({
      command: 'rnx-cli',
      args: ['build', '--platform', 'macos', '--workspace', 'macos/AgenticStorybook.xcworkspace', '--scheme', 'AgenticStorybook'],
    });
    expect(config.getCommandPlan('run', 'windows')).toEqual({
      command: 'rnx-cli',
      args: ['run', '--platform', 'windows', '--solution', 'windows/AgenticStorybook.sln'],
    });
    expect(config.getCommandPlan('build', 'win32')).toBe(false);
    expect(config.getSmokeOptions('macos')).toEqual({
      stop: {
        command: 'osascript',
        args: [path.resolve(storybookRoot, '../../packages/agentic/storybook-desktop/config/stop-macos-app.applescript')],
      },
    });
  });

  test('preserves explicit platform command overrides', () => {
    const config = makeDesktopStorybookConfig({
      projectRoot: storybookRoot,
      platformOptions: {
        windows: {
          nativeProject: {
            configuration: 'Release',
          },
          build: {
            command: 'custom-build',
          },
        },
      },
    });

    expect(config.getCommandPlan('build', 'windows')).toEqual({ command: 'custom-build' });
    expect(config.getPlatformOptions('windows').nativeProject).toEqual({
      solution: 'windows/AgenticStorybook.sln',
      configuration: 'Release',
    });
    expect(config.getCommandPlan('run', 'windows')).toEqual({
      command: 'rnx-cli',
      args: ['run', '--platform', 'windows', '--solution', 'windows/AgenticStorybook.sln', '--configuration', 'Release'],
    });
  });

  test('resolves native driver paths and application identity from the consuming project', () => {
    const config = makeDesktopStorybookConfig({
      projectRoot: storybookRoot,
      platformOptions: {
        macos: {
          nativeDriver: {
            macosSigningIdentity: 'Apple Development: Example',
          },
        },
        win32: {
          nativeDriver: {
            application: {
              executablePath: 'tools/ReactTest.exe',
              windowTitle: 'Consumer Storybook (Win32)',
            },
            buildPolicy: 'never',
            cacheRoot: '.cache/native-driver',
            helperPath: 'tools/driver.exe',
            installRoot: 'tools/native-driver',
          },
        },
      },
    });

    expect(config.getNativeDriverOptions('win32')).toEqual({
      application: {
        executablePath: path.join(storybookRoot, 'tools/ReactTest.exe'),
        windowTitle: 'Consumer Storybook (Win32)',
      },
      buildPolicy: 'never',
      cacheRoot: path.join(storybookRoot, '.cache/native-driver'),
      configuration: 'release',
      helperPath: path.join(storybookRoot, 'tools/driver.exe'),
      installRoot: path.join(storybookRoot, 'tools/native-driver'),
    });
    expect(config.getNativeDriverOptions('macos')).toMatchObject({
      application: {
        bundleIdentifier: 'com.microsoft.fluentui.agenticstorybook',
        windowTitle: 'Agentic Components Storybook',
      },
      configuration: 'release',
      macosSigningIdentity: 'Apple Development: Example',
    });
  });

  test('creates package-owned Windows and Win32 smoke commands', () => {
    const configDirectory = path.resolve(__dirname, '../../config');

    expect(createWindowsSmokeCommand({ windowTitle: 'Consumer Storybook' })).toEqual({
      command: 'pwsh',
      args: ['-NoProfile', '-File', path.join(configDirectory, 'smoke-windows.ps1')],
      env: {
        STORYBOOK_WINDOWS_CONFIGURATION: 'Debug',
        STORYBOOK_WINDOWS_WINDOW_TITLE: 'Consumer Storybook',
      },
    });
    expect(createWindowsSmokeOptions({ windowTitle: 'Consumer Storybook' })).toEqual({
      command: {
        command: 'pwsh',
        args: ['-NoProfile', '-File', path.join(configDirectory, 'smoke-windows.ps1')],
        env: {
          STORYBOOK_WINDOWS_CONFIGURATION: 'Debug',
          STORYBOOK_WINDOWS_WINDOW_TITLE: 'Consumer Storybook',
        },
      },
      // eslint-disable-next-line @microsoft/sdl/no-insecure-url -- React Native Test App uses loopback Metro
      metroUrl: 'http://127.0.0.1:8081/status',
    });
    expect(createWin32RunCommand({ component: 'ConsumerStorybook', windowTitle: 'Consumer Storybook (Win32)' })).toEqual({
      command: process.execPath,
      args: [path.join(configDirectory, 'run-win32.cjs')],
      env: {
        STORYBOOK_WIN32_COMPONENT: 'ConsumerStorybook',
        STORYBOOK_WIN32_WINDOW_TITLE: 'Consumer Storybook (Win32)',
      },
    });
    expect(
      createWin32SmokeCommand({
        component: 'ConsumerStorybook',
        requiredStoryIds: ['first--story', 'second--story'],
        testIDPrefix: 'consumer-storybook',
        windowTitle: 'Consumer Storybook (Win32)',
      }),
    ).toEqual({
      command: 'pwsh',
      args: ['-NoProfile', '-File', path.join(configDirectory, 'smoke-win32.ps1')],
      env: {
        STORYBOOK_TEST_ID_PREFIX: 'consumer-storybook',
        STORYBOOK_WIN32_COMPONENT: 'ConsumerStorybook',
        STORYBOOK_WIN32_REQUIRED_STORIES: 'first--story,second--story',
        STORYBOOK_WIN32_WINDOW_TITLE: 'Consumer Storybook (Win32)',
      },
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
