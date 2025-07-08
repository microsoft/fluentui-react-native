import type { ColorValue, TextInputProps, ViewStyle, ViewProps, ScrollViewProps, KeyboardTypeOptions, TextInput } from 'react-native';

import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { InteractionEvent, PressableFocusProps } from '@fluentui-react-native/interactive-hooks';
import type { FocusState, PressablePropsExtended } from '@fluentui-react-native/interactive-hooks';
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
   * The font style of the accessory text.
   */
  accessoryTextFont?: FontTokens;

  /**
   * The color of the accessory text.
   */
  accessoryTextColor?: ColorValue;

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
   * The space between the input and the accessory text.
   */
  spacingInputAccessory?: number;

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
   * States that can be applied to an input.
   */
  hasIcon?: InputTokens;
  error?: InputTokens;
  focused?: InputTokens;
  typing?: InputTokens;
  filled?: InputTokens;
}

export interface InputProps extends PressableFocusProps {
  /*
   ** An accessibility label for screen readers. Set on the text input.
   */
  accessibilityLabel?: string;

  /*
   ** An accessibility label for screen readers. Set on the accessory icon pressable.
   */
  accessoryIconAccessibilityLabel?: string;

  /*
   * Source URL or name of the default icon to show on the input.
   *
   * Based on fluent guidelines this icon should be an "outline" icon.
   * FocusedStateIcon is applied onFocus and should be a "filled" icon.
   */
  defaultIcon?: IconSourcesType;

  /*
   * Source URL or name of the icon to show when the input is focused.
   * Can be used only when the default icon is also passed.
   *
   * Based on fluent guidelines this icon should be a "filled" icon.
   * While the default icon should be an "outline" icon.
   */
  focusedStateIcon?: IconSourcesType;

  /**
   * The width of the input.
   */
  width?: ViewStyle['width'];

  /*
   * Source URL or name of the accessory icon to show on the input.
   * Shown while input has text in it. Not shown while input is used as a control component.
   *
   * @default - dismiss icon is shown.
   * Set as null to disabled this icon.
   */
  accessoryIcon?: IconSourcesType | null;

  /**
   * A callback to call on accessoryIcon click event.
   */
  accessoryButtonOnPress?: (e: InteractionEvent) => void;

  /**
   * Label to display on top of the input.
   */
  label?: string;

  /**
   * Assistive text to display on the bottom of the input.
   */
  assistiveText?: string;

  /**
   * Accessory text to display on the right of the input.
   */
  accessoryText?: string;

  /**
   * Placeholder to display in the input.
   */
  placeholder?: string;

  /**
   * These props facilitate behaviour changes of the text field.
   */
  textInputProps?: Omit<TextInputProps, 'defaultValue' | 'value' | 'keyboardType' | 'onChangeText' | 'onBlur' | 'onFocus' | 'placeholder'>;

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
  type?: KeyboardTypeOptions | undefined; // Uses KeyboardType under the hood

  /**
   * Callback that is called when the text input's text changes.
   */
  onChange?: (text: string) => void;

  /**
   * Determines when the keyboard should stay visible after a tap.
   * - 'never', tapping outside of the focused text input when the keyboard is up dismisses the keyboard. When this happens, children won't receive the tap.
   * - 'always', the keyboard will not dismiss automatically, and the scroll view will not catch taps, but children of the scroll view can catch taps.
   * - 'handled', the keyboard will not dismiss automatically when the tap was handled by a children, (or captured by an ancestor).
   * - false, deprecated, use 'never' instead
   * - true, deprecated, use 'always' instead
   * @default always
   */
  keyboardShouldPersistTaps?: boolean | 'always' | 'never' | 'handled' | undefined;

  /**
   * A RefObject to access the text input interface. Use this to access the public methods and properties of the component.
   */
  componentRef?: React.RefObject<TextInput>;
}

export interface InputInfo {
  props: InputProps & { iconProps: IconProps } & React.ComponentPropsWithRef<any>;
  state: FocusState & { text: string };
}

export interface InputSlotProps {
  root: ScrollViewProps;
  label: TextProps;
  textInput: TextInputProps;
  input: ViewProps;
  icon: IconProps;
  inputWrapper: ViewProps;
  accessoryIcon: IconProps;
  assistiveText: TextProps;
  accessoryText: TextProps;
  accessoryIconPressable: PressablePropsExtended;
}

export interface InputType {
  props: InputProps;
  tokens: InputTokens;
  slotProps: InputSlotProps;
}
