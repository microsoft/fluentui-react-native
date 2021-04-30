import { SvgProps, RectProps, CircleProps, ImageProps } from 'react-native-svg';
import { ImageURISource } from 'react-native';

export const shimmerName = 'Shimmer';
export enum ShimmerElementType {
  rect = 1,
  circle = 2,
}

export interface ShimmerElement {
  type?: ShimmerElementType;
  width?: number;
  height?: number;
  cornerRadius?: number;
  xPos?: number;
  yPos?: number;
}

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
  image: ImageProps;
}

export interface ShimmerProps extends ShimmerPropTokens {
  uri?:ImageURISource;
  rect?: RectProps;
  circle?: CircleProps;
  width?: number;
  height?: number;
  elements?: Array<ShimmerElement>;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps
  tokens: ShimmerTokens;
}


