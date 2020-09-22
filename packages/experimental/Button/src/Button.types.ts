import * as React from 'react';
import { ViewProps, ImageProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
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

  /**
   * States that can be applied to a button
   */
  hovered?: ButtonTokens;
  focused?: ButtonTokens;
  pressed?: ButtonTokens;
  disabled?: ButtonTokens;
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
}

export interface ButtonSlotProps {
  root: React.PropsWithRef<IViewWin32Props>;
  stack: ViewProps;
  icon: ImageProps;
  content: TextProps;
}

export interface ButtonType {
  props: ButtonProps;
  tokens: ButtonTokens;
  slotProps: ButtonSlotProps;
}
