import * as React from 'react';
import { ViewProps, ViewStyle, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IPressableHooks, IWithPressableOptions, InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { IViewProps } from '@fluentui-react-native/adapters';
import { ShadowProps } from '@fluentui-react-native/experimental-shadow';
import { ShadowToken } from '@fluentui-react-native/theme-types';

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
   * An object describing the shadow of the button
   */
  shadowToken?: ShadowToken;

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

export interface ButtonCoreProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;

  /**
   * Button contains only icon, there's no text content
   * Must be set for button to style correctly when button has not content.
   */
  iconOnly?: boolean;

  /**
   * A RefObject to access the IButton interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * A callback to call on button click event
   */
  onClick?: (e: InteractionEvent) => void;

  /**
   * Text that should show in a tooltip when the user hovers over a button.
   */
  tooltip?: string;
}

export interface ButtonProps extends ButtonCoreProps {
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

  /**
   * Whether to use native focus visuals for the component
   * @default true
   */
  enableFocusRing?: boolean;

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

export type ButtonState = IPressableHooks<ButtonProps & React.ComponentPropsWithRef<any>>;

export interface ButtonSlotProps {
  root: React.PropsWithRef<IViewProps>;
  icon: IconProps;
  content: TextProps;
  shadow?: ShadowProps;
}

export interface ButtonType {
  props: ButtonProps;
  tokens: ButtonTokens;
  slotProps: ButtonSlotProps;
}
