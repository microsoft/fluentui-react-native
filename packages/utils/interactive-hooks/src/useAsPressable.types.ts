import type { PressabilityConfig, PressabilityEventHandlers } from './Pressability/Pressability.types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

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

export type IWithPressableOptions<T extends ObjectBase> = T & IPressableOptions;

export type IWithPressableEvents<T extends ObjectBase> = T & PressabilityEventHandlers;

export type IPressableHooks<T extends ObjectBase> = {
  props: IWithPressableEvents<T>;
  state: IPressableState;
};
