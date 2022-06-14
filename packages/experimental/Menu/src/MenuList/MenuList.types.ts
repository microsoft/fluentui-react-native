import type { IViewProps } from '@fluentui-react-native/adapters';
import { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import { IFocusable, InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { IBackgroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import React from 'react';

export const menuListName = 'MenuList';

export interface MenuListTokens extends LayoutTokens, IBackgroundColorTokens {
  gap?: number;
}

export interface MenuListProps extends Omit<IViewProps, 'onPress'> {
  checked?: string[];
  defaultChecked?: string[];
  hasCheckmarks?: boolean;
  onCheckedChange?: (e: InteractionEvent, checked: string[]) => void;
}

export interface MenuListState extends Omit<MenuListProps, 'checked' | 'onCheckedChange'> {
  props: MenuListProps;
  checked?: Record<string, boolean>;
  isCheckedControlled: boolean;
  onCheckedChange?: (e: InteractionEvent, name: string, isChecked: boolean) => void;
  selectRadio?: (e: InteractionEvent, name: string) => void;
  addRadioItem: (name: string) => void;
  removeRadioItem: (name: string) => void;
  focusZoneRef?: React.RefObject<IFocusable>;
}

export interface MenuListSlotProps {
  root: React.PropsWithRef<IViewProps> & { gap?: number };
  focusZone: FocusZoneProps;
}

export interface MenuListType {
  props: MenuListProps;
  tokens: MenuListTokens;
  slotProps: MenuListSlotProps;
}
