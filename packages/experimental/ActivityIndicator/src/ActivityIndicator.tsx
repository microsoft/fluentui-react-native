/** @jsx withSlots */
import { useRef, useEffect, useMemo } from 'react';
import { Animated, Easing, View, Platform } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { compose, mergeProps, withSlots, UseSlots, buildUseStyling } from '@fluentui-react-native/framework';
import { activityIndicatorName, ActivityIndicatorProps, ActivityIndicatorType } from './ActivityIndicator.types';
import { diameterSizeMap, lineThicknessSizeMap, stylingSettings } from './ActivityIndicator.styling';

const getActivityIndicatorPath = (diameter: number, width: number, color: string) => {
  const start = {
    x: width / 2,
    y: diameter / 2,
  };
  const innerRadius = diameter / 2 - width / 2;
  const path = `M${start.x} ${start.y} a${innerRadius} ${innerRadius} 0 1 1 ${innerRadius} ${innerRadius}`;

  return <Path d={path} stroke={color} strokeWidth={width} strokeLinecap="round" />;
};

export const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const useStyling = buildUseStyling(stylingSettings);
export const ActivityIndicator = compose<ActivityIndicatorType>({
  displayName: activityIndicatorName,
  ...stylingSettings,
  slots: {
    root: View,
    svg: AnimatedSvg,
  },
  render: (props: ActivityIndicatorProps, useSlots: UseSlots<ActivityIndicatorType>) => {
    const Slots = useSlots(props);
    const tokens = useStyling(props).root;

    const memoizedActivityIndicatorData = useMemo(
      () => ({
        activityIndicatorColor: props.activityIndicatorColor ? props.activityIndicatorColor : tokens['activityIndicatorColor'],
        size: props.size ? diameterSizeMap[props.size] : diameterSizeMap[tokens['size']],
        lineThickness: props.lineThickness
          ? lineThicknessSizeMap[props.lineThickness]
          : props.size
          ? lineThicknessSizeMap[props.size]
          : lineThicknessSizeMap[tokens['lineThickness']],
        animating: props.animating != undefined ? props.animating : true,
        hidesWhenStopped: props.hidesWhenStopped != undefined ? props.hidesWhenStopped : true,
      }),
      [props.activityIndicatorColor, props.size, props.lineThickness, props.animating, props.hidesWhenStopped],
    );

    const spinAnimation = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      if (memoizedActivityIndicatorData.animating) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(spinAnimation, {
              toValue: 359,
              duration: 750,
              useNativeDriver: Platform.OS == 'ios' || Platform.OS == 'android',
              easing: Easing.linear,
            }),
          ]),
        ).start();
      } else {
        spinAnimation.stopAnimation();
      }
    });
    const interpolateSpin = spinAnimation.interpolate({
      inputRange: [0, 359],
      outputRange: ['0deg', '359deg'],
    });

    // React Native ActivityIndicator still takes up space when hidden, so to perfectly match would use opacity
    // hiding opacity makes the screen reader on iOS and Android skip over it
    const hideOpacity = memoizedActivityIndicatorData.animating == false && memoizedActivityIndicatorData.hidesWhenStopped == true ? 0 : 1;

    // Depends on size, line thickness and color after memoization so can't be in the memo itself
    const path = getActivityIndicatorPath(
      memoizedActivityIndicatorData.size,
      memoizedActivityIndicatorData.lineThickness,
      memoizedActivityIndicatorData.activityIndicatorColor as string,
    );

    // props for the AnimatedSvg, which is Slots.svg
    const otherSvgProps = {
      width: memoizedActivityIndicatorData.size,
      height: memoizedActivityIndicatorData.size,
      style: {
        transform: [{ rotateZ: interpolateSpin }, { perspective: 10 }],
        opacity: hideOpacity,
      },
    };

    const otherRootProps = {
      style: {
        opacity: hideOpacity,
      },
      accessibilityState: { busy: memoizedActivityIndicatorData.animating },
    };
    return (rest: ActivityIndicatorProps) => {
      const { ...mergedProps } = mergeProps(props, rest, otherRootProps);
      return (
        <Slots.root {...mergedProps}>
          <Slots.svg {...otherSvgProps}>{path}</Slots.svg>
        </Slots.root>
      );
    };
  },
});
