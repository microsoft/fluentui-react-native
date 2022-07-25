import * as React from 'react';
import { ViewProps, ViewStyle, ColorValue, Animated } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IWithPressableOptions, InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { IconSourcesType } from '@fluentui-react-native/icon';
import { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableState, IWithPressableEvents } from '@fluentui-react-native/interactive-hooks';

export const buttonName = 'Button';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonAppearance = 'primary' | 'subtle';
export type ButtonShape = 'rounded' | 'circular' | 'square';

export interface SwitchTokens extends LayoutTokens, FontTokens, IBorderTokens, IShadowTokens, IColorTokens {

  /**
   * Track color
   */
  background?: ColorValue;

  /**
   * Thumb color
   */
  thumb?: ColorValue;

  /**
   * Stroke color
   */
  stroke ?: ColorValue;

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
   * States that can be applied to a button
   */
  hovered?: SwitchTokens;
  focused?: SwitchTokens;
  pressed?: SwitchTokens;
  disabled?: SwitchTokens;
  checked?: SwitchTokens;
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
  onClick?: (e: InteractionEvent, checked: boolean) => void;

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

  checked?: boolean;
}

// export type ButtonState = IPressableHooks<ButtonProps & React.ComponentPropsWithRef<any>>;
export interface SwitchState {
  props: IWithPressableEvents<ButtonProps & React.ComponentPropsWithRef<any>>;
  state: IPressableState & { checked: boolean };
}

export interface SwitchSlotProps {
  root: React.PropsWithRef<IViewProps>;
  label: TextProps;
  track: React.PropsWithRef<IViewProps>;
  thumb: Animated.AnimatedProps<IViewProps>;
}

export interface SwitchType {
  props: ButtonProps;
  tokens: SwitchTokens;
  slotProps: SwitchSlotProps;
}
