import type { FontIconProps } from './FontIcon/FontIcon.types';
import type { SvgIconProps } from './SvgIcon/SvgIcon.types';

export interface IconProps {
  /*
   * Props of SVG Icon.
   */
  svgSource?: SvgIconProps;
  /*
   * Props of FontIcon.
   */
  fontSource?: FontIconProps;
}
