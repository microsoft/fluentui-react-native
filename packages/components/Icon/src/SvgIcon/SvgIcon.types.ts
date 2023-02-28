import type { ColorValue, ImageStyle, StyleProp } from 'react-native';

import type { IViewProps } from '@fluentui-react-native/adapters';
import type { SvgProps } from 'react-native-svg';

export const svgIconName = 'SvgIcon';

export interface SvgIconProps extends IViewProps {
  /**
   * Icon color.
   */
  color?: ColorValue;
  /**
   * Icon height.
   */
  height?: number;
  /**
   * Path to a local icon.
   */
  src?: React.FC<SvgProps>;
  /**
   * Style object which contains ImageStyle props.
   */
  style?: StyleProp<ImageStyle>;
  /**
   * URI of a remote icon.
   */
  uri?: string;
  /**
   * Viewbox defines the position and dimension of an SVG viewport.
   */
  viewBox?: string;
  /**
   * Icon width.
   */
  width?: number;
}
