/** @jsx withSlots */
import { useRef, useEffect, useMemo } from 'react';
import { Circle, ClipPath, Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';
import { shimmerName, ShimmerProps, ShimmerType } from './Shimmer.types';
import { compose, mergeProps, withSlots, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { Animated } from 'react-native';
import { stylingSettings } from './Shimmer.styling';
import assertNever from 'assert-never';

export function useShimmerAnimation(memoData: any) {
  const startValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(startValue, {
          toValue: 30,
          duration: memoData.duration,
          delay: memoData.delay,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  });
  return startValue;
}

const useStyling = buildUseStyling(stylingSettings);
export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  ...stylingSettings,
  slots: {
    root: Svg,
  },
  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const Slots = useSlots(props);
    const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
    const tokens = useStyling(props).root;

    const memoizedShimmerData = useMemo(
      () => ({
        angle: props.angle ? props.angle : tokens['angle'],
        containerWidth: props?.style['width'] ? props?.style['width'] : '100%',
        containerHeight: props?.style['height'] ? props?.style['height'] : '100%',
        delay: props.delay ? props.delay : tokens['delay'],
        duration: props.duration ? props.duration : tokens['duration'],
        shimmerColor: props.shimmerColor ? props.shimmerColor : tokens['shimmerColor'],
        shimmerColorOpacity: tokens['shimmerColorOpacity'],
        shimmerWaveColor: props.shimmerWaveColor ? props.shimmerWaveColor : tokens['shimmerWaveColor'],
        shimmerWaveColorOpacity: tokens['shimmerWaveColorOpacity'],
      }),
      [
        props.angle,
        props.delay,
        props.duration,
        props.shimmerColor,
        props.shimmerColorOpacity,
        props.shimmerWaveColor,
        props.shimmerWaveColorOpacity,
        props.style,
      ],
    );

    const startValue = useShimmerAnimation(memoizedShimmerData);

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
                x={element.x}
                y={element.y}
                rx={element.borderRadiusX}
                ry={element.borderRadiusY}
              />,
            );
          } else if (element.type == 'circle') {
            rows.push(<Circle key={i} r={element.radius} cx={element.cx} cy={element.cy} />);
          } else {
            assertNever(element);
          }
        }
      }

      return (
        <Slots.root {...mergedProps}>
          <Defs>
            <AnimatedLinearGradient id="gradient" x1={startValue} y1={memoizedShimmerData.angle} x2="-1" y2="-1">
              <Stop offset="10%" stopColor={memoizedShimmerData.shimmerColor} stopOpacity={memoizedShimmerData.shimmerColorOpacity} />
              <Stop
                offset="20%"
                stopColor={memoizedShimmerData.shimmerWaveColor}
                stopOpacity={memoizedShimmerData.shimmerWaveColorOpacity}
              />
              <Stop offset="30%" stopColor={memoizedShimmerData.shimmerColor} stopOpacity={memoizedShimmerData.shimmerColorOpacity} />
            </AnimatedLinearGradient>
            <ClipPath id="shimmerView">{rows}</ClipPath>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={memoizedShimmerData.containerWidth}
            height={memoizedShimmerData.containerHeight}
            fill="url(#gradient)"
            clipPath="url(#shimmerView)"
          />
        </Slots.root>
      );
    };
  },
});
