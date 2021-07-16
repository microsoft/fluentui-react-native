/** @jsx withSlots */
import { useRef, useEffect } from 'react';
import { Animated, Easing, View } from 'react-native';
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
    const slotProps = useStyling(props);

    const animating = props.animating != undefined ? props.animating : true;
    const hidesWhenStopped = props.hidesWhenStopped != undefined ? props.hidesWhenStopped : true;
    // React Native ActivityIndicator still takes up space when hidden, so to perfectly match would use opacity
    // hiding opacity makes the screen reader on iOS and Android skip over it
    const hideOpacity = animating == false && hidesWhenStopped == true ? 0 : 1;

    const spinAnimation = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      if (animating) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(spinAnimation, {
              toValue: 359,
              duration: 750,
              useNativeDriver: false,
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

    const path = getActivityIndicatorPath(
      diameterSizeMap[slotProps.root.size],
      lineThicknessSizeMap[slotProps.root.lineThickness],
      slotProps.root.activityIndicatorColor,
    );

    // perspective is needed for animations to work on Android. See https://reactnative.dev/docs/animations#bear-in-mind
    const animatedSvgProps = {
      style: {
        transform: [{ rotateZ: interpolateSpin }, { perspective: 10 }],
      },
    };

    const otherRootProps = {
      style: {
        opacity: hideOpacity,
      },
      accessibilityState: { busy: animating },
    };
    return (rest: ActivityIndicatorProps) => {
      const { ...mergedProps } = mergeProps(props, rest, otherRootProps);
      return (
        <Slots.root {...mergedProps}>
          <Slots.svg {...animatedSvgProps}>{path}</Slots.svg>
        </Slots.root>
      );
    };
  },
});
