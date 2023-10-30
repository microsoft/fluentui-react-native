import type { Animated, LayoutRectangle, ViewStyle } from 'react-native';

export const tablistAnimatedIndicatorName = 'TabListAnimatedIndicator';
export interface AnimatedIndicatorStyles {
  container: ViewStyle;
  indicator: Animated.AnimatedProps<ViewStyle>;
}
export type AnimatedIndicatorStylesUpdate = Partial<AnimatedIndicatorStyles>;

export interface TabLayoutInfo extends LayoutRectangle {
  startMargin?: number;
  tabBorderWidth?: number;
}

export interface AnimatedIndicatorProps {
  animatedIndicatorStyles?: AnimatedIndicatorStyles;
  selectedKey?: string;
  tabLayout?: { [key: string]: TabLayoutInfo };
  vertical?: boolean;
}
