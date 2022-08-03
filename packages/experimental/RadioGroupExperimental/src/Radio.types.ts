import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/text';
import { FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { IPressableProps } from '@fluentui-react-native/pressable';
import { IFocusable } from '@fluentui-react-native/interactive-hooks';

export const radioName = 'Radio';

export interface RadioTokens extends FontTokens, IForegroundColorTokens, IBackgroundColorTokens, IBorderTokens {
  textBorderColor?: string;
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
   * An optional string for the Narrator to read for each RadioButton. If not provided, this will be set to the button's content.
   */
  accessibilityLabel?: string;

  /**
   * Defines the current radio button's position in the radio group for accessibility purposes. It's recommended to set this value
   * if radio buttons are not direct children of radio group. This value is auto-generated if radio buttons are direct children of
   * radio group.
   */
  accessibilityPositionInSet?: number;

  /**
   * Defines the number of radio buttons in the group for accessibility purposes.It's recommended to set this value if radio
   * buttons are not direct children of radio group. This value is auto-generated if radio buttons are direct children of
   * radio group.
   */
  accessibilitySetSize?: number;

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
