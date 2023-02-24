import type { ViewProps } from 'react-native';

import type { ShimmerProps, ShimmerTokens } from './Shimmer.types.shared';
export { ShimmerProps, ShimmerTokens };
export { shimmerName, ShimmerRectElement, ShimmerElementTypes, ShimmerCircleElement } from './Shimmer.types.shared';

export interface ClippingMaskProps extends ShimmerTokens {
  /**
   * Extra parameter necessary to provide the mask effect generated from the provided ShimmerElements.
   *
   * @defaultValue null
   */
  clipPath?: string;

  /**
   * The height and width of the viewBox are internal props used by the SVG to size themselves and
   * set up their viewBox to establish coordinate space for DPI scaling purposes.
   */
  viewBoxHeight: number;
  viewBoxWidth: number;
}

export interface ShimmerWaveProps extends ShimmerTokens {
  /**
   * The height and width of the viewBox are internal props used by the SVG to size themselves and
   * set up their viewBox to establish coordinate space for DPI scaling purposes.
   */
  viewBoxHeight: number;
  viewBoxWidth: number;
}

export interface ShimmerSlotProps {
  root: ViewProps;
  clippingMask: ClippingMaskProps;
  shimmerWave: ShimmerWaveProps;
  shimmerWaveContainer: ShimmerWaveProps;
}

export interface ShimmerType {
  props: ShimmerProps;
  slotProps: ShimmerSlotProps;
  tokens: ShimmerTokens;
}
