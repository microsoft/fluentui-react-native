import { PressableProps } from 'react-native';
import { PressabilityConfig, PressabilityEventHandlers, PressableFocusProps, PressableHoverProps } from './Pressability/Pressability.types';

export type IPressState = {
  pressed?: boolean;
};

export type IFocusState = {
  focused?: boolean;
};

export type IHoverState = {
  hovered?: boolean;
};

export type IPressableState = IPressState & IFocusState & IHoverState;

export type IPressableOptions = PressabilityConfig & {
  onStateChange?: (state: IPressableState) => void;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type IWithPressableOptions<T extends object> = T & IPressableOptions;

// eslint-disable-next-line @typescript-eslint/ban-types
export type IWithPressableEvents<T extends object> = T & PressabilityEventHandlers;

// eslint-disable-next-line @typescript-eslint/ban-types
export type IPressableHooks<T extends object> = {
  props: IWithPressableEvents<T>;
  state: IPressableState;
};

/**
 * The hover props on RN 0.63 don't exist in react-native, only on the desktop SKUs, but we need them for hooking
 * mouse events on windows and macos. This adds them to the props type, stripping them from the base pressable type as
 * future proofing for when we upgrade to 0.64+.
 *
 * Similarly the focus methods exist at the View level but are not exposed on pressable props in 0.63. As a result they
 * need a similar treatment
 */
export type PressablePropsExtended = Exclude<PressableProps, 'onHoverIn' | 'onHoverOut' | 'onFocus' | 'onBlur'> &
  PressableHoverProps &
  PressableFocusProps;
