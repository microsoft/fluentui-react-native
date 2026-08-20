/**
 * macOS platform extension.
 *
 * Everything here is outside the portable subset. A spec that imports this module is a macOS
 * spec and cannot satisfy shared-suite coverage. Shared spec globs reject `.macos.` file names
 * for exactly this reason.
 */

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
export function macos(browser: DesktopBrowserLike, method: Mac2ExecuteMethod, options: Record<string, unknown> = {}): Promise<unknown> {
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

/**
 * Reports the macOS prerequisites.
 *
 * They are reported, not probed: every one of them (Accessibility grants, automation mode, the
 * WebDriverAgentMac cache) needs a macOS API this package has no verified probe for, and a
 * fabricated "ok" is worse than an honest "unknown".
 */
export function checkMacosPrerequisites(): readonly DesktopPrerequisiteStatus[] {
  return MACOS_PREREQUISITES.map((prerequisite) => ({
    ...prerequisite,
    status: 'unknown',
    detail: process.platform === 'darwin' ? 'Not probed' : `Not probed: this machine is ${process.platform}, not darwin`,
  }));
}

/** Terminates a launched macOS application. Refuses to run for an attached target. */
export async function terminateLaunchedApp(browser: DesktopBrowserLike, bundleId: string): Promise<void> {
  const info = await browser.desktop?.getSessionInfo();
  if (info && info.ownership !== 'self') {
    throw new DesktopDriverError('Refusing to terminate an application this session attached to but does not own', {
      kind: 'ownership',
      detail: { bundleId },
    });
  }
  await macos(browser, 'macos: terminateApp', { bundleId });
}
