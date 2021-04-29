/** @jsx withSlots */
import { useState, useEffect, useMemo } from "react";
import { Circle, ClipPath, Defs, LinearGradient, Rect, Stop, Svg, Image } from 'react-native-svg';
import { shimmerName, ShimmerProps, ShimmerType } from './Shimmer.types';
import { compose, mergeProps, withSlots, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { Animated } from 'react-native';
import { stylingSettings } from './Shimmer.styling';

export function renderAnimations(memoData: any) {
  let startValue = useState(new Animated.Value(0))[0]
  useEffect(() => {
  Animated.loop(
    Animated.sequence([
    Animated.timing(startValue, {
      toValue: memoData.toValue,
      duration: memoData.duration,
      delay: memoData.delay,
      useNativeDriver:false
    })]),
  ).start()
  })
  return startValue;
}

const useStyling = buildUseStyling(stylingSettings);
export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  ...stylingSettings,
  tokensThatAreAlsoProps: ['duration', 'shimmerTintColor', 'gradientTintColor', 'toValue', 'delay'],
  slots: {
    root: Svg,
    rect: Rect,
    circle: Circle,
    image: Image,
  },
  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const Slots = useSlots(props);
    let AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
    const tokens = useStyling(props).root;

    const memoizedShimmerData = useMemo(
      () => ({
        gradientTintColor: props.gradientTintColor ? props.gradientTintColor : tokens['gradientTintColor'],
        shimmerTintColor: props.shimmerTintColor ? props.shimmerTintColor : tokens['shimmerTintColor'],
        containerWidth: props.containerWidth ? props.containerWidth : tokens['containerWidth'],
        containerHeight: props.containerHeight ? props.containerHeight : tokens['containerHeight'],
        toValue: props.toValue ? props.toValue : tokens['toValue'],
        delay: props.delay ? props.delay : tokens['delay'],
        duration: props.duration ? props.duration : tokens['duration'],
      }),
      [props.gradientTintColor, props.shimmerTintColor, props.containerWidth, props.containerHeight, props.toValue, props.delay, props.duration],
    );

    let startValue = renderAnimations(memoizedShimmerData);

    return (rest: ShimmerProps) => {
      const { circle, rect, uri, ...mergedProps } = mergeProps(props, rest);
          return (
            <Slots.root {...mergedProps}>
              <Defs>
                <AnimatedLinearGradient id="gradient" x1={startValue} y1="0" x2="-1" y2="-1" >
                  <Stop offset="10%" stopColor={uri ? memoizedShimmerData.gradientTintColor: memoizedShimmerData.shimmerTintColor } stopOpacity={uri ? "0" : "1"} />
                  <Stop offset="20%" stopColor={memoizedShimmerData.gradientTintColor} stopOpacity={uri ? "0.7" : "1"} />
                  <Stop offset="30%" stopColor={uri ? memoizedShimmerData.gradientTintColor : memoizedShimmerData.shimmerTintColor} stopOpacity={uri ? "0" : "1"} />
              </AnimatedLinearGradient>
              </Defs>
              {uri && <Slots.image href={props.uri} />}
            <ClipPath id="shimmerView">
              {rect && <Slots.rect width={props.rect.width} x={props.rect.x}  y={props.rect.y}/> }
              {circle && <Slots.circle cx={props.circle.cx} cy={props.circle.cy}  r={props.circle.r}/> }
            </ClipPath>
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
    }
  },
});