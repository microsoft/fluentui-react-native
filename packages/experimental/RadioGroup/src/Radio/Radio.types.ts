import type { IViewProps } from '@fluentui-react-native/adapters';
import { TextProps } from '@fluentui-react-native/text';
import { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens, IColorTokens } from '@fluentui-react-native/tokens';
import { IPressableProps } from '@fluentui-react-native/pressable';
import { IFocusable, IPressableHooks } from '@fluentui-react-native/interactive-hooks';
import { ColorValue, ViewStyle } from 'react-native';
import { Variant } from '@fluentui-react-native/framework';

export const radioName = 'Radio';

export interface RadioTokens extends FontTokens, IColorTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  /**
   * Indicator border color
   */
  radioBorder?: ColorValue;

  /**
   * Inner circle color when selected
   */
  radioFill?: ColorValue;

  /**
   * Visibility of the radio inner circle from 0 to 1
   */
  radioVisibility?: number;

  /**
   * Diameter size of the outer indicator
   */
  radioSize?: number;

  /**
   * Diameter size of the inner circle indicator
   */
  radioInnerCircleSize?: number;

  /**
   * Border width of Radio
   */
  radioBorderWidth?: number;

  /**
   * Variant of label subtext
   */
  subtextVariant?: keyof Variant;

  /**
   * Padding between label and label subtext
   */
  marginTop?: ViewStyle['marginTop'];

  /**
   * Padding between label subtext and focus ring
   */
  marginRight?: ViewStyle['marginRight'];

  /**
   * Padding between label subtext and focus ring
   */
  marginBottom?: ViewStyle['marginBottom'];

  /**
   * States that can be applied to a Radio
   */
  selected?: RadioTokens;
  disabled?: RadioTokens;
  hovered?: RadioTokens;
  focused?: RadioTokens;
  pressed?: RadioTokens;
}

export interface RadioProps extends IPressableProps {
  /**
   * The text string for the option
   */
  label: string;

  /**
   * Label subtext for the option
   */
  subtext?: string;

  /**
   * A unique key-identifier for each option
   */
  value: string;

  /**
   * Whether or not the radio button is selectable
   */
  disabled?: boolean;

  /**
   * A RefObject to access the IFocusable interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<IFocusable>;

  /**
   * Whether to use native focus visuals for the component
   * @default true
   */
  enableFocusRing?: boolean;
}

export interface RadioState extends IPressableHooks<RadioProps & React.ComponentPropsWithRef<any>> {}

export interface RadioSlotProps {
  root: IViewProps;
  button: IViewProps;
  innerCircle: IViewProps;
  content: IViewProps;
  label: TextProps;
  subtext?: TextProps;
}

export interface RadioType {
  props: RadioProps;
  tokens: RadioTokens;
  slotProps: RadioSlotProps;
}
