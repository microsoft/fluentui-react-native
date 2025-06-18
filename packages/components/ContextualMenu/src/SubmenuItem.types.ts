import type * as React from 'react';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IconProps } from '@fluentui-react-native/icon';
import type { ITextProps } from '@fluentui-react-native/text';
import type { IRenderData } from '@uifabricshared/foundation-composable';

import type { ContextualMenuItemProps, ContextualMenuItemTokens, ContextualMenuItemState } from './ContextualMenuItem.types';

export const submenuItemName = 'SubmenuItem';
export interface SubmenuItemTokens extends ContextualMenuItemTokens {
  chevronColor?: string;
}
export interface SubmenuItemProps extends ContextualMenuItemProps {
  /**
   * Whether the submenu is currently expanded/visible
   */
  expanded?: boolean;
}

export type SubmenuItemState = ContextualMenuItemState;

export interface SubmenuItemSlotProps {
  root: React.PropsWithRef<IViewProps>;
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
