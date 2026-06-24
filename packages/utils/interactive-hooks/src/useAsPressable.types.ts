import type { PressabilityConfig, EventHandlers } from './usePressability';

type ObjectBase = object;

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

export type IWithPressableEvents<T extends ObjectBase> = T & EventHandlers;

export type IWithPartialPressableEvents<T extends ObjectBase> = T & Partial<EventHandlers>;

export type IPressableHooks<T extends ObjectBase> = {
  props: IWithPressableEvents<T>;
  state: IPressableState;
};
