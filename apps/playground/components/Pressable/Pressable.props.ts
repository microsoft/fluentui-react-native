import { ViewProps, ViewStyle } from 'react-native';
import { IRenderChild, IRenderStyle } from './Pressable.types';

export type IPressState = {
  pressed?: boolean;
};

export type IFocusState = {
  focused?: boolean;
};

export type IHoverState = {
  hovered?: boolean;
};

export type IPressProps = Pick<ViewProps, 'onTouchStart' | 'onTouchCancel' | 'onTouchEnd'>;

export type IPressableState = IPressState & IFocusState & IHoverState;

export type IPressableOptions = {
  onStateChange?: (state: IPressableState) => void;
  disabled?: boolean;
  onPress?: () => void;
};

export type IWithPressableOptions<T extends object> = T & IPressableOptions;

export type IPressableHooks = {
  props: IWithPressableOptions<ViewProps>;
  state: IPressableState;
};

export interface IPressableProps extends IWithPressableOptions<ViewProps> {
  children?: IRenderChild<IPressableState>;

  // Typescript will not allow an extension of the IView* interface
  // that allows style to take on a function value. This is not a problem
  // with children, presumably because function components are valid as children.
  // As such, a renderStyle prop that takes a function value is provided
  // instead, in conjunction with the base style prop (StyleProp<ViewStyle>).
  // The style prop will only be used if a renderStyle is not provided.
  renderStyle?: IRenderStyle<IPressableState, ViewStyle>;
}
