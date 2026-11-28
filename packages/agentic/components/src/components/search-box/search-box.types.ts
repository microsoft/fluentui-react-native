import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, TextInputProps, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { Button } from '../button/button';
import type { InputProps, InputSize, InputVariant } from '../input/input.types';

export type SearchBoxProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    accessibilityLabel: string;
    clearLabel: string;
    placeholder?: string;
    value?: string;
    defaultValue?: string;
    onChangeText?: (text: string) => void;
    onSubmitQuery?: (query: string) => void;
    variant?: InputVariant;
    size?: InputSize;
    disabled?: boolean;
    textInput?: Pick<TextInputProps, 'testID' | 'nativeID' | 'accessibilityLabelledBy' | 'accessibilityHint'>;
  };

export type SearchBoxState = ThemeState &
  ComponentState<{
    root: Slot<typeof View>;
    clear: OptionalSlot<typeof Button>;
  }> & {
    size: InputSize;
    input: InputProps;
    visualState: 'rest' | 'disabled';
    userStyle?: StyleProp<ViewStyle>;
  };
