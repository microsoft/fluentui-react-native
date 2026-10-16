import type { PressableState } from '../types/interactive.types';
import type { FocusablePressableOptions, FocusablePressableProps } from './useFocusablePressable.types';
import type { FocusTargetBinding } from './useFocusTarget';

export type { FocusablePressableOptions, FocusablePressableProps, FocusKeyboardEvent } from './useFocusablePressable.types';

/**
 * Native focus and Pressability require a React Native runtime.
 */
export function useFocusablePressable(
  _props: FocusablePressableProps,
  _options: FocusablePressableOptions = {},
): [FocusablePressableProps, PressableState, FocusTargetBinding] {
  throw new Error('useFocusablePressable is only available in React Native environments.');
}
