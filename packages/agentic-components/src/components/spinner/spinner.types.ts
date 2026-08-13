import type { Animated, StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { View } from 'react-native';
import type { Svg } from 'react-native-svg';

import type { ComponentProps, ComponentState, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

export type SpinnerSize = 'x-tiny' | 'tiny' | 'x-small' | 'small' | 'medium' | 'large' | 'x-large' | 'huge';

export type SpinnerSlots = {
  root: Slot<typeof View>;
};

type SpinnerStateSlots = SpinnerSlots & {
  svg: Slot<typeof Svg>;
};

export type SpinnerStateProps = {
  size?: SpinnerSize;
};

export type SpinnerExposedViewProps = Omit<ViewProps, 'children' | 'style' | 'accessibilityRole' | 'focusable'> & {
  style?: StyleProp<ViewStyle>;
};

export type SpinnerProps = SpinnerStateProps & ComponentProps<SpinnerSlots, SpinnerExposedViewProps>;

export type SpinnerState = ComponentState<SpinnerStateSlots> &
  Required<SpinnerStateProps> &
  ThemeState & {
    center: number;
    diameter: number;
    indicatorColor: string;
    radius: number;
    reduceMotionEnabled?: boolean;
    rotation: Animated.Value;
    strokeWidth: number;
    trackColor: string;
    userStyle?: StyleProp<ViewStyle>;
  };
