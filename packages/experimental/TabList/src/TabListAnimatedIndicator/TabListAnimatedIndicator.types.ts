import type { Animated, LayoutRectangle, ViewStyle } from 'react-native';

export const tablistAnimatedIndicatorName = 'TabListAnimatedIndicator';
export type AnimatedIndicatorStyles = Animated.AnimatedProps<ViewStyle>;

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
