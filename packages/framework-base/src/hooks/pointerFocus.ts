/**
 * How a pointer press moves keyboard focus to the pressed target. Keyboard activation never requests focus because
 * the activated target already has it.
 *
 * - `platform` (default): follow the host convention. Windows and Win32 focus the target, matching V1; macOS follows
 *   AppKit, where clicking an ordinary control leaves keyboard focus where it was.
 * - `always`: focus the target on every platform, so later restoration, such as after a popup closes, returns to it.
 * - `never`: never request focus on pointer press.
 */
export type PointerFocusMode = 'platform' | 'always' | 'never';

/** Resolves whether a pointer press requests focus on a React Native platform such as `Platform.OS`. */
export function requestsFocusOnPointerPress(platform: string, mode: PointerFocusMode = 'platform'): boolean {
  switch (mode) {
    case 'always':
      return true;
    case 'never':
      return false;
    default:
      return platform === 'windows' || platform === 'win32';
  }
}
