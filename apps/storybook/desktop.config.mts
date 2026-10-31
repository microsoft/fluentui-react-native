import {
  createWindowsSmokeOptions,
  createWin32RunCommand,
  createWin32SmokeCommand,
  storybook,
} from '@fluentui-react-native/storybook-desktop/config';
import { defineDesktopConfig } from '@fluentui-react-native/desktop-test/config';

import appManifest from './app.json' with { type: 'json' };

const win32Host = {
  component: 'AgenticStorybook',
  windowTitle: 'Agentic Components Storybook (Win32)',
} as const;

export default defineDesktopConfig({
  schemaVersion: 1,
  projectRoot: new URL('.', import.meta.url),
  targets: {
    macos: { host: { kind: 'react-native-test-app', renderer: 'fabric' } },
    windows: { host: { kind: 'react-native-test-app', renderer: 'fabric' } },
    win32: { host: { kind: 'rex', renderer: 'paper', ...win32Host }, commands: { run: createWin32RunCommand(win32Host) } },
  },
  reporting: { artifactsRoot: './artifacts/desktop' },
  suites: { stories: { kind: 'csf-wdio' } },
  integration: storybook({
    storyPackages: [
      [
        '@fluentui-react-native/components',
        {
          platformSettings: {
            windows: {
              storyPatterns: ['src/primitives/**/*.stories.?(ts|tsx)', 'src/components/!(accordion)/**/*.stories.?(ts|tsx)'],
            },
            win32: {
              storyPatterns: ['src/primitives/**/*.stories.?(ts|tsx)', 'src/components/!(accordion|list-item)/**/*.stories.?(ts|tsx)'],
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
      windows: {
        smoke: createWindowsSmokeOptions({
          windowTitle: 'Agentic Components Storybook',
        }),
      },
      win32: {
        smoke: {
          command: createWin32SmokeCommand({
            ...win32Host,
            testIDPrefix: appManifest.storybook.testIDPrefix,
            requiredStoryIds: ['native-callout--default', 'native-callout--placement', 'native-callout--window-commands'],
          }),
        },
      },
    },
  }),
});
