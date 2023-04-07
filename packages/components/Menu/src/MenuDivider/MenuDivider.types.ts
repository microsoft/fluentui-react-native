import type * as React from 'react';
import type { ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IBackgroundColorTokens } from '@fluentui-react-native/tokens';

export const menuDividerName = 'MenuDivider';

export const DividerInsetSizes = [0, 16, 56, 68, 72, 108] as const;
export type DividerInsetSize = (typeof DividerInsetSizes)[number];

export type MenuDividerTokens = IBackgroundColorTokens & {
  height?: number;
  margin?: number;
  marginVertical?: number;
  width?: ViewStyle['width'];
  insetSize?: DividerInsetSize;
};

export type MenuDividerProps = IViewProps & {
  insetSize?: DividerInsetSize;
};

export interface MenuDividerSlotProps {
  root: React.PropsWithRef<IViewProps>;
}

export interface MenuDividerType {
  props: MenuDividerProps;
  tokens: MenuDividerTokens;
  slotProps: MenuDividerSlotProps;
}
