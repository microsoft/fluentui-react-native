import * as React from 'react';
import { ViewStyle, ColorValue, ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IPressableHooks, IWithPressableOptions } from '@fluentui-react-native/interactive-hooks';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { IViewProps } from '@fluentui-react-native/adapters';

export const buttonName = 'Button';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonAppearance = 'primary' | 'subtle';
export type ButtonShape = 'rounded' | 'circular' | 'square';

export interface ButtonCoreTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {
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
   * The amount of spacing between an icon and the content when iconPosition is set to 'before', in pixels
   */
  spacingIconContentBefore?: number;

  /**
   * The amount of spacing between an icon and the content when iconPosition is set to 'after', in pixels
   */
  spacingIconContentAfter?: number;

  /**
   * States that can be applied to a button
   */
  hovered?: ButtonTokens;
  focused?: ButtonTokens;
  pressed?: ButtonTokens;
  disabled?: ButtonTokens;
  hasContent?: ButtonTokens;
  hasIconBefore?: ButtonTokens;
}

export interface ButtonTokens extends ButtonCoreTokens {
  /**
   * Additional states that can be applied to a button
   */
  primary?: ButtonTokens;
  subtle?: ButtonTokens;
  block?: ButtonTokens;
  small?: ButtonTokens;
  medium?: ButtonTokens;
  large?: ButtonTokens;
  rounded?: ButtonTokens;
  circular?: ButtonTokens;
  square?: ButtonTokens;
  hasIconAfter?: ButtonTokens;
}

export interface ButtonCorePropsWithInnerRef extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;

  /**
   * Button contains only icon, there's no text content
   * Must be set for button to style correctly when button has not content.
   */
  iconOnly?: boolean;

  innerRef?: React.ForwardedRef<IFocusable>;

  /**
   * A callback to call on button click event
   */
  onClick?: () => void;

  /**
   * Text that should show in a tooltip when the user hovers over a button.
   */
  tooltip?: string;
}

export type ButtonCoreProps = Omit<ButtonCorePropsWithInnerRef, 'innerRef'>;

export interface ButtonPropsWithInnerRef extends ButtonCorePropsWithInnerRef {
  /**
   * A button can have its content and borders styled for greater emphasis or to be subtle.
   * - 'primary': Emphasizes the button as a primary action.
   * - 'subtle': Minimizes emphasis to blend into the background until hovered or focused.
   */
  appearance?: ButtonAppearance;

  /**
   * A button can fill the width of its container.
   * @default false
   */
  block?: boolean;

  /** Sets style of button to a preset size style
   * @default 'small' on win32, 'medium' elsewhere
   */
  size?: ButtonSize;

  /**
   * Button shape: 'rounded' | 'circular' | 'square'
   * @default 'rounded'
   */
  shape?: ButtonShape;

  /**
   * Icon can be placed before or after Button's content.
   * @default 'before'
   */
  iconPosition?: 'before' | 'after';

  /**
   * A button can show a loading indicator if it is waiting for another action to happen before allowing itself to
   * be interacted with.
   * @default false
   */
  loading?: boolean;
}

export type ButtonProps = Omit<ButtonPropsWithInnerRef, 'innerRef'>;

export type ButtonState = IPressableHooks<ButtonPropsWithInnerRef & React.ComponentPropsWithRef<any>>;

export interface ButtonSlotProps {
  root: React.PropsWithRef<IViewProps>;
  icon: IconProps;
  content: TextProps;
}

export interface ButtonType {
  props: ButtonProps;
  tokens: ButtonTokens;
  slotProps: ButtonSlotProps;
}
