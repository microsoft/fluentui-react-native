import type { PressableProps } from 'react-native';

/**
 * Interactive state type for components that can be pressed, hovered, or focused. This is the type used
 * with pressable components to track their interactive state. It is a subset of the PressableProps
 */
export type PressableState = {
  pressed?: boolean;
  hovered?: boolean;
  focused?: boolean;
};

/**
 * Keys of PressableProps that are used to track interactive state. This is used to filter out the props that are not relevant to the interactive state.
 */
export type PressableStateKeys = Extract<
  keyof PressableProps,
  'onPressIn' | 'onPressOut' | 'onHoverIn' | 'onHoverOut' | 'onFocus' | 'onBlur'
>;
