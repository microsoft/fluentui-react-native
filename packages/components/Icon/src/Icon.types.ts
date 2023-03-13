import type { ColorValue } from 'react-native';

import type { FontIconProps } from './FontIcon/FontIcon.types';
import type { SvgIconProps } from './SvgIcon/SvgIcon.types';

export interface IconProps {
  /**
   * Color of icon
   */
  color?: ColorValue;

  /**
   * Icon height/width for SVG or font size for font icon.
   * If height and width need to be different values, this
   * can be specified in svgSource directly.
   */
  size?: number;

  /*
   * Props of SVG Icon.
   */
  svgSource?: SvgIconProps;
  /*
   * Props of FontIcon.
   */
  fontSource?: FontIconProps;
}
