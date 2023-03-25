import type { ColorValue, TextInputProps, ViewProps, KeyboardTypeOptions } from 'react-native';

import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { PressableFocusProps } from '@fluentui-react-native/interactive-hooks';
import type { FocusState } from '@fluentui-react-native/interactive-hooks/lib/usePressableState.types';
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
  dismissIconColor?: ColorValue;

  /**
   * The size of the dismiss icon.
   */
  dismissIconSize?: number;

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
  strokeWidth?: FontTokens;

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
  spacingDismissIconStart?: number;

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
  dismissIcon?: IconSourcesType;
  label?: string;
  assistiveText?: string;
  secondaryText?: string;
  placeholder?: string;
  textInputProps?: TextInputProps;
  error?: string;

  value?: string;
  defaultValue?: string;
  type?: KeyboardTypeOptions | undefined;
  onChange?: (text: string) => void;
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
  dismissIcon: IconProps;
  assistiveText: TextProps;
  secondaryText: TextProps;
}

export interface InputType {
  props: InputProps;
  tokens: InputTokens;
  slotProps: InputSlotProps;
}
