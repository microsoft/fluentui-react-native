import * as React from 'react';
import { ViewProps, ImageProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '@fluentui-react-native/text';
import { ContextualMenuItemProps, ContextualMenuItemTokens, ContextualMenuItemState } from './ContextualMenuItem.types';

export const submenuItemName = 'submenuItem';
export type SubmenuItemTokens = ContextualMenuItemTokens;
export type SubmenuItemProps = ContextualMenuItemProps;

export interface SubmenuItemState extends ContextualMenuItemState {
  menuOpen?: boolean;
}

export interface SubmenuItemSlotProps {
  root: React.PropsWithRef<ViewProps>;
  stack: ViewProps;
  icon: ImageProps;
  content: ITextProps;
  dropArrow: ImageProps;
}

export type SubmenuItemRenderData = IRenderData<SubmenuItemSlotProps, SubmenuItemState>;

export interface SubmenuItemType {
  props: SubmenuItemProps;
  tokens: SubmenuItemTokens;
  slotProps: SubmenuItemSlotProps;
  state: SubmenuItemState;
}
