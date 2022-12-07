import { ColorValue, ImageStyle, StyleProp } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { IViewProps } from '@fluentui-react-native/adapters';

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
