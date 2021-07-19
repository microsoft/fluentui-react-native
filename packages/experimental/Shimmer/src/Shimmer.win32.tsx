/** @jsx withSlots */
import { compose, mergeProps, withSlots, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { View } from 'react-native';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { useMemo } from 'react';
import { Svg, Circle, ClipPath, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { stylingSettings } from './Shimmer.styling.win32';
import { shimmerName, ShimmerProps, ShimmerType } from './Shimmer.types.win32';

// Keep as a reference for authoring the shimmer the same

// export function useShimmerAnimation(memoData: any) {
//   const startValue = useRef(new Animated.Value(0)).current;
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(startValue, {
//           toValue: memoData.toValue,
//           duration: memoData.duration,
//           delay: memoData.delay,
//           useNativeDriver: false,
//         }),
//       ]),
//     ).start();
//   });
//   return startValue;
// }

const RCTNativeAnimatedShimmer = ensureNativeComponent('RCTNativeAnimatedShimmer');

// eslint-disable-next-line no-import-assign
const useStyling = buildUseStyling(stylingSettings);
export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,

  ...stylingSettings,

  slots: {
    root: View,
    clippingMask: Svg,
    shimmerWaveContainer: RCTNativeAnimatedShimmer,
    shimmerWave: Svg,
  },

  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const Slots = useSlots(props);
    const tokens = useStyling(props).root;
    const memoizedShimmerData = useMemo(
      () => ({
        gradientTintColor: props.gradientTintColor ? props.gradientTintColor : tokens['gradientTintColor'],
        shimmerTintColor: props.shimmerTintColor ? props.shimmerTintColor : tokens['shimmerTintColor'],
        delay: props.delay ? props.delay : tokens['delay'],
        duration: props.duration ? props.duration : tokens['duration'],
        angle: props.angle ? props.angle : tokens['angle'],
        gradientOpacity: tokens['gradientOpacity'],
        shimmerWidth: tokens['shimmerWidth'],
      }),
      [
        props.gradientTintColor,
        props.shimmerTintColor,
        props.delay,
        props.duration,
        props.angle,
        props.gradientOpacity,
        props.shimmerWidth,
      ],
    );

    return (rest: ShimmerProps) => {
      const { elements, ...mergedProps } = mergeProps(props, rest);
      const rows = [];

      if (elements) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element.type == 'rect') {
            rows.push(
              <Rect
                key={i}
                width={element.width}
                height={element.height}
                x={element.xPos}
                y={element.yPos}
                rx={element.borderRadius}
                ry={element.borderRadius}
                fill="#00000000"
              />,
            );
          } else if (element.type == 'circle') {
            rows.push(<Circle key={i} r={element.height / 2} cx={element.xPos} cy={element.yPos} fill="#00000000" />);
          }
        }
      }

      return (
        <Slots.root {...mergedProps}>
          <Slots.shimmerWaveContainer>
            <Slots.shimmerWave>
              <Defs>
                <LinearGradient id="gradient">
                  <Stop offset="10%" stopColor={memoizedShimmerData.shimmerTintColor} stopOpacity="1" />
                  <Stop offset="20%" stopColor={memoizedShimmerData.gradientTintColor} stopOpacity={memoizedShimmerData.gradientOpacity} />
                  <Stop offset="30%" stopColor={memoizedShimmerData.shimmerTintColor} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="400" height="200" fill="url(#gradient)" />
            </Slots.shimmerWave>
          </Slots.shimmerWaveContainer>
          <Slots.clippingMask>
            <Defs>
              <ClipPath id="shimmerView">{rows}</ClipPath>
            </Defs>
            <Rect x="0" y="0" width="400" height="200" fill="#00000000" clipPath="url(#shimmerView)" />
          </Slots.clippingMask>
        </Slots.root>
      );
    };
  },
});
