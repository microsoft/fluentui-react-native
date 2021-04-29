import { SvgProps, RectProps, CircleProps } from 'react-native-svg';
import { ImageURISource } from 'react-native';


export const shimmerName = 'Shimmer';

interface ShimmerPropTokens {
  gradientTintColor?: string;
  toValue?: number;
  duration?: number;
  delay?: number;
  shimmerTintColor?: string;
  containerWidth?: number | string;
  containerHeight?: number | string;
}

export interface ShimmerTokens extends ShimmerPropTokens {
  viewBox?: string;
}

export interface ShimmerSlotProps extends  ShimmerPropTokens {
  root: SvgProps;
  rect: RectProps;
  circle: CircleProps;
}

export interface ShimmerProps extends ShimmerPropTokens {
  element?: 'lines' | 'circle' | 'gap';
  uri?:ImageURISource;
  shape?: RectProps | CircleProps;
  width?: number;
  height?: number;
}
export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps
  tokens: ShimmerTokens;
}


