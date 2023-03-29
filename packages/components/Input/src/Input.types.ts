import type { ColorValue, TextInputProps, ViewProps, KeyboardTypeOptions } from 'react-native';

import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { InteractionEvent, PressableFocusProps } from '@fluentui-react-native/interactive-hooks';
import type { FocusState, PressablePropsExtended } from '@fluentui-react-native/interactive-hooks/lib/usePressableState.types';
import type { TextProps } from '@fluentui-react-native/text';
import type { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const input = 'Input';

export interface InputCoreTokens extends LayoutTokens, IBorderTokens, IColorTokens, FontTokens {
  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * The dismiss icon color.
   */
  accessoryIconColor?: ColorValue;

  /**
   * The size of the dismiss icon.
   */
  accessoryIconSize?: number;

  /**
   * The color of the assistive text.
   */
  assistiveTextColor?: ColorValue;

  /**
   * The font style of the assistive text.
   */
  assistiveTextFont?: FontTokens;

  /**
   * The font style of the input box.
   */
  inputTextFont?: FontTokens;

  /**
   * The color of the input text.
   */
  inputTextColor?: ColorValue;

  /**
   * The font style of the secondary text.
   */
  secondaryTextFont?: FontTokens;

  /**
   * The color of the secondary text.
   */
  secondaryTextColor?: ColorValue;

  /**
   * The width of the divider.
   */
  strokeWidth?: number;

  /**
   * The color of the divider.
   */
  strokeColor?: ColorValue;

  /**
   * The color of the cursor.
   */
  cursorColor?: ColorValue;

  /**
   * The space between the icon and the rest of the content.
   */
  spacingIconContent?: number;

  /**
   * The space between the input and the secondary text.
   */
  spacingInputSecondary?: number;

  /**
   * The space between the dismiss icon and the left content.
   */
  spacingAccessoryIconStart?: number;

  /**
   * The input's vertical margin.
   */
  spacingInputVertical?: number;

  /**
   * The assistive text's vertical margin.
   */
  spacingAssistiveTextVertical?: number;

  /**
   * The assistive text's start margin. Used to align it with input box.
   */
  spacingAssistiveTextStart?: number;

  /**
   * The label's start margin. Used to align it with input box.
   */
  spacingLabelStart?: number;

  /**
   * The label's top margin.
   */
  spacingLabelTop?: number;
}

export interface InputTokens extends InputCoreTokens {
  /**
   * States that can be applied to a button.
   */
  hasIcon?: InputTokens;
  error?: InputTokens;
  focused?: InputTokens;
  typing?: InputTokens;
  filled?: InputTokens;
}

export interface InputProps extends PressableFocusProps {
  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;

  /*
   * Source URL or name of the icon to show on the Button.
   */
  accessoryIcon?: IconSourcesType | undefined;

  /**
   * Label to display on top of the input.
   */
  label?: string;

  /**
   * Assistive text to display on the bottom of the input.
   */
  assistiveText?: string;

  /**
   * Secondary text to display on the right of the input.
   */
  secondaryText?: string;

  /**
   * Placeholder to display in the input.
   */
  placeholder?: string;

  /**
   * These props facilitate behaviour changes of the text field.
   */
  textInputProps?: Omit<TextInputProps, 'defaultValue' | 'value' | 'keyboardType' | 'onChangeText' | 'onBlur' | 'onFocus'>;

  /**
   * Optional string that triggers error state when non-empty.
   * Error message replaces the assistive text and is displayed on the bottom of the input.
   */
  error?: string;

  /**
   * The value to show for the text input.
   * Turns it into a controlled component.
   * To prevent editting, use textInputProps and set editable as false.
   */
  value?: string;

  /**
   * Provides an initial value that will change when the user starts typing.
   */
  defaultValue?: string;

  /**
   * Determines which keyboard to open.
   * enum("default", 'numeric', 'email-address', "ascii-capable", 'numbers-and-punctuation', 'url', 'number-pad', 'phone-pad', 'name-phone-pad',
   * 'decimal-pad', 'twitter', 'web-search', 'visible-password')
   * Determines which keyboard to open, e.g.numeric.
   * The following values work across platforms: - default - numeric - email-address - phone-pad
   * The following values work on iOS: - ascii-capable - numbers-and-punctuation - url - number-pad - name-phone-pad - decimal-pad - twitter - web-search
   * The following values work on Android: - visible-password
   */
  type?: KeyboardTypeOptions | undefined;

  /**
   * Callback that is called when the text input's text changes.
   */
  onChange?: (text: string) => void;

  /**
   * A callback to call on accessoryIcon click event.
   */
  accessoryButtonOnPress?: (e: InteractionEvent) => void;
}

export interface InputInfo {
  props: InputProps & React.ComponentPropsWithRef<any>;
  state: FocusState & { text: string };
}

export interface InputSlotProps {
  root: ViewProps;
  label: TextProps;
  textInput: TextInputProps;
  input: ViewProps;
  icon: IconProps;
  inputWrapper: ViewProps;
  accessoryIcon: IconProps;
  assistiveText: TextProps;
  secondaryText: TextProps;
  accessoryIconPressable: React.PropsWithRef<PressablePropsExtended>;
}

export interface InputType {
  props: InputProps;
  tokens: InputTokens;
  slotProps: InputSlotProps;
}
