// import { SvgProps, ImageProps } from 'react-native-svg';
import { ViewProps } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { ShimmerCircleElement, ShimmerRectElement, ShimmerTokens } from './Shimmer.types';

export interface ShimmerSlotProps extends ShimmerProps {
  root: ViewProps;
  clippingMask: ShimmerTokens & SvgProps;
  shimmerWave: ShimmerTokens;
  shimmerWaveContainer: ShimmerTokens & ViewProps;
}

export interface ShimmerProps extends ViewProps, ShimmerTokens {
  /**
   * Array of ShimmerElements representing the clipping mask
   */
  elements?: Array<ShimmerCircleElement | ShimmerRectElement>;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
