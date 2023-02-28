import type { AccessibilityProps, ImageProps, ImageStyle, StyleProp, TextStyle, ColorValue } from 'react-native';

import type { SvgProps } from 'react-native-svg';
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
  testID?: string;
}

export type IconSourcesType = number | string | IconProps;
