import type * as React from 'react';
import type { ColorValue, ImageProps, ViewStyle, AnimatableNumericValue } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { IconPropsV1 as IconProps } from '@fluentui-react-native/icon';
import type { PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type { XmlProps } from 'react-native-svg';

import type { MenuItemProps, MenuItemTokens } from '../MenuItem/MenuItem.types';

export const menuItemRadioName = 'MenuItemRadio';

export interface MenuItemRadioTokens
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
   * Ripple color for Android.
   *
   * A ripple animation is shown on click for Android. This sets the color of the ripple.
   * @platform android
   */
  rippleColor?: ColorValue;

  /**
   * Color of the background of the box containing the radio.
   * @platform android
   */
  radioBackgroundColor?: ColorValue;

  /**
   * Color of the border of the box containing the radio.
   * @platform android
   */
  radioBorderColor?: ColorValue;

  /**
   * Border radius of the box containing the radio.
   * @platform android
   */
  radioBorderRadius?: AnimatableNumericValue | string;

  /**
   * Height and width of the box containing the radio.
   * @platform android
   */
  radioSize?: number;

  /**
   * Indicator  radio border color
   * @platform android
   */
  radioBorder?: ColorValue;

  /**
   * Indicator radio border style
   * @platform android
   */
  radioBorderStyle?: ViewStyle['borderStyle'];

  /**
   * Inner circle color when selected
   * @platform android
   */
  radioFill?: ColorValue;

  /**
   * Visibility of the radio inner circle from 0 to 1
   * @platform android
   */
  radioVisibility?: number;

  /**
   * Diameter size of the outer indicator
   * @platform android
   */
  radioOuterCircleSize?: number;

  /**
   * Diameter size of the inner circle indicator
   * @platform android
   */
  radioInnerCircleSize?: number;

  /**
   * Border width of Radio
   * @platform android
   */
  radioBorderWidth?: number;

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
  checked?: MenuItemRadioTokens;
  disabled?: MenuItemRadioTokens;
  focused?: MenuItemRadioTokens;
  hovered?: MenuItemRadioTokens;
  pressed?: MenuItemRadioTokens;
}

export interface MenuItemRadioProps extends MenuItemProps {
  /**
   * Identifier for the control
   */
  name: string;
}

export interface MenuItemRadioInfo {
  props: MenuItemRadioProps & React.ComponentPropsWithRef<any>;
  state: PressableState & { hasIcons: boolean; hasTooltips: boolean };
}

export interface MenuItemRadioSlotProps {
  root: React.PropsWithRef<PressablePropsExtended>;
  content?: TextProps;
  checkmark?: XmlProps;
  radioButton?: PressablePropsExtended;
  radioInnerCircle?: React.PropsWithRef<IViewProps>;
  iconPlaceholder?: React.PropsWithRef<IViewProps>;
  imgIcon?: ImageProps;
  fontOrSvgIcon?: IconProps;
}

export interface MenuItemRadioType {
  props: MenuItemRadioProps;
  tokens: MenuItemRadioTokens;
  slotProps: MenuItemRadioSlotProps;
}
