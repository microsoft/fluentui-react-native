import type { Animated, LayoutRectangle, ViewStyle } from 'react-native';

export const tablistAnimatedIndicatorName = 'TabListAnimatedIndicator';
export type AnimatedIndicatorStyles = Animated.AnimatedProps<ViewStyle>;

export interface AnimatedIndicatorProps {
  animatedIndicatorStyles?: AnimatedIndicatorStyles;
  selectedKey?: string;
  tabLayout?: { [key: string]: LayoutRectangle };
  vertical?: boolean;
}
