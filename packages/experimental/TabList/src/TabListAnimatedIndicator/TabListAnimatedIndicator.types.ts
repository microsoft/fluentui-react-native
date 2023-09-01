import type { LayoutRectangle, ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { LayoutEvent } from '@fluentui-react-native/interactive-hooks';

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

export interface UseAnimatedIndicatorReturn {
  addTabLayout: (tabKey: string, layout: TabLayoutInfo) => void;
  onTabListLayout: (e: LayoutEvent) => void;
  tabListLayout: LayoutRectangle;
  styles: AnimatedIndicatorStyles;
  updateStyles: (updates: AnimatedIndicatorStylesUpdate) => void;
}
