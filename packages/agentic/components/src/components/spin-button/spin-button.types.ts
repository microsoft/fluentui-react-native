import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { SpinEditor } from '@fluentui-react-native/native-core/macos';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { InputSize, InputVariant } from '../input/input.types';

export type SpinButtonChangeReason = 'typed' | 'increment' | 'decrement' | 'accessibility';
export type SpinButtonProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    largeStep?: number;
    format: (value: number) => string;
    parse: (text: string) => number | null;
    onValueChange?: (value: number, detail: { reason: SpinButtonChangeReason }) => void;
    onInvalidChange?: (invalid: boolean) => void;
    accessibilityLabel: string;
    incrementLabel: string;
    decrementLabel: string;
    size?: InputSize;
    variant?: InputVariant;
    disabled?: boolean;
    readOnly?: boolean;
    editorTestID?: string;
  };

export type SpinButtonState = ThemeState &
  ComponentState<{ root: Slot<typeof View>; editor: Slot<typeof SpinEditor> }> & {
    size: InputSize;
    variant: InputVariant;
    invalid: boolean;
    visualState: 'rest' | 'hovered' | 'pressed' | 'disabled';
    userStyle?: StyleProp<ViewStyle>;
  };
