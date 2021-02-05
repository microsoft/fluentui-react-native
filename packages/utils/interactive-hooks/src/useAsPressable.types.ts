import { PressabilityConfig, EventHandlers } from 'react-native/Libraries/Pressability/Pressability';

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

export type IWithPressableOptions<T extends object> = T & IPressableOptions;

export type IWithPressableEvents<T extends object> = T & EventHandlers;

export type IPressableHooks<T extends object> = {
  props: IWithPressableEvents<T>;
  state: IPressableState;
};
