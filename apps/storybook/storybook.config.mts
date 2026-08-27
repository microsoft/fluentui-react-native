import { makeDesktopStorybookConfig } from '@fluentui-react-native/storybook-desktop/config';

export default makeDesktopStorybookConfig({
  projectRoot: new URL('.', import.meta.url),
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
  platformOptions: {
    windows: {
      smoke: {
        command: {
          command: 'pwsh',
          args: ['-NoProfile', '-File', 'scripts/run-windows-smoke.ps1'],
        },
      },
    },
    win32: {
      run: {
        command: 'node',
        args: ['scripts/run-win32.cjs'],
      },
      smoke: {
        command: {
          command: 'yarn',
          args: ['win32:ci'],
        },
      },
    },
  },
});
