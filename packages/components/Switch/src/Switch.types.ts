import type * as React from 'react';
import type { Animated, ViewStyle, ColorValue, PressableProps, ViewProps, AnimatableNumericValue } from 'react-native';

import type { IFocusable, InteractionEvent, PressablePropsExtended, PressableState } from '@fluentui-react-native/interactive-hooks';
import type { TextProps } from '@fluentui-react-native/text';
import type { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import type { PropsOf } from '@fluentui-react-native/framework-base';

export const switchName = 'Switch';

export interface SwitchTokens extends LayoutTokens, FontTokens, IBorderTokens, IColorTokens, IShadowTokens {
  /**
   * Track color
   */
  trackColor?: ColorValue;

  /**
   * Track height
   */
  trackHeight?: ViewStyle['height'];

  /**
   * Track width
   */
  trackWidth?: ViewStyle['width'];

  /**
   * Track top margin
   */
  trackMarginTop?: ViewStyle['marginTop'];

  /**
   * Track bottom margin
   */
  trackMarginBottom?: ViewStyle['marginBottom'];

  /**
   * Track left margin
   */
  trackMarginLeft?: ViewStyle['marginLeft'];

  /**
   * Track right margin
   */
  trackMarginRight?: ViewStyle['marginRight'];

  /**
   * Thumb color
   */
  thumbColor?: ColorValue;

  /**
   * Thumb height and width
   */
  thumbSize?: number;

  /**
   * Thumb radius
   */
  thumbRadius?: AnimatableNumericValue | string;

  /**
   * Thumb margin
   */
  thumbMargin?: ViewStyle['margin'];

  /**
   * Color of border when Switch is focused on
   */
  focusStrokeColor?: ColorValue;

  /**
   * Width of border when Switch is focused on
   */
  focusBorderWidth?: number;

  /**
   * Border Radius of border when Switch is focused on
   */
  focusBorderRadius?: AnimatableNumericValue | string;

  /**
   * Sets the position of the thumb
   */
  justifyContent?: ViewStyle['justifyContent'];

  /**
   * The width of the switch.
   */
  width?: ViewStyle['width'];

  /**
   * The minWidth of the switch
   */
  minWidth?: ViewStyle['minWidth'];

  /**
   * The minHeight of the switch
   */
  minHeight?: ViewStyle['minHeight'];

  /**
   * The flex direction of the root
   */
  flexDirection?: ViewStyle['flexDirection'];

  /**
   * The toggle container flex direction
   */
  toggleContainerFlexDirection?: ViewStyle['flexDirection'];

  /**
   * States that can be applied to a switch
   * Note: 'hovered','focused','before','beforeContent','above' are not supported for Android
   */
  hovered?: SwitchTokens;
  focused?: SwitchTokens;
  pressed?: SwitchTokens;
  disabled?: SwitchTokens;
  checked?: SwitchTokens;
  toggleOn?: SwitchTokens;
  toggleOff?: SwitchTokens;
  beforeContent?: SwitchTokens;
  afterContent?: SwitchTokens;
  before?: SwitchTokens;
  after?: SwitchTokens;
  above?: SwitchTokens;
}

export interface AnimationConfig {
  toggleOnBgColor: string;
  toggleOffBgColor: string;
  trackWidth: number;
  thumbWidth: number;
  thumbMargin: number;
}

export interface SwitchProps extends Omit<PressablePropsExtended, 'onPress'> {
  /**
   * Reference to the Switch
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Callback to be called when the checked state value changes
   */
  onChange?: (e: InteractionEvent, checked?: boolean) => void;

  /**
   * Defines whether the Switch is initially in a checked state or not when rendered
   */
  defaultChecked?: boolean;

  /**
   * Defines the controlled checked state of the Switch. If passed, Switch ignores the defaultChecked property.
   * This should only be used if the checked state is to be controlled at a higher level and there is a plan to
   * pass the correct value based on handling onChange events and re-rendering.
   */
  checked?: boolean;

  /**
   * The Switch's label
   */
  label?: string;

  /**
   * The Switch's text that shows when it is in a false state
   * Note: Not supported for Android
   */
  offText?: string;

  /**
   * The Switch's text that shows when it is in a true state
   * Note: Not supported for Android
   */
  onText?: string;

  /**
   * The position of the label relative to the Switch.
   * Note : 'before' , 'above' are not supported on Android
   */
  labelPosition?: 'before' | 'above' | 'after';

  /**
   * Disabled state of the switch.
   */
  disabled?: boolean;
}

export type SwitchState = PressableState & { toggled?: boolean; disabled?: boolean };

export interface SwitchInfo {
  props: SwitchProps & React.ComponentPropsWithRef<any>;
  state: SwitchState;
}

export interface SwitchSlotProps {
  root: React.PropsWithRef<PressableProps>;
  label: TextProps;
  track: PropsOf<typeof Animated.View>;
  thumb: PropsOf<typeof Animated.View>;
  toggleContainer: ViewProps;
  onOffTextContainer: ViewProps;
  onOffText: TextProps;
}

export interface SwitchType {
  props: SwitchProps;
  tokens: SwitchTokens;
  slotProps: SwitchSlotProps;
}
