import * as React from 'react';
import { ColorValue } from 'react-native';
import { XmlProps } from 'react-native-svg';
import { TextProps } from '@fluentui-react-native/text';
import { PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
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
export interface MenuItemCheckboxInfo {
  props: MenuItemCheckboxProps & React.ComponentPropsWithRef<any>;
  state: PressableState;
}

export interface MenuItemCheckboxSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  checkmark?: XmlProps;
  content?: TextProps;
}

export interface MenuItemCheckboxType {
  props: MenuItemCheckboxProps;
  tokens: MenuItemCheckboxTokens;
  slotProps: MenuItemCheckboxSlotProps;
}
