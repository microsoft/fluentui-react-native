/** @jsxImportSource @fluentui-react-native/framework-base */
import { useEffect, useCallback } from 'react';
import type { ColorValue } from 'react-native';
import { Animated, Easing, View } from 'react-native';

import { compose, mergeProps } from '@fluentui-react-native/framework';
import type { UseSlots } from '@fluentui-react-native/framework';
import { Path, Svg } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

import { stylingSettings } from './Spinner.styling';
import type { SpinnerProps, SpinnerType } from './Spinner.types';
import { spinnerName } from './Spinner.types';
import { diameterSizeMap, lineThicknessSizeMap } from './SpinnerTokens.win32';
import { useSpinner } from './useSpinner';

const getSpinnerPath = (diameter: number, width: number, color: ColorValue) => {
  const start = {
    x: width / 2,
    y: diameter / 2,
  };
  const innerRadius = diameter / 2 - width / 2;
  const path = `M${start.x} ${start.y} a${innerRadius} ${innerRadius} 0 1 1 ${innerRadius} ${innerRadius}`;

  return <Path d={path} stroke={color} strokeWidth={width} strokeLinecap="round" />;
};

export const AnimatedSvg = Animated.createAnimatedComponent(Svg);
export const Spinner = compose<SpinnerType>({
  displayName: spinnerName,
  ...stylingSettings,
  slots: {
    root: View,
    svg: AnimatedSvg,
  },
  useRender: (props: SpinnerProps, useSlots: UseSlots<SpinnerType>) => {
    const spinnerProps = useSpinner(props);
    const Slots = useSlots(spinnerProps);
    const status = props.status !== undefined ? props.status : 'active';
    const hidesWhenStopped = props.hidesWhenStopped != undefined ? props.hidesWhenStopped : true;
    const hideOpacity = status === 'inactive' && hidesWhenStopped == true ? 0 : 1;
    const rotationAngle = new Animated.Value(0);

    const startRotation = useCallback(() => {
      Animated.loop(
        Animated.timing(rotationAngle, {
          toValue: 360,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }, [rotationAngle, status]);

    const stopRotation = () => {
      rotationAngle.stopAnimation();
    };

    useEffect(() => {
      Animated.loop(
        Animated.timing(rotationAngle, {
          toValue: 360,
          duration: 750,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      if (status === 'active') {
        startRotation();
      } else {
        stopRotation();
      }
    }, [status, hidesWhenStopped, rotationAngle]);

    const interpolateSpin = rotationAngle.interpolate({
      inputRange: [0, 359],
      outputRange: ['0deg', '359deg'],
    });

    const path = getSpinnerPath(diameterSizeMap[spinnerProps.size], lineThicknessSizeMap[spinnerProps.size], spinnerProps.trackColor);

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
      accessibilityState: { busy: status === 'active' },
    };
    return (rest: SpinnerProps) => {
      const { ...mergedProps } = mergeProps(props, rest, otherRootProps);
      return (
        <Slots.root {...mergedProps}>
          <Slots.svg {...animatedSvgProps}>{path}</Slots.svg>
        </Slots.root>
      );
    };
  },
});
