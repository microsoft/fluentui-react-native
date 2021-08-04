import { ViewProps } from 'react-native';
import { ShimmerProps, ShimmerTokens } from './Shimmer.types';

export interface ClippingMaskProps extends ShimmerTokens {
  /**
   * Extra parameter necessary to provide the mask effect generated from the provided ShimmerElements.
   *
   * @defaultValue null
   */
  clipPath?: string;
}

export interface ShimmerSlotProps extends ShimmerProps {
  root: ViewProps;
  clippingMask: ClippingMaskProps;
  shimmerWave: ShimmerTokens;
  shimmerWaveContainer: ShimmerTokens;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
