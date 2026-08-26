import type { Platforms } from './platforms.js';

export const desktopStorybookActions = ['prep', 'bundle', 'run', 'build', 'smoke'] as const;

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
   * Base bundle identifier to suffix with the enlistment identity during isolated macOS smoke tests.
   * @default "com.microsoft.ReactTestApp"
   */
  bundleIdentifier?: string;

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
  prep?: DesktopCommandPlan | false;
  bundle?: DesktopCommandPlan | false;
  run?: DesktopCommandPlan | false;
  build?: DesktopCommandPlan | false;
  smoke?: DesktopSmokeOptions | false;
};

export type DesktopPlatformOptionsMap = Partial<Record<Platforms, DesktopPlatformOptions>>;
