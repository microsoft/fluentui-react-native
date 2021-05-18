import * as React from 'react';
import { ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '@fluentui-react-native/text';
import { ContextualMenuItemProps, ContextualMenuItemTokens, ContextualMenuItemState } from './ContextualMenuItem.types';
import { IconProps } from '@fluentui-react-native/icon';

export const submenuItemName = 'submenuItem';
export type SubmenuItemTokens = ContextualMenuItemTokens;
export type SubmenuItemProps = ContextualMenuItemProps;
export type SubmenuItemState = ContextualMenuItemState;

export interface SubmenuItemSlotProps {
  root: React.PropsWithRef<ViewProps>;
  stack: ViewProps;
  icon: IconProps;
  content: ITextProps;
  dropArrow: IconProps;
}

export type SubmenuItemRenderData = IRenderData<SubmenuItemSlotProps, SubmenuItemState>;

export interface SubmenuItemType {
  props: SubmenuItemProps;
  tokens: SubmenuItemTokens;
  slotProps: SubmenuItemSlotProps;
  state: SubmenuItemState;
}
