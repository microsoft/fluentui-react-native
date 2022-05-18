import * as React from 'react';
import { ColorValue, ViewProps } from 'react-native';
import { XmlProps } from 'react-native-svg';
import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IFocusable, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const menuItemRadioName = 'MenuItemCheckbox';

export interface MenuItemRadioTokens extends LayoutTokens, FontTokens, IBorderTokens, IColorTokens {
  checkmarkColor?: ColorValue;
  checkmarkPadding?: number;
  checkmarkSize?: number;
  checkmarkVisibility?: number;
  gap?: number;

  checked?: MenuItemRadioTokens;
  disabled?: MenuItemRadioTokens;
  focused?: MenuItemRadioTokens;
  hovered?: MenuItemRadioTokens;
  pressed?: MenuItemRadioTokens;
}

export interface MenuItemRadioProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
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
   * Identifier for the control
   */
  name: string;
}

export interface MenuItemRadioState extends IPressableHooks<MenuItemRadioProps & React.ComponentPropsWithRef<any>> {}

export interface MenuItemRadioSlotProps {
  root: React.PropsWithRef<IViewProps>;
  checkmark?: XmlProps;
  content?: TextProps;
}

export interface MenuItemRadioType {
  props: MenuItemRadioProps;
  tokens: MenuItemRadioTokens;
  slotProps: MenuItemRadioSlotProps;
}
