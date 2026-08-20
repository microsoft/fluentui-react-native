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

import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { DesktopDriverError } from '../errors.ts';
import type { DesktopBrowserLike } from '../wdio/commands.ts';
import type { DesktopPrerequisiteStatus } from '../types.ts';

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
    return Promise.reject(
      new DesktopDriverError(`"${method}" is disabled by default because it grants arbitrary local execution`, {
        kind: 'capability',
        detail: { method },
      }),
    );
  }
  if (method === 'windows: closeApp') {
    return assertSelfOwnership(browser, method).then(() => browser.execute(method, args));
  }
  return browser.execute(method, args);
}

async function assertSelfOwnership(browser: DesktopBrowserLike, method: WindowsExecuteMethod): Promise<void> {
  const info = await browser.desktop?.getSessionInfo();
  if (!info || info.ownership !== 'self') {
    throw new DesktopDriverError(`Refusing to invoke "${method}" without positively observed self ownership`, {
      kind: 'ownership',
      detail: { method },
    });
  }
}

/** Prerequisites `desktop-driver doctor` checks before a Windows run. */
export const WINDOWS_PREREQUISITES: readonly { id: string; description: string }[] = [
  { id: 'gui-session', description: 'An interactive desktop session (UI Automation cannot run headless)' },
  { id: 'session-unlocked', description: 'An unlocked workstation (a locked desktop refuses synthetic input)' },
  { id: 'winappdriver', description: 'WinAppDriver installed, when the `windows` backend is selected' },
  { id: 'developer-mode', description: 'Windows Developer Mode, required by WinAppDriver' },
  { id: 'app-registration', description: 'The application under test is installed or registered' },
];

/**
 * Environment variable `appium-windows-driver` reads to locate WinAppDriver.
 *
 * This is the only variable that has any effect: the driver resolves the executable through
 * `APPIUM_WAD_PATH` and then through its default install roots.
 */
export const WAD_PATH_ENV = 'APPIUM_WAD_PATH';

const WAD_EXECUTABLE = 'WinAppDriver.exe';
const WAD_INSTALL_DIRECTORY = 'Windows Application Driver';

/**
 * Locates the WinAppDriver executable the `windows` backend will actually use.
 *
 * The probe mirrors `appium-windows-driver`'s own resolution order so `doctor` cannot report a
 * path the driver would never load. The driver additionally falls back to an MSI registry lookup,
 * which needs an elevated `cscript`, so an undetected executable is reported as unknown rather
 * than missing.
 */
export function findWinAppDriver(environment: NodeJS.ProcessEnv = process.env): string | undefined {
  const configured = environment[WAD_PATH_ENV];
  if (configured && fs.existsSync(configured)) {
    return configured;
  }
  const roots = [environment['ProgramFiles(x86)'], environment.ProgramFiles, `${environment.SystemDrive || 'C:'}\\Program Files`];
  for (const root of roots) {
    if (!root) {
      continue;
    }
    const candidate = path.resolve(root, WAD_INSTALL_DIRECTORY, WAD_EXECUTABLE);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

/** Reports whether Windows Developer Mode is enabled. `undefined` means the check could not run. */
export function isDeveloperModeEnabled(): boolean | undefined {
  try {
    const output = execFileSync(
      'reg.exe',
      ['query', 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock', '/v', 'AllowDevelopmentWithoutDevLicense'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 10_000 },
    );
    const value = /AllowDevelopmentWithoutDevLicense\s+REG_DWORD\s+0x([0-9a-f]+)/i.exec(output)?.[1];
    return value === undefined ? undefined : Number.parseInt(value, 16) !== 0;
  } catch {
    return undefined;
  }
}

/**
 * Reports whether the interactive session is locked.
 *
 * Always `undefined`: there is no signal this package can read without a native call.
 * `LogonUI.exe` looked like one and is not — measured on Windows 11 26200, it keeps running long
 * after the session is unlocked, so treating its presence as "locked" reported every unlocked
 * machine as locked. `quser` cannot tell the two apart either. The correct answers come from
 * `OpenInputDesktop` or `WTSQuerySessionInformation`, neither of which is reachable from Node
 * without an FFI dependency.
 *
 * The prerequisite is still reported, because it is the most confusing failure mode available: a
 * locked workstation answers every read — accessibility tree, attributes, screenshots — while
 * refusing every click, key, and scroll.
 */
export function isSessionLocked(): boolean | undefined {
  return undefined;
}

/** Runs the Windows prerequisite probes. */
export function checkWindowsPrerequisites(environment: NodeJS.ProcessEnv = process.env): readonly DesktopPrerequisiteStatus[] {
  const byId = (id: string): { id: string; description: string } => WINDOWS_PREREQUISITES.find((entry) => entry.id === id)!;

  if (process.platform !== 'win32') {
    return WINDOWS_PREREQUISITES.map((prerequisite) => ({
      ...prerequisite,
      status: 'unknown',
      detail: `Not probed: this machine is ${process.platform}, not win32`,
    }));
  }

  const wad = findWinAppDriver(environment);
  const developerMode = isDeveloperModeEnabled();
  const locked = isSessionLocked();
  // A Windows service runs under `Services`; an interactive logon reports its own session name.
  const sessionName = environment.SESSIONNAME;

  return [
    {
      ...byId('gui-session'),
      status: sessionName && sessionName.toLowerCase() !== 'services' ? 'ok' : 'unknown',
      detail: sessionName ? `SESSIONNAME=${sessionName}` : 'SESSIONNAME is not set',
    },
    {
      ...byId('session-unlocked'),
      status: locked === undefined ? 'unknown' : locked ? 'missing' : 'ok',
      detail:
        locked === undefined
          ? 'Not probed. A locked workstation answers every read and refuses every click, key, and scroll, so unlock the session before running interaction tests.'
          : undefined,
    },
    {
      ...byId('winappdriver'),
      status: wad ? 'ok' : 'unknown',
      detail:
        wad ??
        `Not found through ${WAD_PATH_ENV} or the default install roots; the driver may still resolve it from its MSI registry entry`,
    },
    {
      ...byId('developer-mode'),
      status: developerMode === undefined ? 'unknown' : developerMode ? 'ok' : 'missing',
      detail: developerMode === undefined ? 'Could not read AppModelUnlock from the registry' : undefined,
    },
    // Only the caller knows which application a run targets, so this one stays advisory.
    { ...byId('app-registration'), status: 'unknown', detail: 'Depends on the configured target' },
  ];
}

/**
 * WebDriver screenshots do not reliably capture WinAppSDK Composition content, so a caller that
 * needs visual evidence must fall back to an OS-level capture rather than trusting a blank image.
 */
export const COMPOSITION_SCREENSHOT_CAVEAT =
  'WebDriver screenshots may omit WinAppSDK Composition content. Capture visual evidence with an OS-level desktop capture instead.';
