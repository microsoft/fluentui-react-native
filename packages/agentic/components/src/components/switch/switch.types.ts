import type { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';

import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';

type AnimatedViewComponent = typeof import('react-native').Animated.View;

export type SwitchLayout = 'switch' | 'horizontal' | 'vertical';

export type SwitchSlots = {
  root: Slot<typeof Pressable>;
  track: Slot<AnimatedViewComponent>;
  thumb: Slot<AnimatedViewComponent>;
  beforeLabel: OptionalSlot<typeof Text>;
  afterLabel: OptionalSlot<typeof Text>;
  aboveLabel: OptionalSlot<typeof Text>;
};

type SwitchStateSlots = SwitchSlots & {
  layoutContainer: Slot<typeof View>;
};

export type SwitchStateProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  labelAfter?: boolean;
  labelBefore?: boolean;
  layout?: SwitchLayout;
  onChange?: (checked: boolean) => void;
};

export type SwitchExposedPressableProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>>;

export type SwitchProps = SwitchStateProps & ComponentProps<SwitchSlots, SwitchExposedPressableProps>;

export type SwitchState = ComponentState<SwitchStateSlots> &
  Required<Pick<SwitchStateProps, 'disabled' | 'label' | 'labelAfter' | 'labelBefore' | 'layout'>> &
  ThemeState &
  PressableState & {
    checked: boolean;
    checkedProgress: import('react-native').Animated.Value;
    focusVisualProps?: FocusVisualProps;
    hasVisibleLabel: boolean;
    userStyle?: StyleProp<ViewStyle>;
  };
