import type { Theme } from '@fluentui-react-native/theme-types';

/**
 * Used to set isHighContrast state for FURN
 * Specifically for macOS, where you cannot ask for HC state,
 * so you have to store the value to keep track of it.
 *
 * @platform macOS
 * @param isHighContrast New value of high contrast state
 */
export function setIsHighContrast(_isHighContrast: boolean) {
  // noop, stub for mobile;
}

/**
 * Gives the state of high contrast in FURN.
 * On win32, the t parameter is required, but on other platforms
 * it's not needed.
 *
 * @param t The Theme object. Required on win32.
 */
export function isHighContrast(_t?: Theme): boolean {
  // noop, stub for mobile;
  return false;
}
