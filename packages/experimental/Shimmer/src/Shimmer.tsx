/** @jsxImportSource @fluentui-react-native/framework-base */
import { useRef, useEffect, useMemo, useCallback } from 'react';
import type { ScaleXTransform, TranslateXTransform } from 'react-native';
import { Animated, I18nManager } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, buildUseStyling } from '@fluentui-react-native/framework';
import assertNever from 'assert-never';
import { Circle, ClipPath, Defs, LinearGradient, Rect, Stop, Svg, G } from 'react-native-svg';

import { stylingSettings } from './Shimmer.styling';
import type { ShimmerProps, ShimmerType } from './Shimmer.types';
import { shimmerName } from './Shimmer.types';

const useStyling = buildUseStyling(stylingSettings);
export const Shimmer = compose<ShimmerType>({
  displayName: shimmerName,
  ...stylingSettings,
  slots: {
    root: Svg,
  },
  useRender: (props: ShimmerProps, useSlots: UseSlots<ShimmerType>) => {
    const Slots = useSlots(props);
    props = mergeProps(props, Slots.root({}).props as ShimmerProps);
    const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
    const tokens = useStyling(props).root;
    const memoizedShimmerData = useMemo(
      () => ({
        angle: props.angle ? props.angle : tokens['angle'],
        backgroundColor: props?.style?.['backgroundColor'] ? props?.style['backgroundColor'] : (tokens['backgroundColor'] ?? 'transparent'),
        containerBorderRadius: props?.style?.['borderRadius'] ? props?.style['borderRadius'] : 0,
        containerWidth: props?.style?.['width'] ? props?.style['width'] : '100%',
        containerHeight: props?.style?.['height'] ? props?.style['height'] : '100%',
        delay: props.delay ? props.delay : tokens['delay'],
        duration: props.duration ? props.duration : tokens['duration'],
        shimmerColor: props.shimmerColor ? props.shimmerColor : tokens['shimmerColor'],
        shimmerColorOpacity: tokens['shimmerColorOpacity'],
        shimmerWaveColor: props.shimmerWaveColor ? props.shimmerWaveColor : tokens['shimmerWaveColor'],
        shimmerWaveColorOpacity: tokens['shimmerWaveColorOpacity'],
      }),
      [
        props.angle,
        props.backgroundColor,
        props.delay,
        props.duration,
        props.shimmerColor,
        props.shimmerColorOpacity,
        props.shimmerWaveColor,
        props.shimmerWaveColorOpacity,
        props.style,
      ],
    );

    /* The shimmer animation is implemented using a LinearGradient which travels from left to right.
     * Different angles are handled by rotating this gradient.
     * The startValue is used to control the start position of the gradient animation, it is set as -2 to make sure it is starts off the screen for any angle.
     * Similarly the endValue is set to 3 to make sure the gradient animation exits the entire screen for any angle.
     * In RTL, startValue and endValue are flipped to ensure that the animation moves from right to left.
     */
    const startValue = I18nManager.isRTL ? 3 : -2;
    const endValue = I18nManager.isRTL ? -2 : 3;
    const x1 = useRef(new Animated.Value(startValue)).current;
    const shimmerAnimation = useCallback(() => {
      Animated.loop(
        Animated.timing(x1, {
          toValue: endValue,
          duration: memoizedShimmerData.duration,
          delay: memoizedShimmerData.delay,
          useNativeDriver: true,
        }),
      ).start();
    }, [memoizedShimmerData.delay, memoizedShimmerData.duration]);

    useEffect(() => {
      shimmerAnimation();
    });

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

      // Flip the SVG if we are running in RTL
      const rtlTransfrom: TranslateXTransform & ScaleXTransform = I18nManager.isRTL
        ? { translateX: memoizedShimmerData.containerWidth, scaleX: -1 }
        : { translateX: undefined, scaleX: undefined };

      return (
        <Slots.root {...mergedProps}>
          <Defs>
            <AnimatedLinearGradient id="gradient" x1={x1} x2="-1" gradientTransform={`rotate(${memoizedShimmerData.angle})`}>
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
          <G transformProps={rtlTransfrom}>
            <Rect
              x="0"
              y="0"
              width={memoizedShimmerData.containerWidth}
              height={memoizedShimmerData.containerHeight}
              fill={memoizedShimmerData.backgroundColor}
              rx={memoizedShimmerData.containerBorderRadius}
            />
            <Rect
              x="0"
              y="0"
              width={memoizedShimmerData.containerWidth}
              height={memoizedShimmerData.containerHeight}
              fill="url(#gradient)"
              rx={memoizedShimmerData.containerBorderRadius}
              clipPath="url(#shimmerView)"
            />
          </G>
        </Slots.root>
      );
    };
  },
});
