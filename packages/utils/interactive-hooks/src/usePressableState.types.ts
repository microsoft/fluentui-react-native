import type { PressableProps } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';

export type PressState = {
  pressed?: boolean;
};

export type FocusState = {
  focused?: boolean;
};

export type HoverState = {
  hovered?: boolean;
};

export type PressableState = PressState & FocusState & HoverState;

export type PressablePressPropKeys = 'delayLongPress' | 'onPress' | 'onPressIn' | 'onPressOut' | 'onLongPress';
export type PressablePressProps = Pick<PressableProps, PressablePressPropKeys>;

export type PressableFocusPropKeys = 'onFocus' | 'onBlur';
export type PressableFocusProps = Pick<PressableProps, PressableFocusPropKeys>;

export type PressableHoverPropKeys = 'delayHoverIn' | 'delayHoverOut' | 'onHoverIn' | 'onHoverOut';
export type PressableHoverProps = Pick<PressableProps, PressableHoverPropKeys>;

/**
 * PressablePropsExtended includes all the desktop specific types unique to IViewProps, along with the Pressable event handlers
 */
export type PressablePropsExtended = Omit<IViewProps, keyof PressableProps> &
  PressableProps &
  PressableHoverProps &
  PressableFocusProps &
  PressablePressProps;
