import { IRenderData } from '@uifabricshared/foundation-composable';
import { SvgProps } from 'react-native-svg';
import { IColorTokens } from '@fluentui-react-native/tokens';
import { ViewProps } from 'react-native';

export const iconName = 'Icon';

export interface IFontIconProps
{
  fontFamily?: string;
  fontSrcFile?: string;
  codepoint: number;
  fontSize?: number;
  color?: string;
}

export interface ISvgIconProps
{
  uri?: string;
  src?: React.FC<SvgProps>;
  viewBox?: string;
  color?: string;
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
