import * as React from 'react';
import { ViewProps } from 'react-native';
import { XmlProps } from 'react-native-svg';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IFocusable, InteractionEvent, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuItemName = 'MenuItem';

export interface MenuItemTokens extends LayoutTokens, FontTokens, IBorderTokens, IColorTokens {
  /**
   * Height and width in pixels of the space that is reserved to align the item's text with other items which have checkmarks
   */
  checkmarkSize?: number;

  /**
   * Amount of space in pixels around the indicator that shows that an item has a submenu
   */
  submenuIndicatorPadding?: number;

  /**
   * Height and width in pixels of the indicator that shows that an item has a submenu
   */
  submenuIndicatorSize?: number;

  /**
   * Space between parts of the item control in pixels
   */
  gap?: number;

  /**
   * States of the item control
   */
  disabled?: MenuItemTokens;
  focused?: MenuItemTokens;
  hovered?: MenuItemTokens;
  pressed?: MenuItemTokens;
}

export interface MenuItemProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * A callback to call on button click event
   */
  onClick?: (e: InteractionEvent) => void;

  /**
   * Do not dismiss the menu when a menu item is clicked
   */
  persistOnClick?: boolean;
}

export interface MenuItemState extends IPressableHooks<MenuItemProps & React.ComponentPropsWithRef<any>> {
  hasCheckmarks?: boolean;

  /**
   * If the menu item is a trigger for a submenu
   */
  hasSubmenu?: boolean;
}

export interface MenuItemSlotProps {
  root: React.PropsWithRef<IViewProps>;
  content?: TextProps;
  checkmark?: React.PropsWithRef<IViewProps>;
  submenuIndicator?: XmlProps;
}

export interface MenuItemType {
  props: MenuItemProps;
  tokens: MenuItemTokens;
  slotProps: MenuItemSlotProps;
}
