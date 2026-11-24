import {
  createWindowsSmokeOptions,
  createWin32RunCommand,
  createWin32SmokeOptions,
  storybook,
} from '@fluentui-react-native/storybook-desktop/config';
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

import appManifest from './app.json' with { type: 'json' };

// RNSVG's WinMD must not target a newer SDK than the app. CI supplies the installed SDK.
const windowsSdkVersion = process.env.WindowsTargetPlatformVersion || '10.0.22621.0';
const windowsArgs = [
  'run-windows',
  '--sln',
  'windows/AgenticStorybook.sln',
  '--no-packager',
  '--msbuildprops',
  `WindowsTargetPlatformVersion=${windowsSdkVersion}`,
];

const win32Host = {
  component: 'AgenticStorybook',
  windowTitle: 'Agentic Components Storybook (Win32)',
} as const;

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: { host: { kind: 'react-native-test-app', renderer: 'fabric' } },
    windows: {
      host: { kind: 'react-native-test-app', renderer: 'fabric' },
      commands: {
        build: { command: 'rnc-cli', args: [...windowsArgs, '--no-deploy', '--no-launch'] },
        run: { command: 'rnc-cli', args: windowsArgs },
      },
    },
    win32: { host: { kind: 'rex', renderer: 'paper', ...win32Host }, commands: { run: createWin32RunCommand(win32Host) } },
  },
  reporting: { artifactsRoot: './artifacts/desktop' },
  suites: { stories: { kind: 'csf-wdio', agent: { lanes: ['accessible', 'physical'] } } },
  integration: storybook({
    storyPackages: [
      [
        '@fluentui-react-native/components',
        {
          platformSettings: {
            windows: {
              storyPatterns: [
                'src/primitives/**/*.stories.?(ts|tsx)',
                'src/components/!(accordion|dialog|rating|select|slider|spin-button)/**/*.stories.?(ts|tsx)',
              ],
            },
            win32: {
              storyPatterns: [
                'src/primitives/**/*.stories.?(ts|tsx)',
                'src/components/!(accordion|dialog|list|list-item|rating|select|slider|spin-button)/**/*.stories.?(ts|tsx)',
              ],
            },
          },
        },
      ],
      [
        '@fluentui-react-native/native-core',
        {
          platformSettings: {
            win32: {
              storyPatterns: ['src/legacy/**/*.stories.?(ts|tsx)'],
            },
          },
        },
      ],
    ],
    platformOptions: {
      macos: {
        // Native smoke builds an instance-specific bundle. Test that bundle rather than starting a second, cold Metro build at launch.
        smoke: { native: { kind: 'macos' }, metro: false },
      },
      windows: {
        smoke: createWindowsSmokeOptions({
          windowTitle: 'Agentic Components Storybook',
        }),
      },
      win32: {
        smoke: createWin32SmokeOptions({
          ...win32Host,
          testIDPrefix: appManifest.storybook.testIDPrefix,
          requiredStoryIds: ['native-callout--default', 'native-callout--placement', 'native-callout--window-commands'],
        }),
      },
    },
  }),
});
