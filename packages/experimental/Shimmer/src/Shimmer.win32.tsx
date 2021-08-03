/** @jsx withSlots */
import { buildUseStyling, compose, mergeProps, UseSlots } from '@fluentui-react-native/framework';
import { View } from 'react-native';
import { ClipPath, LinearGradient, Path, Rect, Stop, Svg } from 'react-native-svg';
import { styleSettings } from './Shimmer.styling.win32';
import { shimmerName, ShimmerProps } from './Shimmer.types';
import { ShimmerType } from './Shimmer.types.win32';
import { RCTNativeAnimatedShimmer } from './consts.win32';
import { convertRectToSvgPath, convertCircleToSvgPath } from './SvgShapeToPath';
import { withSlots } from '@fluentui-react-native/framework';

export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  ...styleSettings,

  slots: {
    root: View,
    clippingMask: Svg,
    shimmerWaveContainer: RCTNativeAnimatedShimmer,
    shimmerWave: Svg,
  },

  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const useStyling = buildUseStyling(styleSettings);

    return (rest: ShimmerProps) => {
      const { elements, ...mergedProps } = mergeProps(props, rest);
      const Slots = useSlots(mergedProps);
      const { root, shimmerWaveContainer, shimmerWave, clippingMask } = useStyling(mergedProps);

      const controlWidth: number | string = mergedProps?.style['width'];
      const controlHeight: number | string = mergedProps?.style['height'];

      // in theory we should do something like this to unionize the clippaths instead of having overlap
      // let paths = [
      //   <Path
      //     d={'M 0 0 h ' + controlWidth + ' v ' + controlHeight + ' h ' + -controlWidth + ' v ' + -controlHeight + ' z '}
      //     clipRule="evenodd"
      //   />,
      // ];
      // if (elements) {
      //   for (let i = 0; i < elements.length; i++) {
      //     const element = elements[i];
      //     const path = element.type === 'circle' ? convertCircleToSvgPath(element) : convertRectToSvgPath(element);
      //     paths = paths.concat(<Path key={i} d={path} clipRule="evenodd" />);
      //   }
      // }

      // Win32 D2D1 doesn't directly support SVG mask elements, so we're going to generate a mask
      // by authoring a clip path for the same effect.  We do so utilizing the clip-rule='evenodd'
      // and drawing a rectangle around the entire svg viewbox, causing all inner elements to be "clipped out"
      // instead of "clipped around," generating the visual we desire with the linear gradient below the mask.
      let clipPathsAsMask = ['M 0 0 h ' + controlWidth + ' v ' + controlHeight + ' h ' + -controlWidth + ' v ' + -controlHeight + ' z '];

      /**
       * Now extend the path to include the provided element shapes, with their path parameter strings generated from their corresponding properties.
       * Ideally this would be better possible with functions from the shape elements themselves and not to rely on our own calculations.
       */
      if (elements) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          clipPathsAsMask = clipPathsAsMask.concat(
            element.type === 'circle' ? convertCircleToSvgPath(element) : convertRectToSvgPath(element),
          );
        }
      }

      const commonSizing = { width: controlWidth, height: controlHeight };
      const commonSvgProps = { viewBox: '0 0 ' + controlWidth + ' ' + controlHeight };
      return (
        <Slots.root {...root}>
          <Slots.shimmerWaveContainer
            {...shimmerWaveContainer}
            style={{ ...commonSizing, backgroundColor: shimmerWaveContainer.shimmerColor as any }}
          >
            <Slots.shimmerWave {...shimmerWave} {...commonSvgProps} {...commonSizing}>
              <LinearGradient id="gradient" {...commonSizing}>
                <Stop stopColor={shimmerWave.shimmerColor as any} stopOpacity={shimmerWave.gradientOpacity} />
                <Stop offset="20%" stopColor={shimmerWave.shimmerWaveColor as any} stopOpacity={shimmerWave.gradientOpacity} />
                <Stop offset="40%" stopColor={shimmerWave.shimmerColor as any} stopOpacity={shimmerWave.gradientOpacity} />
              </LinearGradient>
              <Rect {...commonSizing} fill="url(#gradient)" />
            </Slots.shimmerWave>
          </Slots.shimmerWaveContainer>
          <Slots.clippingMask {...clippingMask} {...commonSvgProps} style={{ ...commonSizing }}>
            <ClipPath id="shimmerCuts">
              <Path d={clipPathsAsMask.join(' ')} clipRule="evenodd" />
            </ClipPath>
            <Rect {...commonSizing} fill={clippingMask.shimmerBackground as any} clipPath="url(#shimmerCuts)" />
          </Slots.clippingMask>
        </Slots.root>
      );
    };
  },
});
