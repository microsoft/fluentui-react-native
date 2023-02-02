import type { PressabilityConfig, PressabilityEventHandlers } from './Pressability/Pressability.types';

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
