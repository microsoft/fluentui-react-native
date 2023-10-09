import type { ViewStyle } from 'react-native';

export const tablistAnimatedIndicatorName = 'TabListAnimatedIndicator';
export interface AnimatedIndicatorStyles {
  container: ViewStyle;
  indicator: ViewStyle;
}
export type AnimatedIndicatorStylesUpdate = Partial<AnimatedIndicatorStyles>;
