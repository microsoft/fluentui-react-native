import * as React from 'react';
import { ViewProps, ViewStyle, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import type { IViewWin32Props } from '@office-iss/react-native-win32';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';

export const buttonName = 'Button';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * The icon color when hovering over the Button.
   */
  iconColorHovered?: ColorValue;

  /**
   * The icon color when the Button is being pressed.
   */
  iconColorPressed?: ColorValue;

  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

  /**
   * The width of the button.
   */
  width?: ViewStyle['width'];

  /**
   * The amount of spacing between an icon and the content, in pixels
   */
  spacingIconContent?: number;

  /**
   * States that can be applied to a button
   */
  hovered?: ButtonTokens;
  focused?: ButtonTokens;
  pressed?: ButtonTokens;
  disabled?: ButtonTokens;
  primary?: ButtonTokens;
  subtle?: ButtonTokens;
  fluid?: ButtonTokens;
  fab?: ButtonTokens;
  small?: ButtonTokens;
  medium?: ButtonTokens;
  large?: ButtonTokens;
  hasContent?: ButtonTokens;
  hasIcon?: ButtonTokens;
}

export interface ButtonProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /*
   * Text to show on the Button.
   */
  content?: string;

  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;

  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * A callback to call on button click event
   */
  onClick?: () => void;

  testID?: string;
  tooltip?: string;

  /** A button can emphasize that it represents the primary action. */
  primary?: boolean;

  /** A button can blend into its background to become less emphasized. */
  subtle?: boolean;

  /** A button can fill the width of its container. */
  fluid?: boolean;

  /** A floating action button  */
  fab?: boolean;

  /** Sets style of button to a preset size style  */
  size?: ButtonSize
}

export type ButtonState = IPressableHooks<ButtonProps & React.ComponentPropsWithRef<any>>;

export interface ButtonSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  icon: IconProps;
  content: TextProps;
}

export interface ButtonType {
  props: ButtonProps;
  tokens: ButtonTokens;
  slotProps: ButtonSlotProps;
}
