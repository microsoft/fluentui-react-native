import * as React from 'react';
import { ColorValue, ViewProps } from 'react-native';
import { XmlProps } from 'react-native-svg';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IFocusable, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuItemCheckboxName = 'MenuItemCheckbox';

export interface MenuItemCheckboxTokens extends LayoutTokens, FontTokens, IBorderTokens, IColorTokens {
  /**
   * Color of the checkmark icon
   */
  checkmarkColor?: ColorValue;

  /**
   * Amount of space in pixels around the checkmark icon
   */
  checkmarkPadding?: number;

  /**
   * Height and width in pixels of the checkmark icon
   */
  checkmarkSize?: number;

  /**
   * Visibility of the checkmark icon from 0 to 1
   */
  checkmarkVisibility?: number;

  /**
   * Space between parts of the item control in pixels
   */
  gap?: number;

  /**
   * States of the item control
   */
  checked?: MenuItemCheckboxTokens;
  disabled?: MenuItemCheckboxTokens;
  focused?: MenuItemCheckboxTokens;
  hovered?: MenuItemCheckboxTokens;
  pressed?: MenuItemCheckboxTokens;
}

export interface MenuItemCheckboxProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

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
