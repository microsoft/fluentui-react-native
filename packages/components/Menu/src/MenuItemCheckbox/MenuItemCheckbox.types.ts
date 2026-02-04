import type * as React from 'react';
import type { ColorValue, ImageProps, AnimatableNumericValue } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import type { PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type { XmlProps } from 'react-native-svg';

import type { MenuItemProps, MenuItemTokens } from '../MenuItem/MenuItem.types';

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
   * Color of the icon
   */
  iconColor?: ColorValue;

  /**
   * Size of the icon. Pixels for SVG and points for font icon.
   */
  iconSize?: number;

  /**
   * Color of the background of the box containing the checkmark.
   * @platform android
   */
  checkboxBackgroundColor?: ColorValue;

  /**
   * Color of the border of the box containing the checkmark.
   * @platform android
   */
  checkboxBorderColor?: ColorValue;

  /**
   * Border radius of the box containing the checkmark.
   * @platform android
   */
  checkboxBorderRadius?: AnimatableNumericValue | string;

  /**
   * Width of the border around the box containing the checkmark.
   * @platform android
   */
  checkboxBorderWidth?: number;

  /**
   * Height and width of the box containing the checkmark.
   * @platform android
   */
  checkboxSize?: number;

  /**
   * Ripple color for Android.
   *
   * A ripple animation is shown on click for Android. This sets the color of the ripple.
   * @platform android
   */
  rippleColor?: ColorValue;

  /**
   * Ripple radius for circular radio on Android.
   *
   * A ripple animation is shown on click for Android. This sets the radius of the circular ripple shown on the radio button.
   * @platform android
   */
  rippleRadius?: number;

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
  state: PressableState & { hasIcons: boolean; hasTooltips: boolean };
}

export interface MenuItemCheckboxSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  checkbox?: PressablePropsExtended; // Android only
  checkmark?: XmlProps;
  content?: TextProps;
  iconPlaceholder?: React.PropsWithRef<IViewProps>;
  imgIcon?: ImageProps;
  fontOrSvgIcon?: IconProps;
}

export interface MenuItemCheckboxType {
  props: MenuItemCheckboxProps;
  tokens: MenuItemCheckboxTokens;
  slotProps: MenuItemCheckboxSlotProps;
}
