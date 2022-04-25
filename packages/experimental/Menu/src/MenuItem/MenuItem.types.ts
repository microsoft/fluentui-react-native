import * as React from 'react';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuItemName = 'MenuItem';

export interface MenuItemTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {}

export interface MenuItemProps extends Omit<IViewProps, 'onPress'> {}

export interface MenuItemState {}

export interface MenuItemSlotProps {
  root: React.PropsWithRef<IViewProps>;
}
export interface MenuItemType {
  props: MenuItemProps;
  tokens: MenuItemTokens;
  slotProps: MenuItemSlotProps;
}
