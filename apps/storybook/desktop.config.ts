import type { DesktopProjectConfig } from '@fluentui-react-native/desktop-driver/config';

const config = {
  schemaVersion: 1,
  rootDir: '.',
  application: {
    manifest: './app.json',
    readyTestId: 'agentic-storybook-theme-none',
  },
  storybook: {
    configDir: './src',
    stories: [
      {
        directory: '../../packages/agentic/components/src',
        files: '**/*.stories.?(ts|tsx)',
      },
      {
        directory: '../../packages/native/Callout/src',
        files: '**/*.stories.?(ts|tsx)',
      },
    ],
    channel: {
      host: '127.0.0.1',
      port: 7007,
      mcp: true,
    },
  },
  tests: {
    generatedDirectory: './desktop-tests/generated',
    fakeScene: './desktop-tests/fake-scene.json',
    artifactsDirectory: './artifacts/desktop-tests',
    framework: 'mocha',
    sessionStrategy: 'suite',
    timeoutMs: 120_000,
    runner: {
      command: 'yarn',
      args: ['wdio', 'run', 'wdio.conf.ts'],
      cwd: '.',
      timeoutMs: 900_000,
    },
  },
  base: {
    driverHost: {
      host: '127.0.0.1',
      port: 0,
      startupTimeoutMs: 120_000,
      logLevel: 'error',
    },
    readiness: {
      requireWindow: true,
      requireStorybookChannel: true,
      requireTestId: 'agentic-storybook-theme-none',
      timeout: 60_000,
    },
  },
  environment: {
    platform: 'DESKTOP_TEST_PLATFORM',
    launchApp: 'DESKTOP_TEST_APP',
    identity: 'DESKTOP_TEST_IDENTITY',
    processId: 'DESKTOP_TEST_PID',
    windowHandle: 'DESKTOP_TEST_WINDOW',
    windowTitle: 'DESKTOP_TEST_WINDOW_TITLE',
    logLevel: 'DESKTOP_TEST_LOG_LEVEL',
    storyFilter: 'DESKTOP_TEST_GREP',
  },
  platforms: {
    fake: {
      backend: 'fake',
      target: {
        defaultMode: 'attach',
        attach: { identity: 'fake' },
      },
      readiness: {
        requireStorybookChannel: false,
        requireTestId: null,
      },
    },
    macos: {
      backend: 'mac2',
      target: {
        defaultMode: 'attach',
        attach: {
          identityFromApplicationManifest: 'macos.bundleIdentifier',
        },
      },
    },
    windows: {
      backend: 'novawindows',
      target: {
        defaultMode: 'attach',
        attach: {
          titleFromApplicationManifest: 'displayName',
        },
      },
    },
  },
} satisfies DesktopProjectConfig;

export default config;
