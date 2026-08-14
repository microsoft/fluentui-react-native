import type { AccessibilityState, ColorValue, StyleProp, TextInput, TextStyle, View, ViewProps, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentProps, ComponentState, OptionalSlot, OwnedRootProps, Slot } from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';

export type InputVariant = 'outline' | 'underline';
export type InputSize = 'small' | 'medium' | 'large';
export type InputVisualState = 'rest' | 'hovered' | 'pressed' | 'focused' | 'error' | 'disabled' | 'readOnly';

export type InputSlots = {
  root: Slot<typeof View>;
  textInput: Slot<typeof TextInput>;
  iconStart: OptionalSlot<typeof Icon>;
  iconEnd1: OptionalSlot<typeof Icon>;
  iconEnd2: OptionalSlot<typeof Icon>;
};

type InputStateSlots = InputSlots & {
  contents: OptionalSlot<typeof View>;
  iconTextStack: OptionalSlot<typeof View>;
  iconEnd: OptionalSlot<typeof View>;
  underline: OptionalSlot<typeof View>;
};

export type InputStateProps = {
  variant?: InputVariant;
  size?: InputSize;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onBlur?: (...args: any[]) => void;
  onFocus?: (...args: any[]) => void;
  onHoverIn?: (...args: any[]) => void;
  onHoverOut?: (...args: any[]) => void;
  onPressIn?: (...args: any[]) => void;
  onPressOut?: (...args: any[]) => void;
};

export type InputExposedRootProps = OwnedRootProps<ViewProps>;

export type InputProps = InputStateProps & ComponentProps<InputSlots, InputExposedRootProps>;

export type InputState = ComponentState<InputStateSlots> &
  Required<Pick<InputStateProps, 'variant' | 'size' | 'disabled' | 'readOnly' | 'error'>> &
  ThemeState & {
    value: string;
    focused: boolean;
    hovered: boolean;
    pressed: boolean;
    visualState: InputVisualState;
    userStyle?: StyleProp<ViewStyle>;
    rootStyle: ViewStyle;
    contentsStyle: ViewStyle;
    iconTextStackStyle: ViewStyle;
    iconEndStyle: ViewStyle;
    underlineStyle: ViewStyle;
    textInputStyle: TextStyle;
    iconSize: number;
    iconColor: ColorValue;
  };

export type InputAccessibilityState = AccessibilityState & {
  readOnly?: boolean;
};
