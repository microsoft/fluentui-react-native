import type { Animated, AccessibilityState, AccessibilityValue, StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import type { ComponentProps, ComponentState, OptionalSlot, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';
import type { ProgressBarThemeStyles } from './progress-bar.styles';

export type ProgressBarType = 'determinate' | 'indeterminate' | 'static';
export type ProgressBarStatus = 'neutral' | 'error' | 'success';

export type ProgressBarSlots = {
  root: Slot<typeof View>;
  validationIcon: OptionalSlot<typeof Icon>;
};

export type ProgressBarStateSlots = ProgressBarSlots & {
  track: Slot<typeof View>;
  indicator: Slot<typeof Animated.View>;
};

export type ProgressBarStateProps = {
  type?: ProgressBarType;
  status?: ProgressBarStatus;
  progress?: number;
  label?: string;
  valueText?: string;
  showValueText?: boolean;
  showValidationIcon?: boolean;
};

export type ProgressBarRootProps = Omit<ViewProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export type ProgressBarProps = ProgressBarStateProps & ComponentProps<ProgressBarSlots, ProgressBarRootProps>;

export type ProgressBarState = ComponentState<ProgressBarStateSlots> &
  ThemeState &
  Required<ProgressBarStateProps> & {
    accessibilityState?: AccessibilityState;
    accessibilityValue?: AccessibilityValue;
    styles: ProgressBarThemeStyles;
    indicatorColor: string;
    indicatorTranslateX: Animated.Value;
    indicatorTransitionDuration: string;
    indicatorWidth: number;
    isReduceMotionEnabled: boolean;
    labelId: string;
    rootStyle: StyleProp<ViewStyle>;
    showValidationIcon: boolean;
    trackLayoutWidth: number;
    validationIconColor: string;
  };
