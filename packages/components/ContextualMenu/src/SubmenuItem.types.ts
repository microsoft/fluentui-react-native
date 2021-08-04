import * as React from 'react';
import { ViewProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '@fluentui-react-native/text';
import { ContextualMenuItemProps, ContextualMenuItemTokens, ContextualMenuItemState } from './ContextualMenuItem.types';
import { IconProps } from '@fluentui-react-native/icon';
import { XmlProps } from 'react-native-svg';

export const submenuItemName = 'submenuItem';
export interface SubmenuItemTokens extends ContextualMenuItemTokens {
  chevronColor?: string;
}
export type SubmenuItemProps = ContextualMenuItemProps;

export interface SubmenuItemState extends ContextualMenuItemState {
  submenuItemHovered?: boolean;
}

export interface SubmenuItemSlotProps {
  root: React.PropsWithRef<ViewProps>;
  leftstack: ViewProps;
  icon: IconProps;
  content: ITextProps;
  rightstack: ViewProps;
  chevron: XmlProps;

}

export type SubmenuItemRenderData = IRenderData<SubmenuItemSlotProps, SubmenuItemState>;

export interface SubmenuItemType {
  props: SubmenuItemProps;
  tokens: SubmenuItemTokens;
  slotProps: SubmenuItemSlotProps;
  state: SubmenuItemState;
}
