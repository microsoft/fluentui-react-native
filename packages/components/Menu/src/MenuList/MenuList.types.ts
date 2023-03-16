import type React from 'react';
import type { ScrollViewProps } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { FocusZoneProps } from '@fluentui-react-native/focus-zone';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import type { IBackgroundColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuListName = 'MenuList';

export interface MenuListTokens extends LayoutTokens, IBackgroundColorTokens {
  /**
   * Space between items in pixels
   */
  gap?: number;
  hasMaxHeight?: MenuListTokens;
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
   * States that menu items can contain icons and reserves space for item alignment
   */
  hasIcons?: boolean;

  /**
   * States that menu items all have tooltips with its text by default.
   *
   * This option is useful for programmatically generated items to provide
   * text for options that end up having tuncated text.
   */
  hasTooltips?: boolean;

  /**
   * Callback when checked items change
   *
   * @param checked Array of all currently checked values
   */
  onCheckedChange?: (e: InteractionEvent, checked: string[]) => void;
  /**
   * Defines a minumum width for the Menu.
   */
  minWidth?: number | string;
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
  hasMaxHeight?: boolean;
  hasMaxWidth?: boolean;
}

export interface MenuListSlotProps {
  root: React.PropsWithRef<IViewProps> & { gap?: number };
  focusZone?: FocusZoneProps; // macOS only
  scrollView?: ScrollViewProps;
}

export interface MenuListType {
  props: MenuListProps;
  tokens: MenuListTokens;
  slotProps: MenuListSlotProps;
}
