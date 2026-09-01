import type { ColorValue, Pressable, StyleProp, Text, ViewStyle } from 'react-native';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
  PressableState,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';

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
  label?: string;
  showLabel?: boolean;
  secondaryText?: string;
  showSecondaryText?: boolean;
  /**
   * The externally driven status. While this is supplied the checkbox renders what it is given and reports presses
   * through `onStatusChange` instead of changing status itself.
   */
  status?: CheckboxStatus;
  /**
   * The initial status when the checkbox is internally driven. Ignored while `status` is supplied.
   */
  defaultStatus?: CheckboxStatus;
  /**
   * Called with the next status whenever a press changes it, in both the externally driven and internally driven
   * cases.
   */
  onStatusChange?: (nextStatus: CheckboxStatus) => void;
  variant?: CheckboxVariant;
};

/**
 * The status props that describe how the axis is driven rather than its resolved value.
 */
export type CheckboxStatusDriverKeys = 'defaultStatus' | 'onStatusChange';

export type CheckboxRootProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>> & {
  children?: never;
};

export type CheckboxProps = CheckboxStateProps & ComponentProps<CheckboxSlots, CheckboxRootProps>;

export type CheckboxState = ComponentState<CheckboxStateSlots> &
  Required<Omit<CheckboxStateProps, CheckboxStatusDriverKeys>> &
  ThemeState &
  PressableState & {
    focusVisualProps?: FocusVisualProps;
    focusVisible: boolean;
    indicatorIconColor?: ColorValue;
    indicatorIconSize: number;
    indicatorStyle: StyleProp<ViewStyle>;
    labelContainerStyle: StyleProp<ViewStyle>;
    renderSecondaryText: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };
