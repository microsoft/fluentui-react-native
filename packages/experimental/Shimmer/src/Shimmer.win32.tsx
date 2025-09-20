/** @jsxImportSource @fluentui-react-native/framework-base */
import { processColor, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { assertNever } from 'assert-never';
import type { SvgProps } from 'react-native-svg';
import { ClipPath, Defs, LinearGradient, Path, Rect, Stop, Svg } from 'react-native-svg';

import { stylingSettings } from './Shimmer.styling.win32';
import type { ShimmerElementTypes, ShimmerProps, ShimmerCircleElement, ShimmerRectElement } from './Shimmer.types.shared';
export type { ShimmerCircleElement, ShimmerRectElement };
import { shimmerName } from './Shimmer.types.shared';
import type { ClippingMaskProps, ShimmerType, ShimmerWaveProps } from './Shimmer.types.win32';
import { convertRectToSvgPath, convertCircleToSvgPath } from './SvgShapeToPath';
import RCTNativeAnimatedShimmer from './Win32ShimmerNativeComponent';

const clippingMask: React.FunctionComponent<ClippingMaskProps> = (props: ClippingMaskProps) => {
  /**
   * Absolute positioning is used to overlay the clipping mask on top of the shimmer wave.
   *
   * preserveAspectRatio = 'xMinYMin slice' asks the SVG to scale the viewBox up to fit the
   * viewPort, starting from the origin of the viewPort and minimum coordinates of the viewBox.
   * 'slice' removes the unnecessary remainder.
   */
  const { backgroundColor, viewBoxHeight, viewBoxWidth } = props;
  const svgProps: SvgProps = {
    style: { position: 'absolute', height: viewBoxHeight, width: viewBoxWidth },
    viewBox: '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight,
    preserveAspectRatio: 'xMinYMin slice',
  };
  return (
    <Svg {...svgProps}>
      <Defs>
        <ClipPath id="shimmerCuts">
          <Path d={props.clipPath} clipRule="evenodd" />
        </ClipPath>
      </Defs>

      <Rect width="100%" height="100%" fill={backgroundColor as any} clipPath="url(#shimmerCuts)" />
    </Svg>
  );
};

const wave: React.FunctionComponent<ShimmerWaveProps> = (props: ShimmerWaveProps) => {
  const { shimmerColor, shimmerColorOpacity, shimmerWaveColor, shimmerWaveColorOpacity, viewBoxHeight, viewBoxWidth } = props;

  /**
   * See the comment above for an explanation of preserveAspectRatio.
   */
  const svgProps: SvgProps = {
    style: { height: viewBoxHeight, width: viewBoxWidth },
    viewBox: '0 0 ' + viewBoxWidth + ' ' + viewBoxHeight,
    preserveAspectRatio: 'xMinYMin slice',
  };

  /**
   * React-Native-SVG doesn't process opaque color values correctly for gradients, directly invoking `processColor`
   * and squashing in the opacity value of the color stop.  This handling scheme is incompatible with OpaqueColorValue type
   * colors e.g. PlatformColor, and will show nothing.  As a short-term solution, provide alternate non-gradient handling
   * of the wave color as a solid color.
   */
  if (typeof processColor(shimmerWaveColor) !== 'object' && typeof processColor(shimmerColor) !== 'object') {
    // The typical path where the provided shimmer colors are not OpaqueColorValues.
    return (
      <Svg {...svgProps}>
        <LinearGradient id="gradient">
          <Stop stopColor={shimmerColor} stopOpacity={shimmerColorOpacity} />
          <Stop offset="20%" stopColor={shimmerWaveColor} stopOpacity={shimmerWaveColorOpacity} />
          <Stop offset="40%" stopColor={shimmerColor} stopOpacity={shimmerColorOpacity} />
        </LinearGradient>
        <Rect width={props.shimmerWaveWidth} height="100%" fill="url(#gradient)" />
      </Svg>
    );
  } else {
    // The unexpected path where either of the provided shimmer colors are OpaqueColorValues.
    // scaleX is used to mimic the gradient occupying 40% of the fill since we don't know the provided width of the
    // shimmer wave.
    return (
      <Svg {...svgProps}>
        <Rect width={props.shimmerWaveWidth} height="100%" fill={shimmerWaveColor} fillOpacity={shimmerWaveColorOpacity} scaleX="0.4" />
      </Svg>
    );
  }
};

const waveContainer: React.FunctionComponent<ShimmerWaveProps> = (props: ShimmerWaveProps) => {
  const { shimmerColor, viewBoxHeight, viewBoxWidth } = props;
  return (
    <RCTNativeAnimatedShimmer
      {...{ ...props, style: { backgroundColor: shimmerColor, height: viewBoxHeight, width: viewBoxWidth, overflow: 'hidden' } }}
    />
  );
};

export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  ...stylingSettings,

  slots: {
    root: View,
    clippingMask: clippingMask,
    shimmerWave: wave,
    shimmerWaveContainer: waveContainer,
  },

  useRender: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const Slots = useSlots(props);

    return (rest: ShimmerProps) => {
      const { elements, ...mergedProps } = mergeProps(props, rest);
      /**
       * Generate a clip path from the provided element shapes, with their path parameter strings generated from their corresponding properties.
       * Ideally this would be better possible with functions from the shape elements themselves and not to rely on our own calculations.
       *
       * One nuanced consideration is scaling the SVG with DPI.  Without specifying a viewBox, points are considered to be pixels on an SVG canvas.
       * When the native control is scaled the SVG canvas will scale up -- but pixel coordinates will not, changing the visual for different pixel densities.
       * By providing a viewBox appropriate for our SVG the viewBox containing the graphics will be scaled up to fit the viewPort.
       * Since we're programmatically generating the visual, we can assert our viewBox is `0 0 xMax yMax` where xMax and yMax are the greatest
       * X and Y points used by a shape.
       */

      let clipPathsAsMask: string[] = [];
      let xMax = 0;
      let yMax = 0;

      if (elements) {
        elements.forEach((element: ShimmerElementTypes) => {
          if (element.type == 'circle') {
            clipPathsAsMask = clipPathsAsMask.concat(convertCircleToSvgPath(element));

            const xMaxCandidate = element.cx + element.radius;
            const yMaxCandidate = element.cy + element.radius;
            xMax = xMax >= xMaxCandidate ? xMax : xMaxCandidate;
            yMax = yMax >= yMaxCandidate ? yMax : yMaxCandidate;
          } else if (element.type == 'rect') {
            clipPathsAsMask = clipPathsAsMask.concat(convertRectToSvgPath(element));

            const xMaxCandidate = element.x + element.width;
            const yMaxCandidate = element.y + element.height;
            xMax = xMax >= xMaxCandidate ? xMax : xMaxCandidate;
            yMax = yMax >= yMaxCandidate ? yMax : yMaxCandidate;
          } else {
            assertNever(element);
          }
        });
      }

      /**
       * Win32 D2D1 doesn't directly support SVG mask elements, so we're going to generate a mask
       * by manipulating our clip path for the same effect.  We do so utilizing the clip-rule='evenodd'
       * and drawing a rectangle around the entire svg viewBox, causing all inner elements to be "clipped out"
       * instead of "clipped around," generating the visual we desire with the linear gradient below the mask.
       */

      const mergedClipPath = clipPathsAsMask.join(' ').concat('M  0 0 h ' + xMax + ' v ' + yMax + ' h -' + xMax + ' z ');

      return (
        <Slots.root {...mergedProps}>
          <Slots.shimmerWaveContainer viewBoxHeight={yMax} viewBoxWidth={xMax}>
            <Slots.shimmerWave viewBoxHeight={yMax} viewBoxWidth={xMax} />
          </Slots.shimmerWaveContainer>
          <Slots.clippingMask clipPath={mergedClipPath} viewBoxHeight={yMax} viewBoxWidth={xMax} />
        </Slots.root>
      );
    };
  },
});
