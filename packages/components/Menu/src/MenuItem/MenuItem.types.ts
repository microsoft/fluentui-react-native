import type * as React from 'react';
import type { ColorValue } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IFocusable, InteractionEvent, PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import type { XmlProps } from 'react-native-svg';

export const menuItemName = 'MenuItem';

export interface MenuItemTokens extends LayoutTokens, FontTokens, IBorderTokens, IColorTokens {
  /**
   * Height and width in pixels of the space that is reserved to align the item's text with other items which have checkmarks
   */
  checkmarkSize?: number;

  /**
   * Space between parts of the item control in pixels
   */
  gap?: number;

  /**
   * Color of the indicator that shows that an item has a submenu
   */
  submenuIndicatorColor?: ColorValue;

  /**
   * Amount of space in pixels around the indicator that shows that an item has a submenu
   */
  submenuIndicatorPadding?: number;

  /**
   * Height and width in pixels of the indicator that shows that an item has a submenu
   */
  submenuIndicatorSize?: number;

  /**
   * States of the item control
   */
  disabled?: MenuItemTokens;
  focused?: MenuItemTokens;
  hovered?: MenuItemTokens;
  pressed?: MenuItemTokens;
}

export interface MenuItemProps extends Omit<PressablePropsExtended, 'onPress'> {
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

export interface MenuItemState extends PressableState {
  hasCheckmarks?: boolean;

  /**
   * If the menu item is a trigger for a submenu
   */
  hasSubmenu?: boolean;

  /**
   * States that menu items all have tooltips with its text by default.
   */
  hasTooltips?: boolean;
}

export interface MenuItemInfo {
  props: MenuItemProps & React.ComponentPropsWithRef<any>;
  state: MenuItemState;
}

export interface MenuItemSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  content?: TextProps;
  checkmark?: React.PropsWithRef<IViewProps>;
  submenuIndicator?: XmlProps;
}

export interface MenuItemType {
  props: MenuItemProps;
  tokens: MenuItemTokens;
  slotProps: MenuItemSlotProps;
}
