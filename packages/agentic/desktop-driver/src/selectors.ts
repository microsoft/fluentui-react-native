/**
 * Portable selector policy.
 *
 * Shared specs address elements through the React Native `testID`, which React Native Windows
 * projects onto UI Automation `AutomationId` and React Native macOS projects onto the native
 * accessibility identifier. Both target drivers expose that value through the W3C
 * `accessibility id` locator strategy, so it is the one selector that behaves identically on
 * both platforms.
 */

import { DesktopValidationError } from './errors.ts';

/**
 * WebdriverIO infers a locator strategy from the first characters of a selector string. A raw
 * `testID` that begins with one of these sequences would silently change strategy, so it is
 * rejected instead of being quietly mis-resolved.
 */
const AMBIGUOUS_PREFIXES = ['/', '#', '.', '=', '*=', '~', '$', '<', '[', 'android=', 'ios=', 'aria/', 'id='];

const TEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

/** Throws when a `testID` cannot be expressed as an unambiguous accessibility-id selector. */
export function assertPortableTestId(testId: string): void {
  const errors: string[] = [];
  if (typeof testId !== 'string' || testId.length === 0) {
    errors.push('testID must be a non-empty string');
  } else {
    if (testId !== testId.trim()) {
      errors.push('testID must not have leading or trailing whitespace');
    }
    if (AMBIGUOUS_PREFIXES.some((prefix) => testId.startsWith(prefix))) {
      errors.push('testID must not start with a WebdriverIO selector-strategy prefix');
    }
    if (!TEST_ID_PATTERN.test(testId)) {
      errors.push('testID must match /^[A-Za-z0-9][A-Za-z0-9._:-]*$/ to stay portable across UI Automation and AppKit');
    }
  }
  if (errors.length > 0) {
    throw new DesktopValidationError(`Invalid portable testID "${String(testId)}"`, errors);
  }
}

/**
 * Returns the accessibility-id selector for a React Native `testID`.
 *
 * This is the only selector helper a shared spec needs; everything else is ordinary WebdriverIO.
 */
export function byTestId(testId: string): string {
  assertPortableTestId(testId);
  return `~${testId}`;
}

/** Returns true when a `testID` is usable as a portable selector. */
export function isPortableTestId(testId: string): boolean {
  try {
    assertPortableTestId(testId);
    return true;
  } catch {
    return false;
  }
}
