import { ViewStyle } from 'react-native';
import { IRenderChild, IRenderStyle } from './Pressable.types';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export type IPressState = {
  pressed?: boolean;
};

export type IFocusState = {
  focused?: boolean;
};

export type IHoverState = {
  hovered?: boolean;
};

export type IHoverProps = Pick<IViewWin32Props, 'onMouseEnter' | 'onMouseLeave'>;
export type IFocusProps = Pick<IViewWin32Props, 'onFocus' | 'onBlur'>;
export type IPressProps = Pick<IViewWin32Props, 'onTouchStart' | 'onTouchCancel' | 'onTouchEnd'>;

export type IPressableState = IPressState & IFocusState & IHoverState;

export type IPressableOptions = {
  onStateChange?: (state: IPressableState) => void;
  disabled?: boolean;
  onPress?: () => void;
};

export type IWithPressableOptions<T extends object> = T & IPressableOptions;

export type IPressableHooks = {
  props: IWithPressableOptions<IViewWin32Props>;
  state: IPressableState;
};

export interface IPressableProps extends IWithPressableOptions<IViewWin32Props> {
  children?: IRenderChild<IPressableState>;

  // Typescript will not allow an extension of the IView* interface
  // that allows style to take on a function value. This is not a problem
  // with children, presumably because function components are valid as children.
  // As such, a renderStyle prop that takes a function value is provided
  // instead, in conjunction with the base style prop (StyleProp<ViewStyle>).
  // The style prop will only be used if a renderStyle is not provided.
  renderStyle?: IRenderStyle<IPressableState, ViewStyle>;
}
