import type * as React from 'react';
import type { ViewStyle } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { DividerInsetSize } from '@fluentui-react-native/divider';
import type { IBackgroundColorTokens } from '@fluentui-react-native/tokens';

export const menuDividerName = 'MenuDivider';

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
