import type { PressableState } from '../types/interactive.types';
import type { FocusablePressableProps } from './useFocusablePressable.types';
import type { FocusTargetBinding } from './useFocusTarget';

export type { FocusablePressableProps, FocusKeyboardEvent } from './useFocusablePressable.types';

/**
 * Native focus and Pressability require a React Native runtime.
 */
export function useFocusablePressable(
  _props: FocusablePressableProps,
  _options: { focusOnPress?: boolean } = {},
): [FocusablePressableProps, PressableState, FocusTargetBinding] {
  throw new Error('useFocusablePressable is only available in React Native environments.');
}
