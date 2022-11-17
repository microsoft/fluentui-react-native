import { ColorValue, TextStyle, StyleProp } from 'react-native';

export const fontIconName = 'FontIcon';

export interface FontIconProps {
  codepoint: number;
  color?: ColorValue;
  fontFamily?: string;
  fontSize?: number;
  fontSrcFile?: string;
  style?: StyleProp<TextStyle>;
}
