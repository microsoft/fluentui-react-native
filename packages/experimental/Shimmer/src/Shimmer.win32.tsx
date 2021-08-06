/** @jsx withSlots */
import { compose, mergeProps, UseSlots } from '@fluentui-react-native/framework';
import { View } from 'react-native';
import { ClipPath, Defs, LinearGradient, Path, Rect, Stop, Svg } from 'react-native-svg';
import { styleSettings } from './Shimmer.styling.win32';
import { shimmerName, ShimmerProps, ShimmerTokens } from './Shimmer.types';
import { ClippingMaskProps, ShimmerType } from './Shimmer.types.win32';
import { RCTNativeAnimatedShimmer } from './consts.win32';
import { convertRectToSvgPath, convertCircleToSvgPath } from './SvgShapeToPath';
import { withSlots } from '@fluentui-react-native/framework';
import { assertNever } from 'assert-never';

/** Absolute positioning is used to overlay the clipping mask on top of the shimmer wave. */
const clippingMask: React.FunctionComponent<ClippingMaskProps> = (props: ClippingMaskProps) => {
  return (
    <Svg style={{ position: 'absolute' }} width="100%" height="100%">
      <Defs>
        <ClipPath id="shimmerCuts">
          <Path d={props.clipPath} clipRule="evenodd" />
        </ClipPath>
      </Defs>

      <Rect width="100%" height="100%" fill={props.backgroundColor as any} clipPath="url(#shimmerCuts)" />
    </Svg>
  );
};

const wave: React.FunctionComponent<ShimmerTokens> = (props: ShimmerTokens) => {
  const shimmerColor: any = props.shimmerColor;
  const shimmerWaveColor: any = props.shimmerWaveColor;

  return (
    <Svg {...props} width="100%" height="100%">
      <LinearGradient id="gradient">
        <Stop stopColor={shimmerColor} />
        <Stop offset="20%" stopColor={shimmerWaveColor} />
        <Stop offset="40%" stopColor={shimmerColor} />
      </LinearGradient>
      <Rect width={props.shimmerWaveWidth} height="100%" fill="url(#gradient)" fillOpacity={props.gradientOpacity} />
    </Svg>
  );
};

const waveContainer: React.FunctionComponent<ShimmerTokens> = (props: ShimmerTokens) => {
  return <RCTNativeAnimatedShimmer {...{ ...props, style: { backgroundColor: props.shimmerColor, overflow: 'hidden' } }} />;
};

export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  ...styleSettings,

  slots: {
    root: View,
    clippingMask: clippingMask,
    shimmerWave: wave,
    shimmerWaveContainer: waveContainer,
  },

  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    return (rest: ShimmerProps) => {
      const { elements, ...mergedProps } = mergeProps(props, rest);
      const Slots = useSlots(mergedProps);

      /**
       * Win32 D2D1 doesn't directly support SVG mask elements, so we're going to generate a mask
       * by authoring a clip path for the same effect.  We do so utilizing the clip-rule='evenodd'
       * and drawing a rectangle around the entire svg viewbox, causing all inner elements to be "clipped out"
       * instead of "clipped around," generating the visual we desire with the linear gradient below the mask.
       *
       * The layout properties and elements we've been given, however, may not be known at render time.  Rather
       * than try to keep up with the actual size of our control, we'll draw a very large rectangle well outside the range
       * of our generated coordinates.  This large rectangle will ensure we keep the desired 'evenodd' clipping behavior
       * without risking intersection with the provided Shimmer elements.
       */
      let clipPathsAsMask: string[] = ['M -1 -1 h 100000 v 100000 h -100000 z '];

      /**
       * Now extend the path to include the provided element shapes, with their path parameter strings generated from their corresponding properties.
       * Ideally this would be better possible with functions from the shape elements themselves and not to rely on our own calculations.
       */

      if (elements) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element.type == 'circle') {
            clipPathsAsMask = clipPathsAsMask.concat(convertCircleToSvgPath(element));
          } else if (element.type == 'rect') {
            clipPathsAsMask = clipPathsAsMask.concat(convertRectToSvgPath(element));
          } else {
            assertNever(element);
          }
        }
      }

      return (
        <Slots.root {...mergedProps}>
          <Slots.shimmerWaveContainer>
            <Slots.shimmerWave />
          </Slots.shimmerWaveContainer>
          <Slots.clippingMask clipPath={clipPathsAsMask.join(' ')} />
        </Slots.root>
      );
    };
  },
});
