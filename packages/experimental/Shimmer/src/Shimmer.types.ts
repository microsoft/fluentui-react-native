import { SvgProps } from 'react-native-svg';
import { ImageURISource } from 'react-native';

export const shimmerName = 'Shimmer';

interface ShimmerPropTokens {

  gradientTintColor?: string;
  toValue?: number;
  duration?: number;
  delay?: number;
  shimmerTintColor?: string;
}

export interface ShimmerTokens extends ShimmerPropTokens {
  viewBox?: string;
  width?: number;
  height?: number;
}

export interface ShimmerSlotProps extends  ShimmerPropTokens {
  root: SvgProps;
}

export interface ShimmerProps extends ShimmerPropTokens {
  /**
   * Specifies the shape of the shimmer view
   * @defaultValue 'lines'
   */
   element?: 'lines' | 'circle' | 'gap';
  /**
   * Specifies the width of the shimmer view
   * @defaultValue '150px'
   */
   width?: number;
  /**
   * Specifies the height of the shimmer view
   * @defaultValue '30px'
   */
  height?: number;
  /**
   * Specifies the height of the shimmer view
   * @defaultValue 'white'
   */
  uri?:ImageURISource;
  /**
   * Specifies the color of the shimmer gradient
   * @defaultValue 30
   */
}
export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps
  tokens: ShimmerTokens;
}


