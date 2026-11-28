import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentState, OptionalSlot, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { KeyedFocus } from '../../common/useKeyedFocus';
import type { Label } from '../label/label';

export type RadioGroupOrientation = 'vertical' | 'horizontal';
export type RadioGroupOption = { value: string; label: string; disabled?: boolean; testID?: string };
export type RadioGroupProps = DesktopTooltipProps &
  Pick<ViewProps, 'style' | 'testID' | 'nativeID'> & {
    ref?: PropsWithRefOf<typeof View>['ref'];
    options: readonly RadioGroupOption[];
    label?: string;
    accessibilityLabel?: string;
    orientation?: RadioGroupOrientation;
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
  };

export type RadioGroupState = ThemeState &
  ComponentState<{ root: Slot<typeof View>; legend: OptionalSlot<typeof Label>; options: Slot<typeof View> }> & {
    items: readonly RadioGroupOption[];
    orientation: RadioGroupOrientation;
    selectedValue: string | null;
    select: (value: string) => void;
    focus: KeyedFocus;
    userStyle?: StyleProp<ViewStyle>;
  };
