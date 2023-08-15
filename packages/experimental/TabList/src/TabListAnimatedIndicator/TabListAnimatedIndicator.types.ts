import type * as React from 'react';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IForegroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const tablistAnimatedIndicatorName = 'TabListAnimatedIndicator';

export interface TabListAnimatedIndicatorTokens extends IForegroundColorTokens, LayoutTokens {}

export type TabListAnimatedIndicatorProps = IViewProps;

type IndicatorLayoutMap = {
  [tabKey: string]: {
    length: number; // length of indicator
    position: number; // where indicator is within the list
  };
};

export interface TabListAnimatedIndicatorState {
  addToLayoutMap: (tabKey: string, length: number, position: number) => void;
  removeFromLayoutMap: (tabKey: string) => void;
  layoutMap: IndicatorLayoutMap;
  thickness: number;
  inset: number;
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
