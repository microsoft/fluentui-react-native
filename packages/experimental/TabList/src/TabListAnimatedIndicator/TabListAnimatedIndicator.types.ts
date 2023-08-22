import type * as React from 'react';
import type { ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { PressableState } from '@fluentui-react-native/interactive-hooks';
import type { IForegroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const tablistAnimatedIndicatorName = 'TabListAnimatedIndicator';

export interface TabListAnimatedIndicatorTokens extends IForegroundColorTokens, LayoutTokens {
  bottom: ViewStyle['bottom'];
  start: ViewStyle['start'];

  vertical?: TabListAnimatedIndicatorTokens;
  pressed?: TabListAnimatedIndicatorTokens;
  hovered?: TabListAnimatedIndicatorTokens;
  disabled?: TabListAnimatedIndicatorTokens;
}

export type TabListAnimatedIndicatorProps = IViewProps & {
  vertical?: boolean;
  styles?: {
    container: ViewStyle;
    indicator: ViewStyle;
  };
};

export interface TabListAnimatedIndicatorState extends Omit<PressableState, 'focused'> {
  disabled?: boolean;
}

export interface TabListAnimatedIndicatorSlotProps {
  root: React.PropsWithRef<IViewProps>;
  indicator: IViewProps;
}

export interface TabListAnimatedIndicatorType {
  props: TabListAnimatedIndicatorProps;
  state: TabListAnimatedIndicatorState;
  tokens: TabListAnimatedIndicatorTokens;
  slotProps: TabListAnimatedIndicatorSlotProps;
}
