/** @jsx withSlots */
import { useState, useEffect, useMemo } from "react";
import { Circle, ClipPath, Defs, Image, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';
import { ShimmerElementType, shimmerName, ShimmerProps, ShimmerType } from './Shimmer.types';
import { compose, mergeProps, withSlots, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { Animated } from 'react-native';
import { stylingSettings } from './Shimmer.styling';

export function useShimmerAnimation(memoData: any) {
  let startValue = useState(new Animated.Value(0))[0]
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(startValue, {
          toValue: memoData.toValue,
          duration: memoData.duration,
          delay: memoData.delay,
          useNativeDriver: false
        })]),
    ).start()
  })
  return startValue;
}

const useStyling = buildUseStyling(stylingSettings);
export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  ...stylingSettings,
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
        containerWidth: props.width ? props.width : tokens['width'],
        containerHeight: props.height ? props.height : tokens['height'],
        toValue: props.toValue ? props.toValue : tokens['toValue'],
        delay: props.delay ? props.delay : tokens['delay'],
        duration: props.duration ? props.duration : tokens['duration'],
        angle: props.angle ? props.angle : tokens['angle'],
      }),
      [props.gradientTintColor, props.shimmerTintColor, props.width, props.height, props.toValue, props.delay, props.duration],
    );

    let startValue = useShimmerAnimation(memoizedShimmerData);

    return (rest: ShimmerProps) => {
      const { circle, rect, uri, elements, ...mergedProps } = mergeProps(props, rest);
      console.log(memoizedShimmerData.angle);
      if (elements) {
        var rows = [];
        for (var i = 0; i < elements.length; i++) {
          const element = elements[i];
          if (element.type == ShimmerElementType.rect) {
            rows.push(<Slots.rect key={i} width={element.width} x={element.xPos} y={element.yPos} rx={element.cornerRadius} ry={element.cornerRadius} />);
          } else if (element.type == ShimmerElementType.circle) {
            rows.push(<Slots.circle key={i} r={element.height / 2} cx={element.xPos} cy={element.yPos} />);
          }
        }
      }
      return (
        <Slots.root {...mergedProps}>
          <Defs>
            <AnimatedLinearGradient id="gradient" x1={startValue} y1={memoizedShimmerData.angle} x2="-1" y2="-1" >
              <Stop offset="10%" stopColor={uri ? memoizedShimmerData.gradientTintColor : memoizedShimmerData.shimmerTintColor} stopOpacity={uri ? "0" : "1"} />
              <Stop offset="20%" stopColor={memoizedShimmerData.gradientTintColor} stopOpacity=".7" />
              <Stop offset="30%" stopColor={uri ? memoizedShimmerData.gradientTintColor : memoizedShimmerData.shimmerTintColor} stopOpacity={uri ? "0" : "1"} />
            </AnimatedLinearGradient>
          </Defs>
          {uri && <Slots.image href={props.uri} />}
          <ClipPath id="shimmerView">
            {rows}
            {rect && <Slots.rect width={props.rect.width} x={props.rect.x} y={props.rect.y} />}
            {circle && <Slots.circle cx={props.circle.cx} cy={props.circle.cy} r={props.circle.r} />}
          </ClipPath>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#gradient)"
            clipPath="url(#shimmerView)"
          />
        </Slots.root>
      );
    }
  },
});