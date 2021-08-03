// import { SvgProps, ImageProps } from 'react-native-svg';
import { ViewProps } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { ShimmerProps, ShimmerTokens } from './Shimmer.types';

export interface ShimmerSlotProps extends ShimmerProps {
  root: ViewProps;
  clippingMask: ShimmerTokens & SvgProps;
  shimmerWave: ShimmerTokens;
  shimmerWaveContainer: ShimmerTokens & ViewProps;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
