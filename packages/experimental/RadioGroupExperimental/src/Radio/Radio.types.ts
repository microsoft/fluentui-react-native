import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/text';
import { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IPressableProps } from '@fluentui-react-native/pressable';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';

export const radioName = 'Radio';

export interface RadioTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  textBorderColor?: string;

  // radioBorder?: ColorValue;
  // radioFill?: ColorValue;
  // labelColor?: ColorValue;

  /**
   * States that can be applied to a Radio
   */
  checked?: RadioTokens;
  unchecked?: RadioTokens;
  disabled?: RadioTokens;
  hovered?: RadioTokens;
  focused?: RadioTokens;
  selected?: RadioTokens;
}

export interface RadioProps extends IPressableProps {
  /**
   * The text string for the option
   */
  label: string;

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
}

export interface RadioSlotProps {
  root: ViewProps;
  button: ViewProps;
  innerCircle: ViewProps;
  label: TextProps;
}

//export type RadioRenderData = IRenderData<RadioSlotProps>;

export interface RadioType {
  props: RadioProps;
  tokens: RadioTokens;
  slotProps: RadioSlotProps;
}
