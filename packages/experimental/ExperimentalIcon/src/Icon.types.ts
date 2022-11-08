import { SvgIconProps } from './SvgIcon/SvgIcon.types';
import { FontIconProps } from './FontIcon/FontIcon.types';
export const icon = 'Icon';

export interface IconProps {
  svgSource?: SvgIconProps;
  fontSource?: FontIconProps;
}
