import * as React from 'react';
import { ViewProps, ViewStyle, ColorValue } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { FontTokens, IBorderTokens, IColorTokens, IShadowTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { IFocusable, IWithPressableOptions, InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { IViewProps } from '@fluentui-react-native/adapters';
import { IPressableState, IWithPressableEvents } from '@fluentui-react-native/interactive-hooks';

export const switchName = 'Switch';

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
  stroke?: ColorValue;

  /**
   * Sets the position of the thumb
   */
  justifyContent?: ViewStyle['justifyContent'];

  /**
   * The width of the button.
   */
  width?: ViewStyle['width'];

  /**
   * The flex direction of the root
   */
  flexDirection?: ViewStyle['flexDirection'];

  /**
   * The toggle container flex direction
   */
  toggleContainerFlexDirection?: ViewStyle['flexDirection'];

  /**
   * States that can be applied to a button
   */
  hovered?: SwitchTokens;
  focused?: SwitchTokens;
  pressed?: SwitchTokens;
  disabled?: SwitchTokens;
  checked?: SwitchTokens;
  toggleOn?: SwitchTokens;
  toggleOff?: SwitchTokens;
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
   * Callback function for changes to the switch's state and interaction event
   */
  onChange?: (checked?: boolean, e?: InteractionEvent) => void;

  /**
   * The default state of the Switch
   */
  defaultChecked?: boolean;

  /**
   * The Switch's state
   */
  checked?: boolean;

  /**
   * A label to describe the Switch
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
   * Sets the position of the Switch's label
   */
  labelPosition?: 'before' | 'above' | 'after';
}

export type SwitchState = IPressableState & { toggleOn?: boolean; toggleOff?: boolean };

export interface SwitchInfo {
  props: IWithPressableEvents<SwitchProps & React.ComponentPropsWithRef<any>>;
  state: SwitchState;
}

export interface SwitchSlotProps {
  root: React.PropsWithRef<IViewProps>;
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
