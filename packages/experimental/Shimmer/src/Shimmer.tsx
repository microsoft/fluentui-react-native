/** @jsx withSlots */
import { useRef, useEffect, useMemo } from 'react';
import { Circle, ClipPath, Defs, Image, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';
import { shimmerName, ShimmerProps, ShimmerType } from './Shimmer.types';
import { compose, mergeProps, withSlots, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { Animated } from 'react-native';
import { stylingSettings } from './Shimmer.styling';

export function useShimmerAnimation(memoData: any) {
  const startValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(startValue, {
          toValue: memoData.toValue,
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
    image: Image,
  },
  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const Slots = useSlots(props);
    const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
    const tokens = useStyling(props).root;

    const memoizedShimmerData = useMemo(
      () => ({
        shimmerWaveColor: props.shimmerWaveColor ? props.shimmerWaveColor : tokens['shimmerWaveColor'],
        shimmerColor: props.shimmerColor ? props.shimmerColor : tokens['shimmerColor'],
        containerWidth: props?.style['width'] ? props?.style['width'] : tokens['width'],
        containerHeight: props?.style['height'] ? props?.style['height'] : tokens['height'],
        delay: props.delay ? props.delay : tokens['delay'],
        duration: props.duration ? props.duration : tokens['duration'],
        angle: props.angle ? props.angle : tokens['angle'],
        gradientOpacity: tokens['gradientOpacity'],
      }),
      [
        props.shimmerWaveColor,
        props.shimmerColor,
        props.style,
        props.style,
        props.delay,
        props.duration,
        props.angle,
        props.gradientOpacity,
      ],
    );

    const startValue = useShimmerAnimation(memoizedShimmerData);

    return (rest: ShimmerProps) => {
      const { uri, elements, ...mergedProps } = mergeProps(props, rest);
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
          }
        }
      }

      return (
        <Slots.root {...mergedProps}>
          <Defs>
            <AnimatedLinearGradient id="gradient" x1={startValue} y1={memoizedShimmerData.angle} x2="-1" y2="-1">
              <Stop
                offset="10%"
                stopColor={uri ? memoizedShimmerData.shimmerWaveColor : memoizedShimmerData.shimmerColor}
                stopOpacity={uri ? '0' : '1'}
              />
              <Stop offset="20%" stopColor={memoizedShimmerData.shimmerWaveColor} stopOpacity={memoizedShimmerData.gradientOpacity} />
              <Stop
                offset="30%"
                stopColor={uri ? memoizedShimmerData.shimmerWaveColor : memoizedShimmerData.shimmerColor}
                stopOpacity={uri ? '0' : '1'}
              />
            </AnimatedLinearGradient>
            <ClipPath id="shimmerView">{rows}</ClipPath>
          </Defs>
          {uri && <Slots.image href={props.uri} />}
          <Rect
            x="0"
            y="0"
            width={memoizedShimmerData.containerWidth}
            height={memoizedShimmerData.containerHeight}
            fill="url(#gradient)"
            clipPath={!uri ? 'url(#shimmerView)' : null}
          />
        </Slots.root>
      );
    };
  },
});
