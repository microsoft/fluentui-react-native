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

export type IPressableOptions = {
  onStateChange?: (state: IPressableState) => void;
  disabled?: boolean;
  onPress?: () => void;
};

export type IWithPressableOptions<T extends object> = T & IPressableOptions;

export type IPressableHooks<T extends object> = {
  props: IWithPressableOptions<T>;
  state: IPressableState;
};
