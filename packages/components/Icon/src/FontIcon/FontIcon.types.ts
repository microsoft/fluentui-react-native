import type { AccessibilityProps, ColorValue, TextStyle, StyleProp } from 'react-native';

export const fontIconName = 'FontIcon';

export interface FontIconProps extends AccessibilityProps {
  /**
   * Unicode codepoint.
   */
  codepoint: number;
  /**
   * Icon color.
   */
  color?: ColorValue;
  /**
   * Font name.
   */
  fontFamily?: string;
  /**
   * Font size in points.
   */
  fontSize?: number;
  /**
   * Path to Font file.
   */
  fontSrcFile?: string;
  /**
   * Style object which contains TextStyle props.
   */
  style?: StyleProp<TextStyle>;
  /**
   * Used to locate this view in end-to-end tests.
   */
  testID?: string | undefined;
}
