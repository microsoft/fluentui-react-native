/**
 * Windows platform extension.
 *
 * Everything here is outside the portable subset. A spec that imports this module is a Windows
 * spec and cannot satisfy shared-suite coverage. Shared spec globs reject `.windows.` file names
 * for exactly this reason.
 *
 * PowerShell and arbitrary file transfer stay disabled by default: they turn a UI automation
 * session into general local code execution.
 */

import { DesktopDriverError } from '../errors.ts';
import type { DesktopBrowserLike } from '../wdio/commands.ts';

/** Windows Driver execute methods this package exposes. */
export type WindowsExecuteMethod =
  | 'windows: click'
  | 'windows: hover'
  | 'windows: scroll'
  | 'windows: keys'
  | 'windows: clickAndDrag'
  | 'windows: launchApp'
  | 'windows: closeApp'
  | 'windows: startRecordingScreen'
  | 'windows: stopRecordingScreen'
  | 'windows: setClipboard'
  | 'windows: getClipboard'
  | 'windows: deleteFile'
  | 'windows: powerShell';

const DISABLED_BY_DEFAULT = new Set<WindowsExecuteMethod>(['windows: powerShell', 'windows: deleteFile']);

export interface WindowsExecuteOptions {
  /** Opt in to a method that is disabled by default. */
  allowUnsafe?: boolean;
}

/** Invokes a Windows Driver execute method. */
export function windows(
  browser: DesktopBrowserLike,
  method: WindowsExecuteMethod,
  args: Record<string, unknown> = {},
  options: WindowsExecuteOptions = {},
): Promise<unknown> {
  if (DISABLED_BY_DEFAULT.has(method) && !options.allowUnsafe) {
    throw new DesktopDriverError(`"${method}" is disabled by default because it grants arbitrary local execution`, {
      kind: 'capability',
      detail: { method },
    });
  }
  return browser.execute(method, args);
}

/** Prerequisites `desktop-driver doctor` checks before a Windows run. */
export const WINDOWS_PREREQUISITES: readonly { id: string; description: string }[] = [
  { id: 'gui-session', description: 'An interactive desktop session (UI Automation cannot run headless)' },
  { id: 'winappdriver', description: 'WinAppDriver installed, when the `windows` backend is selected' },
  { id: 'developer-mode', description: 'Windows Developer Mode, required by WinAppDriver' },
  { id: 'app-registration', description: 'The application under test is installed or registered' },
];

/**
 * WebDriver screenshots do not reliably capture WinAppSDK Composition content, so a caller that
 * needs visual evidence must fall back to an OS-level capture rather than trusting a blank image.
 */
export const COMPOSITION_SCREENSHOT_CAVEAT =
  'WebDriver screenshots may omit WinAppSDK Composition content. Capture visual evidence with an OS-level desktop capture instead.';
