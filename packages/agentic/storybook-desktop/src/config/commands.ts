import path from 'node:path';
import { createRequire } from 'node:module';

import type { Platforms } from './platforms.ts';

export const desktopStorybookActions = ['server', 'prep', 'bundle', 'run', 'build', 'smoke'] as const;

export type DesktopStorybookAction = (typeof desktopStorybookActions)[number];

/**
 * A command launched from the consuming Storybook app.
 */
export type DesktopCommand = {
  command: string;
  args?: readonly string[];
  cwd?: string;
  env?: Readonly<Record<string, string>>;
};

export type DesktopCommandPlan = DesktopCommand | readonly DesktopCommand[];

export type DesktopNativeProjectOptions = {
  /**
   * Xcode workspace used by rnx-cli on macOS.
   * @default "macos/<appName>.xcworkspace"
   */
  workspace?: string;

  /**
   * Xcode scheme used by rnx-cli on macOS.
   * @default appName
   */
  scheme?: string;

  /**
   * Visual Studio solution used by rnx-cli on Windows.
   * @default "windows/<appName>.sln"
   */
  solution?: string;

  configuration?: 'Debug' | 'Release';
  destination?: 'device' | 'emulator' | 'simulator';
  device?: string;
};

export type DesktopSmokeOptions = {
  /**
   * A complete app-owned smoke command. When set, the reusable server, Metro, traversal, and cleanup lifecycle is skipped.
   */
  command?: DesktopCommandPlan;

  /**
   * Channel server to run while smoke testing.
   * @default storybook-server
   */
  server?: DesktopCommand | false;

  /**
   * Metro server to run while smoke testing.
   * @default rnx-cli start --no-interactive
   */
  metro?: DesktopCommand | false;

  /**
   * App-owned command that stops the launched native application. Required for the reusable smoke lifecycle.
   */
  stop?: DesktopCommandPlan;

  /**
   * Storybook channel server URL.
   * @default http://127.0.0.1:7007
   */
  serverUrl?: string;

  /**
   * Metro status URL.
   * @default http://127.0.0.1:8081/status
   */
  metroUrl?: string;

  /**
   * Maximum time to wait for the channel server and Metro.
   * @default 120000
   */
  startupTimeoutMs?: number;

  /**
   * Delay after selecting each story.
   * @default 0
   */
  settleMs?: number;
};

export type DesktopPlatformOptions = {
  nativeProject?: DesktopNativeProjectOptions;

  /**
   * Override an action's default command plan. Set an action to false when it is intentionally unsupported.
   */
  server?: DesktopCommand | false;
  prep?: DesktopCommandPlan | false;
  bundle?: DesktopCommandPlan | false;
  run?: DesktopCommandPlan | false;
  build?: DesktopCommandPlan | false;
  smoke?: DesktopSmokeOptions | false;
};

export type DesktopPlatformOptionsMap = Partial<Record<Platforms, DesktopPlatformOptions>>;

export type WindowsSmokeCommandOptions = {
  configuration?: 'Debug' | 'Release';
  windowTitle: string;
};

export type Win32HostCommandOptions = {
  component: string;
  windowTitle: string;
};

export type Win32SmokeCommandOptions = Win32HostCommandOptions & {
  requiredStoryIds?: readonly string[];
  testIDPrefix: string;
};

/**
 * Creates the shared Windows Fabric smoke lifecycle command.
 */
export function createWindowsSmokeCommand({ configuration = 'Debug', windowTitle }: WindowsSmokeCommandOptions): DesktopCommand {
  return {
    command: 'pwsh',
    args: ['-NoProfile', '-File', resolveConfigScript('smoke-windows.ps1')],
    env: {
      STORYBOOK_WINDOWS_CONFIGURATION: configuration,
      STORYBOOK_WINDOWS_WINDOW_TITLE: windowTitle,
    },
  };
}

/**
 * Creates the shared prebuilt REX Win32 host command.
 */
export function createWin32RunCommand({ component, windowTitle }: Win32HostCommandOptions): DesktopCommand {
  return {
    command: process.execPath,
    args: [resolveConfigScript('run-win32.cjs')],
    env: {
      STORYBOOK_WIN32_COMPONENT: component,
      STORYBOOK_WIN32_WINDOW_TITLE: windowTitle,
    },
  };
}

/**
 * Creates the shared Win32 bundle, native UX, and story traversal smoke lifecycle command.
 */
export function createWin32SmokeCommand({
  component,
  requiredStoryIds = [],
  testIDPrefix,
  windowTitle,
}: Win32SmokeCommandOptions): DesktopCommand {
  return {
    command: 'pwsh',
    args: ['-NoProfile', '-File', resolveConfigScript('smoke-win32.ps1')],
    env: {
      STORYBOOK_TEST_ID_PREFIX: testIDPrefix,
      STORYBOOK_WIN32_COMPONENT: component,
      STORYBOOK_WIN32_REQUIRED_STORIES: requiredStoryIds.join(','),
      STORYBOOK_WIN32_WINDOW_TITLE: windowTitle,
    },
  };
}

function resolveConfigScript(fileName: string): string {
  const workspaceRequire = createRequire(path.resolve(process.cwd(), 'package.json'));
  const packageJsonPath = workspaceRequire.resolve('@fluentui-react-native/storybook-desktop/package.json');
  return path.resolve(path.dirname(packageJsonPath), 'config', fileName);
}
