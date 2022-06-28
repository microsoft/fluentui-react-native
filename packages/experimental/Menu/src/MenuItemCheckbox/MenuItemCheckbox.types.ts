import * as React from 'react';
import { ColorValue } from 'react-native';
import { XmlProps } from 'react-native-svg';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IPressableHooks } from '@fluentui-react-native/interactive-hooks';
import { MenuItemProps, MenuItemTokens } from '../MenuItem/MenuItem.types';

export const menuItemCheckboxName = 'MenuItemCheckbox';

export interface MenuItemCheckboxTokens
  extends Omit<MenuItemTokens, 'submenuIndicatorPadding' | 'submenuIndicatorSize' | 'disabled' | 'focused' | 'hovered' | 'pressed'> {
  /**
   * Color of the checkmark icon
   */
  checkmarkColor?: ColorValue;

  /**
   * Amount of space in pixels around the checkmark icon
   */
  checkmarkPadding?: number;

  /**
   * Visibility of the checkmark icon from 0 to 1
   */
  checkmarkVisibility?: number;

  /**
   * States of the item control
   */
  checked?: MenuItemCheckboxTokens;
  disabled?: MenuItemCheckboxTokens;
  focused?: MenuItemCheckboxTokens;
  hovered?: MenuItemCheckboxTokens;
  pressed?: MenuItemCheckboxTokens;
}

export interface MenuItemCheckboxProps extends MenuItemProps {
  /**
   * Identifier for the control
   */
  name: string;
}

export interface MenuItemCheckboxState extends IPressableHooks<MenuItemCheckboxProps & React.ComponentPropsWithRef<any>> {}

export interface MenuItemCheckboxSlotProps {
  root: React.PropsWithRef<IViewProps>;
  checkmark?: XmlProps;
  content?: TextProps;
}

export interface MenuItemCheckboxType {
  props: MenuItemCheckboxProps;
  tokens: MenuItemCheckboxTokens;
  slotProps: MenuItemCheckboxSlotProps;
}
