/** @jsx withSlots */
import { compose, mergeProps, withSlots, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { View } from 'react-native';
import { useMemo } from 'react';
import { Svg, Circle, ClipPath, Defs, LinearGradient, Rect, Stop, Path, FillRule, G, Use } from 'react-native-svg';
import { stylingSettings } from './Shimmer.styling.win32';
import { shimmerName, ShimmerProps, ShimmerType } from './Shimmer.types.win32';
import { RCTNativeAnimatedShimmer } from './consts';

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

// eslint-disable-next-line no-import-assign
// const useStyling = buildUseStyling(stylingSettings);

let alternator = 0;
const chooseRule = 0;
function getClipRule(val: number): FillRule | undefined {
  if (chooseRule) {
    //
  }
  alternator = alternator === 0 ? 1 : 0;
  if (val === 0) {
    return 'evenodd';
  } else if (val === 1) {
    return 'nonzero';
  } else if (val === 5) {
    if (alternator === 0) {
      return 'evenodd';
    } else {
      return 'nonzero';
    }
  } else {
    return undefined;
  }
}
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
    // const tokens = useStyling(props).root;
    // const memoizedShimmerData = useMemo(
    //   () => ({
    //     gradientTintColor: props.gradientTintColor ? props.gradientTintColor : tokens['gradientTintColor'],
    //     shimmerTintColor: props.shimmerTintColor ? props.shimmerTintColor : tokens['shimmerTintColor'],
    //     delay: props.delay ? props.delay : tokens['delay'],
    //     duration: props.duration ? props.duration : tokens['duration'],
    //     angle: props.angle ? props.angle : tokens['angle'],
    //     gradientOpacity: tokens['gradientOpacity'],
    //     shimmerWidth: tokens['shimmerWidth'],
    //   }),
    //   [
    //     props.gradientTintColor,
    //     props.shimmerTintColor,
    //     props.delay,
    //     props.duration,
    //     props.angle,
    //     props.gradientOpacity,
    //     props.shimmerWidth,
    //   ],
    // );

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
                fill="#FF000000"
                clipRule={getClipRule(chooseRule)}
              />,
            );
          } else if (element.type == 'circle') {
            rows.push(
              <Circle
                key={i}
                r={element.height / 2}
                cx={element.xPos}
                cy={element.yPos}
                fill="#0000FF00"
                clipRule={getClipRule(chooseRule)}
              />,
            );
            // rows.push(
            //   <Circle key={i + 1} r={element.height / 3} cx={element.xPos} cy={element.yPos} fill="#0000FF00" clipRule="nonzero" />,
            // );
            // rows.push(
            //   <Circle key={i + 2} r={element.height / 4} cx={element.xPos} cy={element.yPos} fill="#0000FF00" clipRule="evenodd" />,
            // );
          }
        }
      }

      return (
        <Slots.root {...mergedProps}>
          <Slots.shimmerWaveContainer>
            <Slots.shimmerWave>
              <Defs>
                <LinearGradient id="gradient">
                  {/* <Stop offset="10%" stopColor={memoizedShimmerData.shimmerTintColor} stopOpacity="1" />
                  <Stop offset="20%" stopColor={memoizedShimmerData.gradientTintColor} stopOpacity={memoizedShimmerData.gradientOpacity} />
                  <Stop offset="30%" stopColor={memoizedShimmerData.shimmerTintColor} stopOpacity="1" /> */}
                  <Stop offset="10%" stopColor={'red'} stopOpacity="1" />
                  <Stop offset="20%" stopColor={'green'} stopOpacity="1" />
                  <Stop offset="30%" stopColor={'blue'} stopOpacity="1" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="400" height="200" fill="url(#gradient)" />
            </Slots.shimmerWave>
          </Slots.shimmerWaveContainer>
          <Slots.clippingMask>
            <Defs>
              <G id="rows">{rows}</G>
            </Defs>
            <ClipPath id="shimmerView">
              <Use href="#rows" />
              {/* <Path d="M50,0 21,90 98,35 2,35 79,90z" id="star" clipRule={getClipRule(chooseRule)} />
                <Path fill="#EDEBEA" d="M48.855,24.292H24.117V9.439L48.855,24.292z" clipRule={getClipRule(chooseRule)} />
                <Path fill="#EDEBEA" d="M6.84,8.939h24.73v24.733L6.864,8.939z" clipRule={getClipRule(chooseRule)} />
                <Path fill="#EDEBEA" d="M24.118,49.73V25.005h24.737L24.118,469.73z" clipRule={getClipRule(chooseRule)} />
                <Path fill="#EDEBEA" d="M21.594,25.005V49.73H6.83L21.594,25.005z" clipRule={getClipRule(chooseRule)} /> */}
            </ClipPath>
            <Rect x="0" y="0" width="400" height="200" fill="#AA00F000" clipPath="url(#shimmerView)" />
          </Slots.clippingMask>
        </Slots.root>
      );
    };
  },
});
