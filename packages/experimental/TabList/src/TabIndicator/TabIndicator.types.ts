import type * as React from 'react';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IForegroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const tabIndicatorName = 'TabIndicator';

export interface TabIndicatorCoreTokens extends IForegroundColorTokens {
  inset?: number;
  thickness?: number;
  vertical?: boolean;
}

export type TabIndicatorTokens = TabIndicatorCoreTokens & LayoutTokens;
export type TabIndicatorProps = TabIndicatorCoreTokens & IViewProps;

export interface TabIndicatorSlotProps {
  root: React.PropsWithRef<IViewProps>;
  indicator: IViewProps;
}

export interface TabIndicatorType {
  props: TabIndicatorProps;
  tokens: TabIndicatorTokens;
  slotProps: TabIndicatorSlotProps;
}
