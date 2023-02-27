import type * as React from 'react';
import type { ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IBackgroundColorTokens } from '@fluentui-react-native/tokens';

export const menuDividerName = 'MenuDivider';

export type MenuDividerTokens = IBackgroundColorTokens & {
  height?: number;
  margin?: number;
  marginVertical?: number;
  width?: ViewStyle['width'];
};

export type MenuDividerProps = IViewProps;

export interface MenuDividerSlotProps {
  root: React.PropsWithRef<IViewProps>;
}

export interface MenuDividerType {
  props: MenuDividerProps;
  tokens: MenuDividerTokens;
  slotProps: MenuDividerSlotProps;
}
