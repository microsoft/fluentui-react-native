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

export interface ShimmerTokens {
  gradientTintColor?: string;
  toValue?: number;
  duration?: number;
  delay?: number;
  shimmerTintColor?: string;
  width?: number;
  height?: number;
  rect?: RectProps;
  angle?: number;
}

export interface ShimmerSlotProps extends ShimmerProps {
  root: SvgProps;
  rect: RectProps;
  circle: CircleProps;
  image: ImageProps;
}

export interface ShimmerProps extends ShimmerTokens {
  uri?: ImageURISource;
  circle?: CircleProps;
  elements?: Array<ShimmerElement>;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps
  tokens: ShimmerTokens;
}


