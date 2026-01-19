/** @jsxImportSource @fluentui-react-native/framework-base */
import { useRef, useEffect, useCallback } from 'react';
import { Animated, Easing, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, buildUseStyling } from '@fluentui-react-native/framework';
import { Svg, Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

import { diameterSizeMap, lineThicknessSizeMap, stylingSettings } from './ActivityIndicator.styling';
import type { ActivityIndicatorProps, FluentActivityIndicatorType } from './ActivityIndicator.types';
import { activityIndicatorName } from './ActivityIndicator.types';

const getActivityIndicatorPath = (diameter: number, width: number, color: string) => {
  const start = {
    x: width / 2,
    y: diameter / 2,
  };
  const innerRadius = diameter / 2 - width / 2;
  const path = `M${start.x} ${start.y} a${innerRadius} ${innerRadius} 0 1 1 ${innerRadius} ${innerRadius}`;

  return <Path d={path} stroke={color} strokeWidth={width} strokeLinecap="round" fill={'transparent'} />;
};

export const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const useStyling = buildUseStyling(stylingSettings);
export const ActivityIndicator = compose<FluentActivityIndicatorType>({
  displayName: activityIndicatorName,
  ...stylingSettings,
  slots: {
    root: View,
    svg: AnimatedSvg,
  },
  useRender: (props: ActivityIndicatorProps, useSlots: UseSlots<FluentActivityIndicatorType>) => {
    const Slots = useSlots(props);
    const slotProps = useStyling(props);

    const animating = props.animating != undefined ? props.animating : true;
    const hidesWhenStopped = props.hidesWhenStopped != undefined ? props.hidesWhenStopped : true;
    // React Native ActivityIndicator still takes up space when hidden, so to perfectly match would use opacity
    // hiding opacity makes the screen reader on iOS and Android skip over it
    const hideOpacity = animating == false && hidesWhenStopped == true ? 0 : 1;

    const rotationAngle = useRef(new Animated.Value(0)).current;

    const rotationAnimation = useRef<Animated.CompositeAnimation | undefined>(undefined);

    /**
     * https://github.com/facebook/react-native/pull/29585
     * For Animated.loop() to work with the native driver, React Native needs this fix.
     * It's only available in React Native 0.66+, and React Native macOS 0.62+
     * To workaround this, let's just rerun the loop everytime the animation finishes
     */
    const startRotation = useCallback(() => {
      if (rotationAnimation.current) {
        rotationAngle.setValue(0);
        rotationAnimation.current.reset();
        rotationAnimation.current.start((result: Animated.EndResult) => {
          if (result.finished) {
            startRotation();
          }
        });
      }
    }, [rotationAngle, animating]);

    const stopRotation = () => {
      if (rotationAnimation.current) {
        rotationAnimation.current.stop();
      }
    };

    useEffect(() => {
      if (rotationAnimation.current === undefined) {
        rotationAnimation.current = Animated.sequence([
          Animated.timing(rotationAngle, {
            toValue: 359,
            duration: 750,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
        ]);
      }

      if (animating) {
        startRotation();
      } else {
        stopRotation();
      }
    }, [animating, hidesWhenStopped, rotationAngle]);

    const interpolateSpin = rotationAngle.interpolate({
      inputRange: [0, 359],
      outputRange: ['0deg', '359deg'],
    });

    const path = getActivityIndicatorPath(
      diameterSizeMap[slotProps.root.size],
      lineThicknessSizeMap[slotProps.root.lineThickness],
      slotProps.root.activityIndicatorColor,
    );

    // perspective is needed for animations to work on Android. See https://reactnative.dev/docs/animations#bear-in-mind
    const animatedSvgProps: SvgProps = {
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
