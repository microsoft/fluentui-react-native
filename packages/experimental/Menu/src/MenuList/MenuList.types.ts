import type { IViewProps } from '@fluentui-react-native/adapters';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { IBackgroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import React from 'react';

export const menuListName = 'MenuList';

export interface MenuListTokens extends LayoutTokens, IBackgroundColorTokens {
  /**
   * Space between items in pixels
   */
  gap?: number;
}

export interface MenuListProps extends Omit<IViewProps, 'onPress'> {
  /**
   * Array of all checked items
   */
  checked?: string[];

  /**
   * Default items to be checked on mount
   */
  defaultChecked?: string[];

  /**
   * States that menu items can contain selectable items and reserves space for item alignment
   */
  hasCheckmarks?: boolean;

  /**
   * Callback when checked items change
   *
   * @param checked Array of all currently checked values
   */
  onCheckedChange?: (e: InteractionEvent, checked: string[]) => void;
}

export interface MenuListState extends Omit<MenuListProps, 'checked' | 'onCheckedChange'> {
  props: MenuListProps;
  checked?: Record<string, boolean>;
  isCheckedControlled: boolean;
  onArrowClose?: (e: InteractionEvent) => void;
  onCheckedChange?: (e: InteractionEvent, name: string, isChecked: boolean) => void;
  selectRadio?: (e: InteractionEvent, name: string) => void;
  addRadioItem: (name: string) => void;
  removeRadioItem: (name: string) => void;
}

export interface MenuListSlotProps {
  root: React.PropsWithRef<IViewProps> & { gap?: number };
}

export interface MenuListType {
  props: MenuListProps;
  tokens: MenuListTokens;
  slotProps: MenuListSlotProps;
}
