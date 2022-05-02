import * as React from 'react';
import { ViewProps } from 'react-native';
import { SvgProps, XmlProps } from 'react-native-svg';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IFocusable, InteractionEvent, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuItemName = 'MenuItem';

export interface MenuItemTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {}

export interface MenuItemProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  content: string;

  /**
   * Applies disabled styles to menu item but remains focusable
   */
  disabled?: boolean;

  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * If the menu item is a trigger for a submenu
   */
  hasSubmenu?: boolean;

  /**
   * A callback to call on button click event
   */
  onClick?: (e: InteractionEvent) => void;
}

export type MenuItemState = IPressableHooks<MenuItemProps & React.ComponentPropsWithRef<any>>;

export interface MenuItemSlotProps {
  root: React.PropsWithRef<IViewProps>;
  content?: TextProps;
  submenuIndicator?: SvgProps | XmlProps;
}

export interface MenuItemType {
  props: MenuItemProps;
  tokens: MenuItemTokens;
  slotProps: MenuItemSlotProps;
}
