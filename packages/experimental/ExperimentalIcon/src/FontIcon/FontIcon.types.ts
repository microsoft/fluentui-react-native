import { ColorValue, TextStyle, StyleProp } from 'react-native';

export const fontIconName = 'FontIcon';

export interface FontIconProps {
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
   * Font size.
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
}
