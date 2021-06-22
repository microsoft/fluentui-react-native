import { SvgProps } from 'react-native-svg';
import { AccessibilityProps, ImageProps, ImageStyle, StyleProp, TextStyle, ColorValue } from 'react-native';
export const iconName = 'Icon';

export interface FontIconProps {
  fontFamily?: string;
  fontSrcFile?: string;
  codepoint: number;
  fontSize?: number;
}

export interface SvgIconProps {
  uri?: string;
  src?: React.FC<SvgProps>;
  viewBox?: string;
  color?: string;
}

export interface RasterImageIconProps {
  src: ImageProps['source'];
}

export interface IconProps extends AccessibilityProps {
  fontSource?: FontIconProps;
  svgSource?: SvgIconProps;
  rasterImageSource?: RasterImageIconProps;
  style?: StyleProp<ImageStyle | TextStyle>;
  width?: number;
  height?: number;
  color?: ColorValue;
}
