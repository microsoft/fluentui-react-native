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
    macos: {
      nativeProject: {
        bundleIdentifier: 'com.microsoft.fluentui.agenticstorybook',
      },
      build: {
        command: 'xcodebuild',
        args: [
          '-workspace',
          'macos/AgenticStorybook.xcworkspace',
          '-scheme',
          'AgenticStorybook',
          '-configuration',
          'Debug',
          '-destination',
          'platform=macOS',
          '-derivedDataPath',
          'macos/DerivedData',
          'CODE_SIGNING_ALLOWED=NO',
          'build',
        ],
      },
      smoke: {
        stop: {
          command: 'osascript',
          args: ['scripts/stop-macos-storybook.applescript'],
        },
      },
    },
    windows: {
      build: {
        command: 'react-native',
        args: [
          'run-windows',
          '--arch',
          'x64',
          '--sln',
          'windows/AgenticStorybook.sln',
          '--no-packager',
          '--no-deploy',
          '--no-launch',
          '--logging',
          '--no-telemetry',
          '--buildLogDirectory',
          'artifacts/windows/build-logs',
        ],
      },
      smoke: {
        command: {
          command: 'pwsh',
          args: ['-NoProfile', '-File', 'scripts/run-windows-smoke.ps1'],
        },
      },
    },
    win32: {
      build: false,
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
