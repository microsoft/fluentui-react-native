/**
 * The versioned portable command matrix.
 *
 * A command only belongs here once one contract assertion passes unchanged against every
 * supported backend. `browser.desktop.getSessionInfo()` reports this matrix at runtime so a
 * missing capability fails as an infrastructure error rather than a silent skip.
 *
 * Two commands are deliberately delivered through the narrow `browser.desktop` augmentation
 * rather than the identically named WebdriverIO element commands: WebdriverIO implements
 * `isFocused()` and the desktop branch of `scrollIntoView()` by evaluating a DOM script, which no
 * native desktop driver can execute. Routing them through the augmentation keeps them portable
 * instead of quietly dropping them from the matrix.
 */

import { PORTABLE_COMMAND_MATRIX_VERSION } from './protocol.ts';
import type { DesktopBackendId, PortableCommand } from './types.ts';

/** Where a portable command is invoked from. */
export type PortableCommandSurface = 'webdriverio' | 'desktop';

/** Every command a shared spec may rely on, and the surface that provides it. */
export const PORTABLE_COMMAND_SURFACES: Readonly<Record<PortableCommand, PortableCommandSurface>> = {
  findElement: 'webdriverio',
  findElements: 'webdriverio',
  isExisting: 'webdriverio',
  isDisplayed: 'webdriverio',
  isEnabled: 'webdriverio',
  isSelected: 'webdriverio',
  click: 'webdriverio',
  clearValue: 'webdriverio',
  setValue: 'webdriverio',
  getText: 'webdriverio',
  getValue: 'webdriverio',
  waitForDisplayed: 'webdriverio',
  waitForExist: 'webdriverio',
  getPageSource: 'webdriverio',
  takeScreenshot: 'webdriverio',
  isFocused: 'desktop',
  scrollIntoView: 'desktop',
};

export const PORTABLE_COMMANDS: readonly PortableCommand[] = Object.keys(PORTABLE_COMMAND_SURFACES) as PortableCommand[];

/**
 * Backend support for the portable matrix.
 *
 * Every supported backend must implement the full matrix; the map exists so a backend that
 * regresses can be described honestly instead of having the matrix quietly shrink for everyone.
 */
const BACKEND_SUPPORT: Readonly<Record<DesktopBackendId, readonly PortableCommand[]>> = {
  fake: PORTABLE_COMMANDS,
  mac2: PORTABLE_COMMANDS,
  windows: PORTABLE_COMMANDS,
  novawindows: PORTABLE_COMMANDS,
};

/** Platform extension namespaces exposed through the `./macos` and `./windows` subpaths. */
const BACKEND_EXTENSIONS: Readonly<Record<DesktopBackendId, readonly string[]>> = {
  fake: [],
  mac2: ['macos'],
  windows: ['windows'],
  novawindows: ['windows'],
};

export function portableCommandsFor(backend: DesktopBackendId): readonly PortableCommand[] {
  return BACKEND_SUPPORT[backend] ?? [];
}

export function platformExtensionsFor(backend: DesktopBackendId): readonly string[] {
  return BACKEND_EXTENSIONS[backend] ?? [];
}

/** Returns the portable commands a backend does not implement. */
export function missingPortableCommands(backend: DesktopBackendId): readonly PortableCommand[] {
  const supported = new Set(portableCommandsFor(backend));
  return PORTABLE_COMMANDS.filter((command) => !supported.has(command));
}

export { PORTABLE_COMMAND_MATRIX_VERSION };
