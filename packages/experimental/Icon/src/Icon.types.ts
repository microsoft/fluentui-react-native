import { SvgProps } from 'react-native-svg';
export const iconName = 'Icon';

export interface IFontIconProps
{
  fontFamily?: string;
  fontSrcFile?: string;
  codepoint: number;
  fontSize?: number;
}

export interface ISvgIconProps
{
  uri?: string;
  src?: React.FC<SvgProps>;
  viewBox?: string;
}

export interface IRasterImageIconProps
{
  src: object;
}

export interface IIconProps
{
  ariaLabel?: string;
  fontSource?: IFontIconProps;
  svgSource?: ISvgIconProps;
  rasterImageSource?: IRasterImageIconProps;
  width?: number;
  height?: number;
  color?: string;
}