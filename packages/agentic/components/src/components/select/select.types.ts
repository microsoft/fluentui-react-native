import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { SingleSelect } from '@fluentui-react-native/native-core/macos';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { InputSize, InputVariant } from '../input/input.types';

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    options: readonly SelectOption[];
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    accessibilityLabel: string;
    accessibilityHint?: string;
    pickerTestID?: string;
    size?: InputSize;
    variant?: InputVariant;
    disabled?: boolean;
    error?: boolean;
  };

export type SelectState = ThemeState &
  ComponentState<{ root: Slot<typeof View>; picker: Slot<typeof SingleSelect> }> & {
    size: InputSize;
    variant: InputVariant;
    visualState: 'rest' | 'hovered' | 'focused' | 'error' | 'disabled';
    userStyle?: StyleProp<ViewStyle>;
  };
