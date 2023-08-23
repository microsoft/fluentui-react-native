import type { LayoutRectangle, ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';

export const tablistAnimatedIndicatorName = 'TabListAnimatedIndicator';

export interface TabListAnimatedIndicatorProps extends IViewProps {
  vertical?: boolean;
  styles?: {
    container: ViewStyle;
    indicator: ViewStyle;
  };
}

export interface TabLayoutInfo extends Partial<LayoutRectangle> {
  startMargin?: number;
  tabBorderWidth?: number;
}

export type ListLayoutMap = { [tabKey: string]: TabLayoutInfo };

export interface AnimatedIndicatorStyles {
  container: ViewStyle;
  indicator: ViewStyle;
}
export type AnimatedIndicatorStylesUpdate = Partial<AnimatedIndicatorStyles>;

export interface AnimatedIndicatorState {
  addToLayoutMap: (tabKey: string, layout: TabLayoutInfo) => void;
  tablistLayout: LayoutRectangle;
  styles: AnimatedIndicatorStyles;
  updateStyles: (updates: AnimatedIndicatorStylesUpdate) => void;
}
