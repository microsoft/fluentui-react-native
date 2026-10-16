import { requestsFocusOnPointerPress } from './pointerFocus';
import type { PointerFocusMode } from './pointerFocus';

describe('requestsFocusOnPointerPress', () => {
  it.each<[string, PointerFocusMode | undefined, boolean]>([
    ['windows', undefined, true],
    ['win32', 'platform', true],
    ['macos', undefined, false],
    ['ios', 'platform', false],
    ['macos', 'always', true],
    ['android', 'always', true],
    ['windows', 'never', false],
    ['win32', 'never', false],
  ])('%s with mode %s requests focus: %s', (platform, mode, expected) => {
    expect(requestsFocusOnPointerPress(platform, mode)).toBe(expected);
  });
});
