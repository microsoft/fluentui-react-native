import * as React from 'react';
import { ViewProps, ViewStyle, ColorValue, PressableProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/text';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IWithPressableOptions, InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableState, IWithPressableEvents } from '@fluentui-react-native/interactive-hooks';

export const switchName = 'Switch';

export interface SwitchTokens extends LayoutTokens, FontTokens, IBorderTokens, IColorTokens {
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
  thumbRadius?: number;

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
  focusBorderRadius?: number;

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

export interface SwitchProps extends Omit<IWithPressableOptions<ViewProps>, 'onPress'> {
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
   */
  offText?: string;

  /**
   * The Switch's text that shows when it is in a true state
   */
  onText?: string;

  /**
   * The position of the label relative to the Switch. The position value 'after' is mutually
   * exclusive with the onText and offText props. This is due to variable width
   * of the text props causing the Switch's position to change when it shouldn't.
   */
  labelPosition?: 'before' | 'above' | 'after';
}

export type SwitchState = IPressableState & { toggled?: boolean };

export interface SwitchInfo {
  props: IWithPressableEvents<SwitchProps & React.ComponentPropsWithRef<any>>;
  state: SwitchState;
}

export interface SwitchSlotProps {
  root: React.PropsWithRef<PressableProps>;
  label: TextProps;
  track: IViewProps;
  thumb: IViewProps;
  toggleContainer: IViewProps;
  onOffText: TextProps;
}

export interface SwitchType {
  props: SwitchProps;
  tokens: SwitchTokens;
  slotProps: SwitchSlotProps;
}
