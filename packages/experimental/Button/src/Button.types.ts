import * as React from 'react';
import { ViewProps, ImageProps, ViewStyle, Image } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export const buttonName = 'Button';

export interface ButtonTokens extends FontTokens, IBorderTokens {
  /**
   * Background color for the button
   */
  backgroundColor?: string;

  /**
   * Foreground color for the text and/or icon of the button
   */
  color?: string;

  /**
   * The amount of padding between the border and the contents.
   */
  contentPadding?: number | string;

  /**
   * The amount of padding between the border and the contents when the Button has focus.
   */
  contentPaddingFocused?: number | string;

  /**
   * The icon color.
   */
  iconColor?: string;

  /**
   * The icon color when hovering over the Button.
   */
  iconColorHovered?: string;

  /**
   * The icon color when the Button is being pressed.
   */
  iconColorPressed?: string;

  /**
   * The size of the icon.
   */
  iconSize?: number | string;

  /**
   * The weight of the lines used when drawing the icon.
   */
  iconWeight?: number;

  /**
   * Text to show on the Button.
   */
  content?: string;

  /**
   * Source URL or name of the icon to show on the Button.
   */
  icon?: string;

  width?: ViewStyle['width'];
  minHeight?: ViewStyle['minHeight'];
  minWidth?: ViewStyle['minWidth'];

  /**
   * States that can be applied to a button
   */
  hovered?: ButtonTokens;
  focused?: ButtonTokens;
  pressed?: ButtonTokens;
  disabled?: ButtonTokens;
  primary?: ButtonTokens;
  ghost?: ButtonTokens;
  fluid?: ButtonTokens;
}

export interface ButtonProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /*
   * Text to show on the Button.
   */
  content?: string;

  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: string;
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
  ghost?: boolean;

  /** A button can fill the width of its container. */
  fluid?: boolean;
}

export interface ButtonMacProps {
  /*
   * Name of the icon to show on the Button.
   */
  image?: Image;
  /*
   * Text to show on the Button.
   */
  title?: string;
  /*
   * ButtonStyle wrapped enum
   */
  buttonStyle?: ButtonMacStyle;
  /*
   * A button can be enabled or disabled.
   */
  isEnabled?: boolean;
}

export interface ButtonMacTokens {
  imageTitle?: string;
  cornerRadius?: number;
}

export type ButtonState = IPressableHooks<ButtonProps & React.ElementRef<any>>;
export type ButtonMacStyle = 'primaryFilled' | 'primaryOutline' | 'secondaryOutline' | 'tertiaryOutline' | 'borderless';
export type NativeButtonProps = ButtonMacProps & ButtonMacTokens;

export interface ButtonSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  icon: ImageProps;
  content: TextProps;
}

export interface MacButtonSlotProps {
  root: NativeButtonProps;
}

export interface ButtonType {
  props: ButtonProps;
  tokens: ButtonTokens;
  slotProps: ButtonSlotProps;
}

export interface ButtonTypeMac {
  props: ButtonMacProps;
  tokens: ButtonMacTokens;
  slotProps: MacButtonSlotProps;
}
