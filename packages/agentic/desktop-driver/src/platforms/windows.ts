/**
 * Windows platform extension.
 *
 * Everything here is outside the portable subset. A spec that imports this module is a Windows
 * spec and cannot satisfy shared-suite coverage. Shared spec globs reject `.windows.` file names
 * for exactly this reason.
 *
 * PowerShell execution is not exposed, and arbitrary file transfer stays disabled by default:
 * they turn a UI automation session into general local code execution.
 */

import { execFileSync } from 'node:child_process';
import { release } from 'node:os';

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
  | 'windows: deleteFile';

const DISABLED_BY_DEFAULT = new Set<WindowsExecuteMethod>(['windows: deleteFile']);

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
  { id: 'windows-version', description: 'Windows 10 or newer' },
  { id: 'powershell', description: 'Windows PowerShell (powershell.exe), used by NovaWindows as its backend' },
  { id: 'gui-session', description: 'An interactive desktop session (UI Automation cannot run headless)' },
  { id: 'session-unlocked', description: 'An unlocked workstation (a locked desktop refuses synthetic input)' },
  { id: 'app-registration', description: 'The application under test is installed or registered' },
];

/** Returns the installed Windows PowerShell executable, if it can be resolved. */
export function findWindowsPowerShell(): string | undefined {
  const result = probeWindowsPowerShell();
  return result.status === 'ok' ? result.detail : undefined;
}

function probeWindowsPowerShell(): DesktopPrerequisiteStatus {
  try {
    const detail = execFileSync('where.exe', ['powershell.exe'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 10_000,
    })
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .find(Boolean);
    return {
      id: 'powershell',
      description: WINDOWS_PREREQUISITES.find((entry) => entry.id === 'powershell')!.description,
      status: detail ? 'ok' : 'missing',
      detail,
    };
  } catch (error) {
    const failure = error as NodeJS.ErrnoException & { status?: number };
    return {
      id: 'powershell',
      description: WINDOWS_PREREQUISITES.find((entry) => entry.id === 'powershell')!.description,
      status: failure.code === 'ENOENT' || failure.status === 1 ? 'missing' : 'unknown',
      detail: failure.code ?? failure.message,
    };
  }
}

/** Returns the Windows kernel version, if this is a Windows host. */
export function getWindowsVersion(hostPlatform: NodeJS.Platform = process.platform): string | undefined {
  return hostPlatform === 'win32' ? release() : undefined;
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
export function checkWindowsPrerequisites(
  environment: NodeJS.ProcessEnv = process.env,
  hostPlatform: NodeJS.Platform = process.platform,
): readonly DesktopPrerequisiteStatus[] {
  const byId = (id: string): { id: string; description: string } => WINDOWS_PREREQUISITES.find((entry) => entry.id === id)!;

  if (hostPlatform !== 'win32') {
    return WINDOWS_PREREQUISITES.map((prerequisite) => ({
      ...prerequisite,
      status: 'unknown',
      detail: `Not probed: this machine is ${hostPlatform}, not win32`,
    }));
  }

  const windowsVersion = getWindowsVersion(hostPlatform);
  const supportedVersion = windowsVersion ? Number.parseInt(windowsVersion.split('.')[0], 10) >= 10 : undefined;
  const powershell = probeWindowsPowerShell();
  const locked = isSessionLocked();
  // A Windows service runs under `Services`; an interactive logon reports its own session name.
  const sessionName = environment.SESSIONNAME;

  return [
    {
      ...byId('windows-version'),
      status: supportedVersion === undefined ? 'unknown' : supportedVersion ? 'ok' : 'missing',
      detail: windowsVersion,
    },
    powershell,
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
