import type { SvgIconProps } from './SvgIcon/SvgIcon.types';
import type { FontIconProps } from './FontIcon/FontIcon.types';

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
