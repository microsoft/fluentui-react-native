/** @jsx withSlots */
import { useState, useEffect, useMemo } from "react";
import { Defs, LinearGradient, Rect, Stop, Svg, Image, Circle, ClipPath} from 'react-native-svg';
import { shimmerName, ShimmerProps, ShimmerType } from './Shimmer.types';
import { mergeProps } from '../../../framework/merge-props/lib/mergeProps';
import { buildUseStyling, compose, UseSlots, withSlots } from '../../../experimental/framework/lib';
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
  slots: { root: Svg },
  render: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const Root = useSlots(props).root;
    let AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
    const tokens = useStyling(props).root.style;

    const memoizedShimmerData = useMemo(
      () => ({
        gradientTintColor: props.gradientTintColor ? props.gradientTintColor : tokens['gradientTintColor'],
        shimmerTintColor: props.shimmerTintColor ? props.shimmerTintColor : tokens['shimmerTintColor'],
        width: props.width ? props.width : tokens['width'],
        height: props.height ? props.height : tokens['height'],
        toValue: props.toValue ? props.toValue : tokens['toValue'],
        delay: props.delay ? props.delay : tokens['delay'],
        duration: props.duration ? props.duration : tokens['duration'],
      }),
      [props.gradientTintColor, props.shimmerTintColor, props.width, props.height, props.toValue, props.delay, props.duration],
    );

    let startValue = renderAnimations(memoizedShimmerData);

    if(props.element == 'lines') {
      return (rest: ShimmerProps) => <Root {...mergeProps(props, rest)}>
      <Defs>
          <AnimatedLinearGradient id="gradient" x1={startValue} y1="0" x2="-1" y2="-1" >
          <Stop offset="10%" stopColor={memoizedShimmerData.shimmerTintColor} stopOpacity="1" />
           <Stop offset="20%" stopColor={memoizedShimmerData.gradientTintColor} stopOpacity="1" />
           <Stop offset="30%" stopColor={memoizedShimmerData.shimmerTintColor} stopOpacity="1" />
          </AnimatedLinearGradient>
         <ClipPath id="shimmerView">
         <Circle cx="80" cy="80" r="55"/>
             <Rect x="150" y="30" width="450" height="25" rx="3" ry="3" />
           <Rect x="150" y="68" width="300" height="25" rx="3" ry="3"/>
             <Rect x="150" y="105" width="250" height="25" rx="3" ry="3"/>
             </ClipPath>
          </Defs>
              <Rect
                x="0"
                y="0"
                width="500"
                height="200"
                fill="url(#gradient)"
                clipPath="url(#shimmerView)"
              />
     </Root>
    }
    else {
      return (rest: ShimmerProps) => <Root {...mergeProps(props, rest)}>
      <Defs>
      <AnimatedLinearGradient id="grad" x1={startValue} y1="0" x2="-1" y2="-1" >
       <Stop offset="10%" stopColor={memoizedShimmerData.gradientTintColor} stopOpacity="0" />
       <Stop offset="20%" stopColor={memoizedShimmerData.gradientTintColor} stopOpacity=".7"/>
       <Stop offset="30%" stopColor={memoizedShimmerData.gradientTintColor} stopOpacity="0" />
     </AnimatedLinearGradient>
     </Defs>
     <Image href={props.uri} />
     <Rect
         x="0"
         y="0"
         width={memoizedShimmerData.width}
         height={memoizedShimmerData.height}
         fill="url(#grad)"
     />
     </Root>
    }
  },
});