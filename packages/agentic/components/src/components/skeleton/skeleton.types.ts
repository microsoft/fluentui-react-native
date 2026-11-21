import type { DesktopTooltipProps } from '../../common/desktopTooltipProps';
import type { LayoutChangeEvent, LayoutRectangle, ViewProps, ViewStyle } from 'react-native';
import type { Animated } from 'react-native';

import type { ComponentProps, ComponentState, PropsWithRefOf, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';
import type { StyleProp } from 'react-native';
import type { SlotComponent } from '@fluentui-react-native/framework-base';
import type { View } from 'react-native';

export type SkeletonSlots = {
  root: Slot<typeof View>;
};

export interface SkeletonRootProps extends DesktopTooltipProps, Omit<ViewProps, 'children' | 'focusable'> {
  children?: never;
  focusable?: never;
  ref?: PropsWithRefOf<typeof View>['ref'];
}

export type SkeletonProps = ComponentProps<SkeletonSlots, SkeletonRootProps>;

export type SkeletonState = ComponentState<SkeletonSlots> &
  ThemeState & {
    layout: LayoutRectangle;
    reduceMotion: boolean;
    userStyle?: StyleProp<ViewStyle>;
    bandWidth: number;
    centerOpacity: number;
    gradientId: string;
    shimmerColor: string | undefined;
    shimmerWidth: number;
    translateX: Animated.AnimatedInterpolation<number | string>;
    shimmerContainerStyle: StyleProp<ViewStyle>;
    rootChrome: ViewStyle;
    onLayout: (event: LayoutChangeEvent) => void;
    progress: Animated.Value;
  };

export type SkeletonRootSlot = SlotComponent<SkeletonRootProps>;
