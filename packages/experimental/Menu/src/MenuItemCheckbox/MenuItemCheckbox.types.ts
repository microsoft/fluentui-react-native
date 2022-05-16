import * as React from 'react';
import { ViewProps } from 'react-native';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IFocusable, InteractionEvent, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuItemCheckboxName = 'MenuItemCheckbox';

export interface MenuItemCheckboxTokens extends LayoutTokens, FontTokens, IBorderTokens, IColorTokens {
  disabled?: MenuItemCheckboxTokens;
  focused?: MenuItemCheckboxTokens;
  hovered?: MenuItemCheckboxTokens;
  pressed?: MenuItemCheckboxTokens;
}

export interface MenuItemCheckboxProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
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

export type MenuItemCheckboxState = IPressableHooks<MenuItemCheckboxProps & React.ComponentPropsWithRef<any>>;

export interface MenuItemCheckboxSlotProps {
  root: React.PropsWithRef<IViewProps>;
  content?: TextProps;
}

export interface MenuItemCheckboxType {
  props: MenuItemCheckboxProps;
  tokens: MenuItemCheckboxTokens;
  slotProps: MenuItemCheckboxSlotProps;
}
