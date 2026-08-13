import type { ColorValue, Pressable, PressableProps, StyleProp, Text, ViewStyle } from 'react-native';
import type { ComponentProps, ComponentState, OptionalSlot, Slot, PressableState } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

export type CheckboxVariant = 'standard' | 'circular';
export type CheckboxStatus = 'unchecked' | 'checked' | 'indeterminate';

export type CheckboxSlots = {
  root: Slot<typeof Pressable>;
};

type CheckboxStateSlots = CheckboxSlots & {
  labelText: OptionalSlot<typeof Text>;
  secondaryTextSlot: OptionalSlot<typeof Text>;
};

export type CheckboxStateProps = {
  disabled?: boolean;
  defaultStatus?: CheckboxStatus;
  label?: string;
  showLabel?: boolean;
  secondaryText?: string;
  showSecondaryText?: boolean;
  status?: CheckboxStatus;
  variant?: CheckboxVariant;
  onStatusChange?: (nextStatus: CheckboxStatus) => void;
};

export type CheckboxRootProps = Omit<PressableProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export type CheckboxProps = CheckboxStateProps & ComponentProps<CheckboxSlots, CheckboxRootProps>;

export type CheckboxState = ComponentState<CheckboxStateSlots> &
  Required<CheckboxStateProps> &
  ThemeState &
  PressableState & {
    indicatorIconColor?: ColorValue;
    indicatorIconSize: number;
    indicatorStyle: StyleProp<ViewStyle>;
    labelContainerStyle: StyleProp<ViewStyle>;
    renderSecondaryText: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };
