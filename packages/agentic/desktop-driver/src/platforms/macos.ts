/**
 * macOS platform extension.
 *
 * Everything here is outside the portable subset. A spec that imports this module is a macOS
 * spec and cannot satisfy shared-suite coverage. Shared spec globs reject `.macos.` file names
 * for exactly this reason.
 */

import { execFileSync } from 'node:child_process';

import { DesktopDriverError } from '../errors.ts';
import type { DesktopBrowserLike } from '../wdio/commands.ts';
import type { DesktopPrerequisiteStatus } from '../types.ts';

/** Mac2 execute methods this package exposes. The full set is documented by `appium-mac2-driver`. */
export type Mac2ExecuteMethod =
  | 'macos: click'
  | 'macos: rightClick'
  | 'macos: doubleClick'
  | 'macos: clickAndDrag'
  | 'macos: hover'
  | 'macos: keys'
  | 'macos: scroll'
  | 'macos: swipe'
  | 'macos: launchApp'
  | 'macos: activateApp'
  | 'macos: terminateApp'
  | 'macos: queryAppState'
  | 'macos: source'
  | 'macos: screenshots'
  | 'macos: startRecordingScreen'
  | 'macos: stopRecordingScreen'
  | 'macos: setClipboard'
  | 'macos: getClipboard';

/** Invokes a Mac2 execute method. */
export async function macos(
  browser: DesktopBrowserLike,
  method: Mac2ExecuteMethod,
  options: Record<string, unknown> = {},
): Promise<unknown> {
  if (method === 'macos: terminateApp') {
    await assertSelfOwnership(browser, method);
  }
  return browser.execute(method, options);
}

/** Prerequisites `desktop-driver doctor` reports before a macOS run. */
export const MACOS_PREREQUISITES: readonly { id: string; description: string }[] = [
  { id: 'macos-version', description: 'macOS 11.3 or newer' },
  { id: 'xcode', description: 'Xcode 13 or newer with matching Command Line Tools' },
  { id: 'accessibility-permission', description: 'Xcode Helper granted Accessibility permission' },
  { id: 'automation-mode', description: 'Automation mode enabled for the current macOS release' },
  { id: 'gui-session', description: 'A logged-in GUI session (WebDriverAgentMac cannot run headless)' },
  { id: 'wda-build-cache', description: 'A writable, reusable WebDriverAgentMac derived-data cache' },
];

interface CommandProbe {
  status: 'ok' | 'missing' | 'unknown';
  detail?: string;
}

/** Runs a bounded command probe without turning every execution failure into "missing". */
function probe(command: string, args: readonly string[]): CommandProbe {
  try {
    return {
      status: 'ok',
      detail: execFileSync(command, args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 10_000,
      }).trim(),
    };
  } catch (error) {
    const failure = error as NodeJS.ErrnoException;
    return {
      status: failure.code === 'ENOENT' ? 'missing' : 'unknown',
      detail: failure.code ?? failure.message,
    };
  }
}

/** Reports the macOS prerequisites, probing only versioned command-line tools. */
export function checkMacosPrerequisites(hostPlatform: NodeJS.Platform = process.platform): readonly DesktopPrerequisiteStatus[] {
  if (hostPlatform !== 'darwin') {
    return MACOS_PREREQUISITES.map((prerequisite) => ({
      ...prerequisite,
      status: 'unknown',
      detail: `Not probed: this machine is ${hostPlatform}, not darwin`,
    }));
  }

  const byId = (id: string): { id: string; description: string } => MACOS_PREREQUISITES.find((entry) => entry.id === id)!;
  const version = probe('sw_vers', ['-productVersion']);
  const majorMinor = version.status === 'ok' ? version.detail?.split('.').slice(0, 2).map(Number) : undefined;
  const supportedVersion = majorMinor && majorMinor.length === 2 && (majorMinor[0] > 11 || (majorMinor[0] === 11 && majorMinor[1] >= 3));
  const xcode = probe('xcodebuild', ['-version']);
  const xcodeMajor = xcode.status === 'ok' ? Number.parseInt(/^Xcode\s+(\d+)/.exec(xcode.detail ?? '')?.[1] ?? '', 10) : undefined;
  const xcodeStatus =
    xcode.status !== 'ok' ? xcode.status : xcodeMajor !== undefined && !Number.isNaN(xcodeMajor) && xcodeMajor >= 13 ? 'ok' : 'missing';

  return [
    {
      ...byId('macos-version'),
      status: version.status !== 'ok' ? 'unknown' : supportedVersion ? 'ok' : 'missing',
      detail: version.detail,
    },
    {
      ...byId('xcode'),
      status: xcodeStatus,
      detail: xcode.status === 'ok' ? xcode.detail?.split('\n')[0] : xcode.detail,
    },
    ...MACOS_PREREQUISITES.filter((entry) => entry.id !== 'macos-version' && entry.id !== 'xcode').map((prerequisite) => ({
      ...prerequisite,
      status: 'unknown' as const,
      detail: 'Not probed',
    })),
  ];
}

/** Terminates a launched macOS application. Refuses to run for an attached target. */
export async function terminateLaunchedApp(browser: DesktopBrowserLike, bundleId: string): Promise<void> {
  await macos(browser, 'macos: terminateApp', { bundleId });
}

async function assertSelfOwnership(browser: DesktopBrowserLike, method: Mac2ExecuteMethod): Promise<void> {
  const info = await browser.desktop?.getSessionInfo();
  if (!info || info.ownership !== 'self') {
    throw new DesktopDriverError('Refusing to terminate an application without positively observed self ownership', {
      kind: 'ownership',
      detail: { method },
    });
  }
}
