/**
 * WebdriverIO configuration for the on-device Storybook desktop tests.
 *
 * One config serves Windows and macOS. Platform selection lives here and in the environment, not
 * in the specs: `desktop-tests/**` and the linked story specs in `packages/agentic/components`
 * run unchanged on both platforms.
 *
 * Usage:
 *   yarn desktop-test:macos      attach to a running macOS Storybook app
 *   yarn desktop-test:windows    attach to a running Windows Storybook app
 *   yarn desktop-test:fake       run the same specs against the in-process contract backend
 *
 * Set `DESKTOP_TEST_APP` to launch instead of attach. Attach mode leaves the application running.
 */
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createDesktopWdioConfig } from '@fluentui-react-native/desktop-driver/wdio';
import type { DesktopAppTarget, DesktopPlatform } from '@fluentui-react-native/desktop-driver';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDir, '..', '..');
const agenticComponents = path.join(repoRoot, 'packages', 'agentic', 'components', 'src');
const calloutPackage = path.join(repoRoot, 'packages', 'native', 'Callout', 'src');

const platform = (process.env.DESKTOP_TEST_PLATFORM ?? 'fake') as DesktopPlatform;

/**
 * Attach is the default so a "Run current test" action from the on-device UI never terminates the
 * Storybook app it was invoked from. Launch mode is opt-in through `DESKTOP_TEST_APP`.
 *
 * The default title is the app's real top-level window title, which is what attach-mode window
 * discovery matches against.
 */
const target: DesktopAppTarget = process.env.DESKTOP_TEST_APP
  ? { mode: 'launch', app: process.env.DESKTOP_TEST_APP }
  : platform === 'macos'
    ? {
        mode: 'attach',
        identity: process.env.DESKTOP_TEST_IDENTITY ?? 'com.microsoft.fluentui.agenticstorybook',
      }
    : {
        mode: 'attach',
        identity: process.env.DESKTOP_TEST_IDENTITY,
        processId: process.env.DESKTOP_TEST_PID ? Number(process.env.DESKTOP_TEST_PID) : undefined,
        windowHandle: process.env.DESKTOP_TEST_WINDOW,
        title: process.env.DESKTOP_TEST_WINDOW_TITLE ?? 'Agentic Components Storybook',
      };

export const config = createDesktopWdioConfig({
  platform,
  target,
  rootDir,
  framework: 'mocha',
  // One warm session for the whole run: the desktop is a single shared resource.
  sessionStrategy: 'suite',
  specs: [
    'desktop-tests/generated/story-plans.generated.spec.ts',
    path.join(agenticComponents, '**', '*.desktop.spec.ts'),
    path.join(calloutPackage, '**', '*.desktop.spec.ts'),
  ],
  storybook: {
    host: process.env.STORYBOOK_WS_HOST ?? '127.0.0.1',
    port: Number(process.env.STORYBOOK_WS_PORT ?? 7007),
    specRoots: [agenticComponents, calloutPackage],
  },
  readiness: {
    // The story controller must answer before any test selects a story.
    requireStorybookChannel: platform !== 'fake',
    // A running native process is not enough; wait until React Native has mounted the app shell.
    requireTestId: platform === 'fake' ? undefined : 'agentic-storybook-theme-none',
  },
  fakeScene: platform === 'fake' ? path.join(rootDir, 'desktop-tests', 'fake-scene.json') : undefined,
  storyManifest: path.join('desktop-tests', 'generated', 'story-tests.manifest.json'),
  artifactsDirectory: path.join(rootDir, 'artifacts', 'desktop-tests'),
  grep: process.env.DESKTOP_TEST_GREP,
  reporters: ['spec'],
  logLevel: (process.env.DESKTOP_TEST_LOG_LEVEL as 'error') ?? 'error',
});
