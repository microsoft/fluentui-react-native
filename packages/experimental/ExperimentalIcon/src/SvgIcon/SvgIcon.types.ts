import { ColorValue, ImageStyle, StyleProp } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { IViewProps } from '@fluentui-react-native/adapters';

export const svgIconName = 'SvgIcon';

export interface SvgIconProps extends IViewProps {
  color?: ColorValue;
  height?: number;
  src?: React.FC<SvgProps>;
  style?: StyleProp<ImageStyle>;
  uri?: string;
  viewBox?: string;
  width?: number;
}
