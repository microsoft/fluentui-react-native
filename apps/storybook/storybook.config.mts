import {
  createWindowsSmokeCommand,
  createWin32RunCommand,
  createWin32SmokeCommand,
  makeDesktopStorybookConfig,
} from '@fluentui-react-native/storybook-desktop/config';

import appManifest from './app.json' with { type: 'json' };

const win32Host = {
  component: 'AgenticStorybook',
  windowTitle: 'Agentic Components Storybook (Win32)',
} as const;

export default makeDesktopStorybookConfig({
  projectRoot: new URL('.', import.meta.url),
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
      '@fluentui-react-native/callout',
      {
        platformSettings: {
          windows: {
            storyPatterns: [],
          },
        },
      },
    ],
  ],
  platformOptions: {
    windows: {
      smoke: {
        command: createWindowsSmokeCommand({
          windowTitle: 'Agentic Components Storybook',
        }),
      },
    },
    win32: {
      run: createWin32RunCommand(win32Host),
      smoke: {
        command: createWin32SmokeCommand({
          ...win32Host,
          testIDPrefix: appManifest.storybook.testIDPrefix,
          requiredStoryIds: ['primitives-callout--default', 'primitives-callout--placement', 'primitives-callout--window-commands'],
        }),
      },
    },
  },
});
