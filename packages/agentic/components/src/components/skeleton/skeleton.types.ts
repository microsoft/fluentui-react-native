import type { LayoutChangeEvent, LayoutRectangle, ViewProps, ViewStyle } from 'react-native';
import type { Animated } from 'react-native';

import type { ComponentProps, ComponentState, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { StyleProp } from 'react-native';
import type { SlotComponent } from '@fluentui-react-native/framework-base';
import type { View } from 'react-native';

export type SkeletonSlots = {
  root: Slot<typeof View>;
};

export type SkeletonProps = ComponentProps<SkeletonSlots, Omit<ViewProps, 'children'>>;

export type SkeletonState = ComponentState<SkeletonSlots> &
  ThemeState & {
    layout: LayoutRectangle;
    reduceMotion: boolean;
    userStyle?: StyleProp<ViewStyle>;
    bandWidth: number;
    translateX: Animated.AnimatedInterpolation<number | string>;
    shimmerContainerStyle: StyleProp<ViewStyle>;
    shimmerBandStyle: StyleProp<ViewStyle>;
    onLayout: (event: LayoutChangeEvent) => void;
    progress: Animated.Value;
  };

export type SkeletonRootSlot = SlotComponent<Omit<ViewProps, 'children'>>;
