import * as React from 'react';
import { IViewProps } from '@fluentui-react-native/adapters';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextProps } from '@fluentui-react-native/text';
import { ContextualMenuItemProps, ContextualMenuItemTokens, ContextualMenuItemState } from './ContextualMenuItem.types';
import { IconProps } from '@fluentui-react-native/icon';
import { PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';

export const submenuItemName = 'SubmenuItem';
export interface SubmenuItemTokens extends ContextualMenuItemTokens {
  chevronColor?: string;
}
export type SubmenuItemProps = ContextualMenuItemProps;

export type SubmenuItemState = ContextualMenuItemState;

export interface SubmenuItemSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  startstack: IViewProps;
  icon: IconProps;
  content: ITextProps;
  endstack: IViewProps;
  chevron: IconProps;
}

export type SubmenuItemRenderData = IRenderData<SubmenuItemSlotProps, SubmenuItemState>;

export interface SubmenuItemType {
  props: SubmenuItemProps;
  tokens: SubmenuItemTokens;
  slotProps: SubmenuItemSlotProps;
  state: SubmenuItemState;
}
